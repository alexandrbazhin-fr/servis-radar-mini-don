/* Демо-данные «Сервис-радара мини-отеля». Все даты строятся относительно сегодняшнего дня. */
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function dayDiff(a, b) { return Math.round((a - b) / 86400000); }
function isoDate(d) { const z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; }
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = mulberry(20261008);
const pick = arr => arr[Math.floor(R() * arr.length)];
const round100 = v => Math.round(v / 100) * 100;

const HOTEL = { name: 'Мини-ДОН', city: 'Ростов-на-Дону', rooms: 30, address: 'ул. Большая Садовая', baseStd: 5200, baseDlx: 7400 };

/* ---------- События ---------- */
const EVENT_CATS = {
  festival: 'Фестиваль', concert: 'Концерт', sport: 'Спорт', business: 'Деловое',
  expo: 'Выставка', holiday: 'Праздник', culture: 'Культура'
};
const IMPACT = { high: { label: 'Высокий', uplift: 0.3 }, med: { label: 'Средний', uplift: 0.12 }, low: { label: 'Низкий', uplift: 0.04 } };

function nextFixed(m, d) {
  let dt = new Date(TODAY.getFullYear(), m - 1, d);
  if (dt < addDays(TODAY, -20)) dt = new Date(TODAY.getFullYear() + 1, m - 1, d);
  return dt;
}

const EVENTS_RAW = [
  { t: 'Гастрофестиваль «Вкус Дона»', cat: 'festival', off: 2, dur: 3, venue: 'Набережная Дона', att: 25000, impact: 'high', note: 'Гости из Краснодара и Воронежа, пик в субботу' },
  { t: 'Агропромышленный форум Юга', cat: 'business', off: 6, dur: 3, venue: 'ДонЭкспоцентр', att: 8000, impact: 'high', note: 'Корпоративные заезды, будни, 2–3 ночи' },
  { t: 'Матч РПЛ на «Ростов Арене»', cat: 'sport', off: 10, dur: 1, venue: 'Ростов Арена', att: 38000, impact: 'med', note: 'Выездные болельщики, одна ночь' },
  { t: 'Осенний джаз на Дону', cat: 'concert', off: 13, dur: 2, venue: 'Ростовская филармония', att: 3500, impact: 'med', note: 'Аудитория 30–55, пары' },
  { t: 'Ярмарка мастеров на Большой Садовой', cat: 'culture', off: 4, dur: 2, venue: 'Большая Садовая', att: 6000, impact: 'low', note: 'В основном местные жители' },
  { t: 'Полумарафон «Донской»', cat: 'sport', off: 17, dur: 1, venue: 'Левый берег', att: 4200, impact: 'med', note: 'Регистрация накануне — заезд в пятницу' },
  { t: 'Стоматологическая выставка «Дентал-Юг»', cat: 'expo', off: 20, dur: 3, venue: 'ВертолЭкспо', att: 5000, impact: 'med', note: 'Экспоненты бронируют за 3–4 недели' },
  { t: 'Театральный фестиваль в Драмтеатре', cat: 'culture', off: 24, dur: 5, venue: 'Драмтеатр им. Горького', att: 7000, impact: 'low', note: 'Труппы из других городов' },
  { t: 'IT-конференция «Юг.Digital»', cat: 'business', off: 22, dur: 2, venue: 'Конгресс-холл ДГТУ', att: 2500, impact: 'med', note: 'Спикеры и участники из Москвы' },
  { t: 'День народного единства', cat: 'holiday', fixed: [11, 4], dur: 1, venue: 'Город', att: 0, impact: 'med', note: 'Короткие выходные, туризм выходного дня' },
  { t: 'Рок-концерт на Левобережной', cat: 'concert', off: 31, dur: 1, venue: 'Левобережная арена', att: 9000, impact: 'med', note: 'Поздний выезд, запрос на late check-out' },
  { t: 'Выставка свадебной индустрии', cat: 'expo', off: 35, dur: 2, venue: 'ДонЭкспоцентр', att: 3000, impact: 'low', note: 'Подрядчики из области' },
  { t: 'Фестиваль света в парке Революции', cat: 'festival', off: 40, dur: 4, venue: 'Парк Революции', att: 18000, impact: 'med', note: 'Вечерняя программа, семьи' },
  { t: 'Деловой форум «Ростов-Бизнес»', cat: 'business', off: 46, dur: 2, venue: 'Конгресс-центр', att: 4500, impact: 'high', note: 'Делегации из ЮФО, будни' },
  { t: 'Студенческий фестиваль ЮФУ', cat: 'festival', off: 52, dur: 2, venue: 'Кампус ЮФУ', att: 6000, impact: 'low', note: 'Бюджетный сегмент' },
  { t: 'Концерт симфонического оркестра', cat: 'concert', off: 57, dur: 1, venue: 'Ростовская филармония', att: 1200, impact: 'low', note: 'Одна ночь' },
  { t: 'Новогодняя ярмарка на Театральной', cat: 'festival', fixed: [12, 20], dur: 12, venue: 'Театральная площадь', att: 40000, impact: 'med', note: 'Длинный период, рост спроса к выходным' },
  { t: 'Новогодние каникулы', cat: 'holiday', fixed: [12, 31], dur: 9, venue: 'Город', att: 0, impact: 'high', note: 'Пакеты на 3+ ночи, мин. срок проживания' },
  { t: 'Матч КХЛ / ВХЛ на льду «Ростов»', cat: 'sport', off: 28, dur: 1, venue: 'Ледовая арена', att: 4000, impact: 'low', note: 'Одна ночь' },
  { t: 'Винный вечер в Старочеркасской', cat: 'culture', off: 15, dur: 1, venue: 'Старочеркасская (35 км)', att: 1500, impact: 'low', note: 'Гости ночуют в городе' },
  { t: 'Фестиваль «Донская уха»', cat: 'festival', off: -5, dur: 2, venue: 'Левый берег', att: 12000, impact: 'med', note: 'Прошедшее: загрузка 92%' },
  { t: 'Форум предпринимателей ЮФО', cat: 'business', off: -9, dur: 2, venue: 'ДонЭкспоцентр', att: 3000, impact: 'med', note: 'Прошедшее: ADR +14%' }
];

const EVENTS = EVENTS_RAW.map((e, i) => {
  const start = e.fixed ? nextFixed(e.fixed[0], e.fixed[1]) : addDays(TODAY, e.off);
  const end = addDays(start, e.dur - 1);
  return { id: 'e' + i, title: e.t, cat: e.cat, start, end, venue: e.venue, att: e.att, impact: e.impact, note: e.note, custom: false };
}).sort((a, b) => a.start - b.start);

function demandIndex(date, events = EVENTS) {
  let idx = 1;
  for (const e of events) if (date >= e.start && date <= e.end) idx += IMPACT[e.impact].uplift;
  const wd = date.getDay();
  if (wd === 5 || wd === 6) idx += 0.08;
  return Math.min(idx, 1.9);
}

/* ---------- Конкуренты ---------- */
const COMPETITORS = [
  { id: 'us', name: 'Мини-ДОН (мы)', short: 'Мини-ДОН', type: 'Мини-отель', rooms: 30, base: { std: 5200, dlx: 7400 }, sens: 0.55, rating: 4.8, dist: '—' },
  { id: 'c1', name: 'Мини-отель «Садовая 21»', short: 'Садовая 21', type: 'Мини-отель', rooms: 14, base: { std: 4800, dlx: 6900 }, sens: 0.7, rating: 4.6, dist: '0,4 км' },
  { id: 'c2', name: 'Арт-отель «Береговой»', short: 'Береговой', type: 'Бутик-отель', rooms: 22, base: { std: 5900, dlx: 8200 }, sens: 0.8, rating: 4.7, dist: '1,1 км' },
  { id: 'c3', name: 'Гостевой дом «Нахичевань»', short: 'Нахичевань', type: 'Гостевой дом', rooms: 9, base: { std: 3900, dlx: 5600 }, sens: 0.5, rating: 4.4, dist: '2,3 км' },
  { id: 'c4', name: 'Отель «Купеческий»', short: 'Купеческий', type: 'Бутик-отель', rooms: 30, base: { std: 6400, dlx: 9100 }, sens: 0.9, rating: 4.8, dist: '0,7 км' },
  { id: 'c5', name: 'Апарт-отель «Левый берег»', short: 'Левый берег', type: 'Апарт-отель', rooms: 18, base: { std: 4500, dlx: 6300 }, sens: 0.65, rating: 4.3, dist: '1,8 км' }
];
const RATE_FROM = -30, RATE_TO = 45;
const RATES = {}; // RATES[compId][roomType] = [{date, price|null}]
for (const c of COMPETITORS) {
  RATES[c.id] = { std: [], dlx: [] };
  for (let i = RATE_FROM; i <= RATE_TO; i++) {
    const d = addDays(TODAY, i);
    const dem = demandIndex(d);
    const soldOut = c.id !== 'us' && dem > 1.25 && R() < 0.22;
    for (const rt of ['std', 'dlx']) {
      const p = round100(c.base[rt] * (1 + (dem - 1) * c.sens) * (0.96 + R() * 0.08));
      RATES[c.id][rt].push({ date: d, price: soldOut ? null : p });
    }
  }
}
let RATE_MAP = {};
function buildRateMap() {
  RATE_MAP = {};
  for (const id in RATES) { RATE_MAP[id] = { std: {}, dlx: {} }; for (const rt of ['std', 'dlx']) for (const x of RATES[id][rt]) RATE_MAP[id][rt][isoDate(x.date)] = x.price; }
}
buildRateMap();
function rateOn(compId, rt, date) {
  const m = RATE_MAP[compId]; if (!m) return null;
  const v = m[rt][isoDate(date)];
  return v == null ? null : v;
}

const PROMO_TYPES = { discount: 'Скидка', package: 'Пакет', early: 'Раннее бронирование', los: 'Длительное проживание', lastmin: 'Горящее', loyalty: 'Лояльность' };
const CHANNELS = ['Сайт отеля', 'Островок', 'Яндекс Путешествия', 'Суточно.ру', 'Telegram-канал'];
const PROMOS = [
  { comp: 'c2', type: 'package', title: 'Гастро-уикенд: 2 ночи + ужин на двоих', value: '−12%', channel: 'Сайт отеля', found: -1, until: 6, isNew: true },
  { comp: 'c1', type: 'discount', title: 'Скидка 15% при бронировании на сайте', value: '−15%', channel: 'Сайт отеля', found: 0, until: 30, isNew: true },
  { comp: 'c4', type: 'early', title: 'Новый год: раннее бронирование до 15 ноября', value: '−20%', channel: 'Яндекс Путешествия', found: -2, until: 38, isNew: true },
  { comp: 'c5', type: 'los', title: 'От 5 ночей — 6-я в подарок', value: '1 ночь', channel: 'Суточно.ру', found: -4, until: 60, isNew: false },
  { comp: 'c3', type: 'lastmin', title: 'Горящие номера на будни', value: '−25%', channel: 'Островок', found: -1, until: 3, isNew: true },
  { comp: 'c2', type: 'loyalty', title: 'Кешбэк баллами Плюса за проживание', value: '10%', channel: 'Яндекс Путешествия', found: -7, until: 45, isNew: false },
  { comp: 'c4', type: 'package', title: 'Деловой пакет: трансфер + поздний выезд', value: '+0 ₽', channel: 'Сайт отеля', found: -3, until: 25, isNew: false },
  { comp: 'c1', type: 'lastmin', title: 'Минус 20% при заезде сегодня', value: '−20%', channel: 'Telegram-канал', found: 0, until: 1, isNew: true },
  { comp: 'c5', type: 'discount', title: 'Скидка участникам форума по промокоду', value: '−10%', channel: 'Сайт отеля', found: -5, until: 9, isNew: false },
  { comp: 'c3', type: 'early', title: 'Бронь за 30 дней — минус 12%', value: '−12%', channel: 'Островок', found: -10, until: 80, isNew: false },
  { comp: 'c2', type: 'discount', title: 'Мобильный тариф в приложении', value: '−7%', channel: 'Островок', found: -12, until: 20, isNew: false },
  { comp: 'c4', type: 'los', title: 'Длинные выходные: 3 ночи по цене 2,5', value: '−17%', channel: 'Сайт отеля', found: -2, until: 27, isNew: true }
].map((p, i) => ({ ...p, id: 'p' + i, found: addDays(TODAY, p.found), until: addDays(TODAY, p.until) }));

/* ---------- Отзывы ---------- */
const SOURCES = ['Яндекс Карты', '2ГИС', 'Островок', 'Яндекс Путешествия', 'Суточно.ру'];
const TOPICS = { clean: 'Чистота', staff: 'Персонал', location: 'Локация', breakfast: 'Завтрак', noise: 'Шум', wifi: 'Wi-Fi', value: 'Цена/качество', room: 'Номер' };
const REVIEW_TEMPLATES = [
  { r: 5, s: 'pos', topics: ['staff', 'location'], text: 'Администратор встретил даже ночью, помог с такси. До Большой Садовой две минуты пешком.' },
  { r: 5, s: 'pos', topics: ['clean', 'room'], text: 'Идеальная чистота, новое бельё, удобный матрас. Номер как на фото.' },
  { r: 5, s: 'pos', topics: ['breakfast', 'staff'], text: 'Завтраки домашние, сырники — лучшие в городе. Персонал очень внимательный.' },
  { r: 4, s: 'pos', topics: ['location', 'value'], text: 'Хорошее расположение и адекватная цена. Немного тесновато в стандарте.' },
  { r: 4, s: 'pos', topics: ['room', 'wifi'], text: 'Уютный номер, стильный интерьер. Wi-Fi иногда пропадал вечером.' },
  { r: 3, s: 'neu', topics: ['noise', 'location'], text: 'Центр — это плюс, но окна на улицу, ночью слышно машины.' },
  { r: 3, s: 'neu', topics: ['breakfast', 'value'], text: 'Завтрак скромный для такой цены, в остальном всё нормально.' },
  { r: 2, s: 'neg', topics: ['clean', 'staff'], text: 'В ванной был волос, на ресепшене долго не отвечали. Уборку сделали только после звонка.' },
  { r: 2, s: 'neg', topics: ['noise', 'room'], text: 'Слышимость между номерами ужасная, соседи до двух ночи. Кондиционер шумит.' },
  { r: 1, s: 'neg', topics: ['staff', 'value'], text: 'При заселении потребовали доплату, о которой не предупреждали при бронировании.' },
  { r: 5, s: 'pos', topics: ['staff', 'clean'], text: 'Приезжали на форум, оформили закрывающие документы для бухгалтерии без вопросов. Чисто, тихо.' },
  { r: 4, s: 'pos', topics: ['breakfast', 'location'], text: 'Вкусный завтрак, рядом набережная и много кафе. Парковка неудобная.' },
  { r: 5, s: 'pos', topics: ['room', 'value'], text: 'За эти деньги — отличный бутик-отель. Вернёмся на Новый год.' },
  { r: 3, s: 'neu', topics: ['wifi', 'room'], text: 'Номер хороший, но интернет медленный — работать удалённо сложно.' },
  { r: 4, s: 'pos', topics: ['staff', 'noise'], text: 'Персонал помог с поздним выездом. Бывает шумно от бара напротив.' },
  { r: 2, s: 'neg', topics: ['breakfast', 'clean'], text: 'Завтрак остывший, посуду со стола долго не убирали.' }
];
const AUTHORS = ['Ирина К.', 'Дмитрий', 'Анна С.', 'Сергей П.', 'Ольга', 'Максим Т.', 'Елена В.', 'Алексей', 'Наталья Р.', 'Игорь', 'Мария Л.', 'Павел Н.', 'Татьяна', 'Виктор Г.', 'Юлия', 'Роман Д.', 'Светлана', 'Артём Б.'];
const REVIEWS = [];
for (let i = 0; i < 56; i++) {
  const W = { 5: 5, 4: 3, 3: 1.2, 2: 0.7, 1: 0.35 };
  const tot = REVIEW_TEMPLATES.reduce((a, x) => a + W[x.r], 0);
  let roll = R() * tot, t = REVIEW_TEMPLATES[0];
  for (const x of REVIEW_TEMPLATES) { roll -= W[x.r]; if (roll <= 0) { t = x; break; } }
  const ago = Math.floor(Math.pow(R(), 1.3) * 90);
  const replied = ago > 6 ? R() < 0.82 : R() < 0.3;
  REVIEWS.push({ id: 'r' + i, source: pick(SOURCES), author: pick(AUTHORS), rating: t.r, sentiment: t.s, topics: t.topics, text: t.text, date: addDays(TODAY, -ago), replied, stay: pick(['Стандарт', 'Делюкс', 'Делюкс', 'Стандарт', 'Семейный']) });
}
REVIEWS.sort((a, b) => b.date - a.date);

/* ---------- Операционные метрики ---------- */
const METRIC_DAYS = 180;
const CH_NAMES = ['Прямые', 'Островок', 'Яндекс Путешествия', 'Суточно.ру', 'Корпоративные'];
const DAILY = [];
for (let i = -METRIC_DAYS + 1; i <= 0; i++) {
  const d = addDays(TODAY, i);
  const dem = demandIndex(d);
  const wd = d.getDay();
  const season = 0.05 * Math.sin((d.getMonth() + 1) / 12 * Math.PI * 2 - 1.2);
  let occ = 0.58 + (wd === 5 || wd === 6 ? 0.14 : 0) + (dem - 1) * 0.55 + season + (R() - 0.5) * 0.16;
  occ = Math.max(0.33, Math.min(1, occ));
  const sold = Math.round(occ * HOTEL.rooms);
  const adr = round100(5600 * (1 + (dem - 1) * 0.55) * (0.95 + R() * 0.1) * (1 + season));
  const roomRev = sold * adr;
  const extra = Math.round(sold * (450 + R() * 500));
  const ch = [0.34 + R() * 0.08, 0.2 + R() * 0.06, 0.24 + R() * 0.06, 0.08 + R() * 0.04, 0.06 + R() * 0.05];
  const s = ch.reduce((a, b) => a + b, 0);
  const channels = ch.map(v => v / s);
  DAILY.push({ date: d, occ: sold / HOTEL.rooms, sold, adr, roomRev, extra, revpar: Math.round(roomRev / HOTEL.rooms), cancel: Math.round(R() * R() * 4), checkins: Math.max(0, Math.round(sold / 2.1 + (R() - 0.5) * 2)), channels, los: 1.6 + R() * 1.2 });
}
const PACE = [];
for (let i = 0; i < 30; i++) {
  const d = addDays(TODAY, i);
  const dem = demandIndex(d);
  const decay = Math.max(0.2, 1 - i / 34);
  const ty = Math.min(HOTEL.rooms, Math.round((0.5 + (dem - 1) * 0.8) * HOTEL.rooms * decay + R() * 2));
  const ly = Math.min(HOTEL.rooms, Math.round((0.48 + (dem - 1) * 0.5) * HOTEL.rooms * decay + R() * 2));
  PACE.push({ date: d, ty, ly });
}
const OPS_TASKS = [
  { id: 't1', room: '204', kind: 'Техника', title: 'Шумит кондиционер', prio: 'high', status: 'open', ago: 0 },
  { id: 't2', room: '108', kind: 'Уборка', title: 'Генеральная уборка после выезда', prio: 'med', status: 'progress', ago: 0 },
  { id: 't3', room: '301', kind: 'Техника', title: 'Слабый напор в душе', prio: 'med', status: 'open', ago: 1 },
  { id: 't4', room: 'Холл', kind: 'Wi-Fi', title: 'Падает сеть на 3 этаже вечером', prio: 'high', status: 'progress', ago: 2 },
  { id: 't5', room: '206', kind: 'Номерной фонд', title: 'Заменить шторы блэкаут', prio: 'low', status: 'open', ago: 5 },
  { id: 't6', room: 'Кухня', kind: 'Завтрак', title: 'Пересмотреть меню — жалобы на остывание', prio: 'med', status: 'open', ago: 3 },
  { id: 't7', room: '105', kind: 'Уборка', title: 'Химчистка кресла', prio: 'low', status: 'done', ago: 4 },
  { id: 't8', room: '302', kind: 'Техника', title: 'Перегорела лампа в санузле', prio: 'low', status: 'done', ago: 1 }
].map(t => ({ ...t, created: addDays(TODAY, -t.ago) }));

/* ---------- Общепит (заполняется из листа «Общепит») ---------- */
const FOOD = [];
