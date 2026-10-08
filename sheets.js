/* Подключение к Google Таблице «Сервис-радар · Мини-ДОН — данные».
   1) При загрузке применяется снимок таблицы (sheet-data.js), сделанный при последней синхронизации.
   2) Затем дашборд пробует загрузить таблицу напрямую (работает, если доступ «Все, у кого есть ссылка — читатель»). */
const SHEET_ID = '187vwGKd42T1nH9d23lL1wvXHiCN3-OMOEUjZVcV6cvo';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
const SHEET_TABS = ['Отель', 'События', 'Конкуренты', 'Тарифы', 'Акции', 'Общепит', 'Отзывы', 'Метрики', 'Темп', 'Задачи'];
const DATA_SOURCE = { mode: 'demo', at: null, error: null, demoTabs: ['Отзывы', 'Метрики', 'Темп', 'Задачи'] };

function parseDateCell(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) { const d = new Date(v); d.setHours(0, 0, 0, 0); return d; }
  if (typeof v === 'number') { const d = new Date(Math.round((v - 25569) * 86400000)); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
  const s = String(v).trim();
  let m = s.match(/^Date\((\d+),(\d+),(\d+)/); if (m) return new Date(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/); if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return null;
}
const numCell = v => { if (v == null || v === '') return null; if (typeof v === 'number') return v; const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.').replace('%', '')); return isNaN(n) ? null : n; };
const strCell = v => v == null ? '' : String(v).trim();
const yes = v => /^(да|yes|true|1|✓)$/i.test(strCell(v));
const revMap = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v.toLowerCase(), k]));

/* Таблица -> объекты по заголовкам */
function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return [];
  const h = rows[0].map(strCell);
  return rows.slice(1).filter(r => r && r.some(c => c !== '' && c != null)).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
}

function applySheetData(raw) {
  const T = k => rowsToObjects(raw[k]);
  const replace = (arr, items) => { arr.length = 0; items.forEach(x => arr.push(x)); };

  // Отель
  const hotel = Object.fromEntries((raw['Отель'] || []).slice(1).map(r => [strCell(r[0]).toLowerCase(), r[1]]));
  if (hotel['название']) HOTEL.name = strCell(hotel['название']);
  if (hotel['город']) HOTEL.city = strCell(hotel['город']);
  if (numCell(hotel['номеров'])) HOTEL.rooms = numCell(hotel['номеров']);
  if (hotel['адрес']) HOTEL.address = strCell(hotel['адрес']);
  if (numCell(hotel['базовый тариф стандарт'])) HOTEL.baseStd = numCell(hotel['базовый тариф стандарт']);
  if (numCell(hotel['базовый тариф делюкс'])) HOTEL.baseDlx = numCell(hotel['базовый тариф делюкс']);

  // События
  const catR = revMap(EVENT_CATS);
  const impR = { 'высокое': 'high', 'высокий': 'high', 'среднее': 'med', 'средний': 'med', 'низкое': 'low', 'низкий': 'low' };
  const ev = T('События').map((r, i) => {
    const start = parseDateCell(r['Начало']); if (!start || !strCell(r['Событие'])) return null;
    const end = parseDateCell(r['Окончание']) || start;
    return { id: 's' + i, title: strCell(r['Событие']), cat: catR[strCell(r['Категория']).toLowerCase()] || 'culture', start, end: end < start ? start : end, venue: strCell(r['Площадка']) || 'Город', att: numCell(r['Посетители']) || 0, impact: impR[strCell(r['Влияние']).toLowerCase()] || 'low', note: strCell(r['Заметка']), src: strCell(r['Источник']), custom: false };
  }).filter(Boolean).sort((a, b) => a.start - b.start);
  if (ev.length) replace(EVENTS, ev);

  // Конкуренты (наш отель всегда первым)
  const comps = T('Конкуренты').filter(r => strCell(r['ID'])).map(r => ({ id: yes(r['Наш отель']) ? 'us' : strCell(r['ID']), name: strCell(r['Название']), short: strCell(r['Короткое название']) || strCell(r['Название']), type: strCell(r['Тип']), rooms: numCell(r['Номеров']) || 0, rating: numCell(r['Рейтинг']) || 0, dist: strCell(r['Расстояние']) || '—', addr: strCell(r['Адрес']), rating10: numCell(r['Рейтинг Островок /10']), reviews: numCell(r['Отзывов']), src: strCell(r['Источник']), src2: strCell(r['Источник 2']), checked: parseDateCell(r['Проверено']), base: { std: 0, dlx: 0 } }));
  if (comps.length) {
    comps.sort((a, b) => (a.id === 'us' ? -1 : b.id === 'us' ? 1 : 0));
    if (comps[0].id === 'us') { comps[0].short = HOTEL.name; if (!/\(мы\)/.test(comps[0].name)) comps[0].name = HOTEL.name + ' (мы)'; }
    replace(COMPETITORS, comps);
  }
  // Тарифы
  const rates = T('Тарифы');
  if (rates.length) {
    for (const k in RATES) delete RATES[k];
    const idMap = {}; T('Конкуренты').forEach(r => { idMap[strCell(r['ID'])] = yes(r['Наш отель']) ? 'us' : strCell(r['ID']); });
    for (const r of rates) {
      const d = parseDateCell(r['Дата']); const id = idMap[strCell(r['ID объекта'])] || strCell(r['ID объекта']); if (!d || !id) continue;
      RATES[id] = RATES[id] || { std: [], dlx: [] };
      RATES[id].std.push({ date: d, price: numCell(r['Стандарт']) });
      RATES[id].dlx.push({ date: d, price: numCell(r['Делюкс']) });
    }
    buildRateMap();
  }
  // Акции
  const ptR = revMap(PROMO_TYPES);
  const promos = T('Акции').map((r, i) => {
    const t = strCell(r['Тип']); let type = ptR[t.toLowerCase()];
    if (!type && t) { type = 'x' + i; PROMO_TYPES[type] = t; }
    return { id: 'p' + i, comp: strCell(r['ID объекта']), type: type || 'discount', title: strCell(r['Акция']), value: strCell(r['Выгода']), channel: strCell(r['Канал']), found: parseDateCell(r['Найдена']) || TODAY, until: parseDateCell(r['Действует до']) || addDays(TODAY, 30), untilSet: !!parseDateCell(r['Действует до']), isNew: yes(r['Новая']), src: strCell(r['Источник']) };
  }).filter(p => p.title && COMPETITORS.some(c => c.id === p.comp));
  replace(PROMOS, promos);

  // Общепит
  const food = T('Общепит').filter(r => strCell(r['Заведение'])).map((r, i) => ({ id: 'f' + i, found: parseDateCell(r['Найдено']) || TODAY, place: strCell(r['Заведение']), addr: strCell(r['Адрес']), kind: strCell(r['Тип заведения']), type: strCell(r['Тип акции']) || 'Другое', title: strCell(r['Акция']), value: strCell(r['Выгода']), cond: strCell(r['Условия']), until: parseDateCell(r['Действует до']), check: numCell(r['Средний чек']), src: strCell(r['Источник']) }));
  replace(FOOD, food);

  // Внутренние листы без строк — показываем демо
  DATA_SOURCE.demoTabs = ['Отзывы', 'Метрики', 'Темп', 'Задачи'].filter(k => !T(k).length);

  // Отзывы
  const tR = revMap(TOPICS);
  const sR = { 'позитив': 'pos', 'позитивный': 'pos', 'нейтрально': 'neu', 'нейтральный': 'neu', 'негатив': 'neg', 'негативный': 'neg' };
  const reviews = T('Отзывы').map((r, i) => {
    const date = parseDateCell(r['Дата']); const rating = Math.round(numCell(r['Оценка']) || 0); if (!date || !rating) return null;
    const topics = strCell(r['Темы']).split(/[,;]/).map(x => x.trim()).filter(Boolean).map(x => { let k = tR[x.toLowerCase()]; if (!k) { k = 't_' + x.toLowerCase(); TOPICS[k] = x; tR[x.toLowerCase()] = k; } return k; });
    const sentiment = sR[strCell(r['Тон']).toLowerCase()] || (rating >= 4 ? 'pos' : rating === 3 ? 'neu' : 'neg');
    const src = strCell(r['Площадка']) || 'Другое'; if (!SOURCES.includes(src)) SOURCES.push(src);
    return { id: 'r' + i, source: src, author: strCell(r['Автор']) || 'Гость', rating: Math.min(5, Math.max(1, rating)), sentiment, topics, text: strCell(r['Текст']), date, replied: yes(r['Ответ']), stay: strCell(r['Номер']) || '—' };
  }).filter(Boolean).sort((a, b) => b.date - a.date);
  if (reviews.length) replace(REVIEWS, reviews);

  // Метрики
  const chCols = ['Прямые %', 'Островок %', 'Яндекс Путешествия %', 'Суточно.ру %', 'Корпоративные %'];
  const daily = T('Метрики').map(r => {
    const date = parseDateCell(r['Дата']); if (!date) return null;
    const sold = numCell(r['Продано номеров']) || 0, adr = numCell(r['ADR']) || 0;
    const ch = chCols.map(c => numCell(r[c]) || 0); const s = ch.reduce((a, b) => a + b, 0) || 1;
    return { date, sold, occ: sold / HOTEL.rooms, adr, roomRev: sold * adr, extra: numCell(r['Доп. услуги']) || 0, revpar: Math.round(sold * adr / HOTEL.rooms), cancel: numCell(r['Отмены']) || 0, checkins: numCell(r['Заезды']) || 0, los: numCell(r['Ср. срок']) || 0, channels: ch.map(v => v / s) };
  }).filter(Boolean).filter(d => d.date <= TODAY).sort((a, b) => a.date - b.date);
  if (daily.length) replace(DAILY, daily);

  const pace = T('Темп').map(r => ({ date: parseDateCell(r['Дата']), ty: numCell(r['Брони этот год']) || 0, ly: numCell(r['Брони прошлый год']) || 0 })).filter(p => p.date && p.date >= TODAY).sort((a, b) => a.date - b.date).slice(0, 30);
  if (pace.length) replace(PACE, pace);

  const prR = { 'срочно': 'high', 'высокий': 'high', 'обычно': 'med', 'средний': 'med', 'низкий': 'low' };
  const stR = { 'новая': 'open', 'в работе': 'progress', 'готово': 'done', 'выполнено': 'done' };
  const tasks = T('Задачи').filter(r => strCell(r['Задача'])).map((r, i) => ({ id: strCell(r['ID']) || 't' + i, room: strCell(r['Помещение']) || '—', kind: strCell(r['Тип']), title: strCell(r['Задача']), prio: prR[strCell(r['Приоритет']).toLowerCase()] || 'med', status: stR[strCell(r['Статус']).toLowerCase()] || 'open', created: parseDateCell(r['Создана']) || TODAY }));
  if (tasks.length) replace(OPS_TASKS, tasks);
}

/* Снимок из последней синхронизации */
if (window.SHEET_SNAPSHOT) {
  try { applySheetData(window.SHEET_SNAPSHOT.data); DATA_SOURCE.mode = 'snapshot'; DATA_SOURCE.at = new Date(window.SHEET_SNAPSHOT.syncedAt); }
  catch (e) { console.warn('Снимок таблицы не применён', e); }
}

/* Живая загрузка через Google Visualization API (JSONP) */
function loadTabLive(tab, timeout = 9000) {
  return new Promise((resolve, reject) => {
    const cb = '__gv' + Math.random().toString(36).slice(2);
    const sc = document.createElement('script');
    const t = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, timeout);
    function cleanup() { clearTimeout(t); delete window[cb]; sc.remove(); }
    window[cb] = res => {
      cleanup();
      if (!res || res.status === 'error') return reject(new Error('gviz error'));
      const cols = res.table.cols.map(c => c.label || '');
      const rows = res.table.rows.map(r => (r.c || []).map(c => c == null ? '' : (c.v != null && typeof c.v === 'string' && c.v.startsWith('Date(') ? c.v : c.v)));
      resolve([cols, ...rows]);
    };
    sc.onerror = () => { cleanup(); reject(new Error('network')); };
    sc.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=responseHandler:${cb}&headers=1&sheet=${encodeURIComponent(tab)}`;
    document.head.appendChild(sc);
  });
}
async function loadSheetLive() {
  const results = await Promise.all(SHEET_TABS.map(t => loadTabLive(t).then(r => [t, r])));
  const raw = Object.fromEntries(results);
  applySheetData(raw);
  DATA_SOURCE.mode = 'live'; DATA_SOURCE.at = new Date(); DATA_SOURCE.error = null;
  return raw;
}
