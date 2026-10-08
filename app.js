/* Сервис-радар мини-отеля — логика интерфейса */
(() => {
'use strict';

/* ---------- Утилиты ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const money = v => v == null ? '—' : rub.format(v);
const pct = (v, d = 0) => (v * 100).toFixed(d).replace('.', ',') + '%';
const fDate = (d, o = { day: 'numeric', month: 'short' }) => d.toLocaleDateString('ru-RU', o).replace('.', '');
const fDow = d => d.toLocaleDateString('ru-RU', { weekday: 'short' });
const fFull = d => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const median = arr => { const a = arr.filter(v => v != null).sort((x, y) => x - y); if (!a.length) return null; const m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const plural = (n, f) => { const a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; };
const inDays = d => { const n = dayDiff(d, TODAY); if (n === 0) return 'сегодня'; if (n === 1) return 'завтра'; if (n < 0) return `${-n} ${plural(-n, ['день', 'дня', 'дней'])} назад`; return `через ${n} ${plural(n, ['день', 'дня', 'дней'])}`; };

const ICONS = {
  calendar: '<path d="M3 9h18M7 3v4m10-4v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
  chart: '<path d="M4 20V10m6 10V4m6 16v-7m6 7H2"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  download: '<path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8m6 9a7 7 0 0 0-4-6.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  bulb: '<path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z"/>',
  print: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  food: '<path d="M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10m10-18c-2 0-3 2.5-3 6s1 4 3 4v8"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ics: '<path d="M3 9h18M7 3v4m10-4v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M12 12v6m-3-3h6"/>'
};
const ico = n => `<span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg></span>`;
function hydrateIcons(root = document) { $$('[data-ico]', root).forEach(el => { el.outerHTML = ico(el.dataset.ico); }); }

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400); }

function download(name, content, mime = 'text/plain;charset=utf-8') {
  try {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('Файл сохранён: ' + name);
  } catch (e) { openModal('Скопируйте данные', `<textarea class="input" readonly>${esc(content)}</textarea>`); }
}
function toCSV(rows, headers) {
  const q = v => { const s = v == null ? '' : String(v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return '\uFEFF' + [headers.map(h => q(h[0])).join(';'), ...rows.map(r => headers.map(h => q(typeof h[1] === 'function' ? h[1](r) : r[h[1]])).join(';'))].join('\n');
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Скопировано в буфер обмена'); }
  catch (e) { openModal('Скопируйте текст', `<textarea class="input" style="min-height:300px">${esc(text)}</textarea>`); }
}

/* ---------- Модальное окно ---------- */
function openModal(title, html, onMount) {
  $('#modalTitle').textContent = title; $('#modalBody').innerHTML = html; $('#modal').hidden = false;
  hydrateIcons($('#modalBody')); if (onMount) onMount($('#modalBody'));
}
function closeModal() { $('#modal').hidden = true; }
$('#modalClose').onclick = closeModal;
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------- Графики ---------- */
const charts = {};
function chartBase() {
  const text = cssv('--muted'), grid = cssv('--border');
  Chart.defaults.font.family = "'Golos Text', system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = text;
  return { grid, text };
}
function mkChart(id, cfg) {
  if (charts[id]) charts[id].destroy();
  const el = document.getElementById(id); if (!el) return;
  const { grid } = chartBase();
  cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false, animation: { duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700, easing: 'easeOutQuart' }, interaction: { mode: 'index', intersect: false } }, cfg.options || {});
  cfg.options.plugins = Object.assign({ legend: { labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 14 } }, tooltip: { backgroundColor: cssv('--text'), titleColor: cssv('--bg'), bodyColor: cssv('--bg'), padding: 10, cornerRadius: 8, boxPadding: 4 } }, cfg.options.plugins || {});
  if (cfg.options.scales) for (const k in cfg.options.scales) { const s = cfg.options.scales[k]; s.grid = Object.assign({ color: grid, drawTicks: false }, s.grid || {}); s.border = { display: false }; s.ticks = Object.assign({ padding: 6 }, s.ticks || {}); }
  charts[id] = new Chart(el, cfg);
}
const palette = () => ['--c1', '--c2', '--c3', '--c4', '--c5', '--c6', '--c7', '--c8'].map(cssv);
function chartPng(id, name) { const c = charts[id]; if (!c) return; const url = c.toBase64Image('image/png', 1); fetch(url).then(r => r.blob()).then(b => download(name + '.png', b)); }
document.addEventListener('click', e => { const b = e.target.closest('[data-png]'); if (b) chartPng(b.dataset.png, b.dataset.name || b.dataset.png); });
const pngBtn = (id, name) => `<button class="icon-btn no-print" data-png="${id}" data-name="${name}" title="Скачать PNG" aria-label="Скачать график PNG">${ico('image')}</button>`;

/* ---------- Состояние ---------- */
const S = {
  tab: 'events',
  ev: { cats: new Set(), impact: 'all', range: 60, view: 'cards', q: '', month: new Date(TODAY.getFullYear(), TODAY.getMonth(), 1) },
  rt: { room: 'std', horizon: 14, hidden: new Set(), pComp: 'all', pType: 'all', onlyNew: false },
  rv: { src: 'all', ratings: new Set(), sent: 'all', status: 'all', topic: 'all', period: 90, q: '', sort: 'new' },
  mt: { period: 30 },
  fd: { type: 'all', kind: 'all', q: '' },
  sm: { sections: new Set(['kpi', 'events', 'rates', 'promos', 'food', 'reviews', 'ops', 'reco']) }
};
const TITLES = {
  events: ['События и фестивали', 'Календарь города и влияние на спрос'],
  rates: ['Конкуренты и тарифы', 'Мини- и бутик-отели центра: цены Островка и акции'],
  food: ['Акции общепита', 'Предложения кафе и ресторанов центра на октябрь'],
  reviews: ['Отзывы гостей', 'Единая лента из 5 площадок'],
  metrics: ['Операционные метрики', 'Загрузка, ADR, RevPAR, каналы и задачи'],
  summary: ['Сводка', 'Готовый отчёт для печати и выгрузки']
};

/* ---------- Демо-пометка для внутренних данных ---------- */
const DEMO_FOR = { reviews: ['Отзывы'], metrics: ['Метрики', 'Темп', 'Задачи'] };
function demoBanner(t) {
  const sec = $('#tab-' + t); if (!sec) return;
  const old = sec.querySelector('.demo-note'); if (old) old.remove();
  const tabs = (DEMO_FOR[t] || []).filter(k => DATA_SOURCE.mode === 'demo' || (DATA_SOURCE.demoTabs || []).includes(k));
  if (!tabs.length) return;
  sec.insertAdjacentHTML('afterbegin', `<div class="reco demo-note">${ico('bulb')}<div><b>Демо-данные.</b> Отзывы, загрузка и задачи — внутренние данные отеля «${esc(HOTEL.name)}», в открытых источниках их нет. ${tabs.length > 1 ? 'Листы' : 'Лист'} ${tabs.map(k => '«' + k + '»').join(', ')} в Google Таблице ${tabs.length > 1 ? 'пусты' : 'пуст'}: заполните их из PMS или выгрузок площадок — дашборд подхватит данные автоматически.</div></div>`);
}

/* ---------- Навигация ---------- */
function setTab(t) {
  S.tab = t;
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  $$('.tab').forEach(s => s.hidden = s.id !== 'tab-' + t);
  $('#pageTitle').textContent = TITLES[t][0];
  $('#pageSub').textContent = TITLES[t][1];
  $('#exportTabBtn').querySelector('span:last-child').textContent = t === 'summary' ? 'Скачать .md' : 'Экспорт CSV';
  $('#toSummaryBtn').hidden = t === 'summary';
  RENDER[t]();
  demoBanner(t);
  $('#main').scrollTop = 0;
  if (location.hash !== '#' + t) history.replaceState(null, '', '#' + t);
}
$('#nav').addEventListener('click', e => { const b = e.target.closest('.nav-item'); if (b) setTab(b.dataset.tab); });
$('#toSummaryBtn').onclick = () => setTab('summary');
$('#exportTabBtn').onclick = () => EXPORT[S.tab]();

/* Тема */
let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  $('#themeBtn').innerHTML = ico(theme === 'dark' ? 'sun' : 'moon') + `<span id="themeLbl">${theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>`;
}
$('#themeBtn').onclick = () => { theme = theme === 'dark' ? 'light' : 'dark'; applyTheme(); RENDER[S.tab](); };

/* ======================================================================
   СОБЫТИЯ
   ====================================================================== */
const recoRate = e => round100(HOTEL.baseStd * (1 + IMPACT[e.impact].uplift));
function filteredEvents() {
  const f = S.ev, q = f.q.trim().toLowerCase();
  const to = addDays(TODAY, f.range);
  return EVENTS.filter(e => {
    if (f.range !== 'all' && (e.end < TODAY || e.start > to)) return false;
    if (f.cats.size && !f.cats.has(e.cat)) return false;
    if (f.impact !== 'all' && e.impact !== f.impact) return false;
    if (q && !(e.title + ' ' + e.venue + ' ' + e.note).toLowerCase().includes(q)) return false;
    return true;
  });
}
function renderEvents() {
  const el = $('#tab-events');
  if (!el.dataset.ready) {
    el.innerHTML = `
      <div class="filters" id="evFilters">
        <div class="chips" id="evCats"><button class="chip on" data-cat="">Все</button>${Object.entries(EVENT_CATS).map(([k, v]) => `<button class="chip" data-cat="${k}">${v}</button>`).join('')}</div>
        <span class="sep"></span>
        <label class="field">Влияние <select class="select" id="evImpact"><option value="all">Любое</option><option value="high">Высокое</option><option value="med">Среднее</option><option value="low">Низкое</option></select></label>
        <div class="seg" id="evRange"><button data-v="30">30 дней</button><button data-v="60" class="on">60 дней</button><button data-v="120">120 дней</button><button data-v="all">Все</button></div>
        <input class="input search" id="evQ" placeholder="Название, площадка…" aria-label="Поиск событий">
        <div class="seg" id="evView"><button data-v="cards" class="on">Карточки</button><button data-v="cal">Календарь</button></div>
        <button class="btn sm" id="evAdd">${ico('plus')}Событие</button>
        <button class="btn sm" id="evIcs">${ico('ics')}.ics</button>
      </div>
      <div id="evBody" style="display:flex;flex-direction:column;gap:20px"></div>`;
    el.dataset.ready = 1;
    $('#evCats').onclick = e => { const c = e.target.closest('.chip'); if (!c) return; const k = c.dataset.cat; if (!k) S.ev.cats.clear(); else S.ev.cats.has(k) ? S.ev.cats.delete(k) : S.ev.cats.add(k); $$('#evCats .chip').forEach(x => x.classList.toggle('on', x.dataset.cat ? S.ev.cats.has(x.dataset.cat) : !S.ev.cats.size)); evBody(); };
    $('#evImpact').onchange = e => { S.ev.impact = e.target.value; evBody(); };
    segBind('#evRange', v => { S.ev.range = v === 'all' ? 'all' : +v; evBody(); });
    segBind('#evView', v => { S.ev.view = v; evBody(); });
    $('#evQ').oninput = e => { S.ev.q = e.target.value; evBody(); };
    $('#evAdd').onclick = addEventModal;
    $('#evIcs').onclick = () => download('sobytiya.ics', toICS(filteredEvents()), 'text/calendar;charset=utf-8');
  }
  evBody();
}
function segBind(sel, cb) { $(sel).onclick = e => { const b = e.target.closest('button'); if (!b) return; $$(sel + ' button').forEach(x => x.classList.toggle('on', x === b)); cb(b.dataset.v); }; }

function evBody() {
  const list = filteredEvents();
  const upcoming = list.filter(e => e.end >= TODAY);
  const high = upcoming.filter(e => e.impact === 'high');
  let peak = { d: TODAY, v: 0 };
  for (let i = 0; i < 60; i++) { const d = addDays(TODAY, i), v = demandIndex(d); if (v > peak.v) peak = { d, v }; }
  const att = upcoming.reduce((a, e) => a + e.att, 0);
  const body = $('#evBody');
  body.innerHTML = `
    <div class="kpis">
      ${kpi('Событий в выборке', list.length, `${upcoming.length} предстоящих`)}
      ${kpi('Высокое влияние', high.length, high[0] ? 'ближайшее ' + fDate(high[0].start) : 'нет в выборке')}
      ${kpi('Пик спроса', fDate(peak.d), `индекс ${nf1.format(peak.v)} · ${fDow(peak.d)}`)}
      ${kpi('Ожидаемые посетители', nf.format(att), 'по предстоящим событиям')}
    </div>
    <div class="card">
      <div class="card-head"><div><h3>Индекс спроса на 60 дней</h3><p>1,0 — обычный день. Учтены события и выходные. Линия — рекомендуемый тариф «Стандарт»</p></div>${pngBtn('chDemand', 'indeks-sprosa')}</div>
      <div class="chart-box"><canvas id="chDemand"></canvas></div>
    </div>
    ${S.ev.view === 'cards' ? `<div class="card-grid" id="evCards">${list.length ? list.map(evCard).join('') : empty('Нет событий', 'Измените фильтры или добавьте событие')}</div>` : calendarHTML(list)}`;
  if (S.ev.view === 'cal') bindCalendar();
  $$('[data-ev]', body).forEach(b => b.onclick = () => evModal(b.dataset.ev));
  $$('[data-evics]', body).forEach(b => b.onclick = ev => { ev.stopPropagation(); const e = EVENTS.find(x => x.id === b.dataset.evics); download('sobytie.ics', toICS([e]), 'text/calendar;charset=utf-8'); });
  const days = [...Array(60)].map((_, i) => addDays(TODAY, i));
  const P = palette();
  mkChart('chDemand', {
    data: {
      labels: days.map(d => fDate(d)),
      datasets: [
        { type: 'bar', label: 'Индекс спроса', data: days.map(d => +demandIndex(d).toFixed(2)), backgroundColor: days.map(d => { const v = demandIndex(d); return v >= 1.3 ? cssv('--danger') : v >= 1.12 ? cssv('--brass') : cssv('--accent') + '88'; }), borderRadius: 3, yAxisID: 'y', order: 2 },
        { type: 'line', label: 'Реком. тариф, ₽', data: days.map(d => round100(HOTEL.baseStd * (1 + (demandIndex(d) - 1) * 0.8))), borderColor: P[3], backgroundColor: P[3], borderWidth: 2, pointRadius: 0, tension: .3, yAxisID: 'y1', order: 1 }
      ]
    },
    options: { scales: { x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 14 } }, y: { min: 0.8, title: { display: false } }, y1: { position: 'right', grid: { display: false }, ticks: { callback: v => nf.format(v) } } },
      plugins: { tooltip: { callbacks: { afterBody: items => { const d = days[items[0].dataIndex]; const evs = EVENTS.filter(e => d >= e.start && d <= e.end); return evs.length ? ['', ...evs.map(e => '• ' + e.title)] : ''; } } } } }
  });
}
function kpi(label, val, foot, delta) {
  return `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-val">${val}</div><div class="kpi-foot">${delta || ''}<span>${foot || ''}</span></div></div>`;
}
const srcHost = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
const srcLink = (u, label) => /^https?:/.test(u || '') ? `<a class="src-link" href="${esc(u)}" target="_blank" rel="noopener">${ico('link')}${esc(label || srcHost(u))}</a>` : '';
function empty(t, s) { return `<div class="empty"><b>${t}</b>${s}</div>`; }
function evCard(e) {
  const past = e.end < TODAY;
  const range = e.start.getTime() === e.end.getTime() ? fDate(e.start, { day: 'numeric', month: 'long' }) : `${fDate(e.start)} – ${fDate(e.end)}`;
  return `<article class="item ${past ? 'past' : ''}">
    <div class="item-top"><div class="date-block"><span class="date-day">${range}</span><span class="muted xs">${fDow(e.start)}</span></div><span class="tag ${e.impact}">${IMPACT[e.impact].label}</span></div>
    <h4>${esc(e.title)}</h4>
    <div class="meta"><span>${ico('pin')}${esc(e.venue)}</span>${e.att ? `<span>${ico('users')}${nf.format(e.att)}</span>` : ''}<span class="tag accent">${EVENT_CATS[e.cat]}</span>${e.custom ? '<span class="tag brass">Добавлено</span>' : ''}</div>
    <p class="muted small" style="margin:0">${esc(e.note || '')}</p>
    ${e.src ? `<div class="xs">${srcLink(e.src)}</div>` : ''}
    <div class="item-foot"><span>${past ? 'Прошло' : inDays(e.start)} · <b>реком. ${money(recoRate(e))}</b> <span class="muted">(+${Math.round(IMPACT[e.impact].uplift * 100)}%)</span></span>
      <span><button class="btn sm ghost" data-evics="${e.id}" title="Добавить в календарь">${ico('ics')}</button><button class="btn sm" data-ev="${e.id}">Подробнее</button></span></div>
  </article>`;
}
function calendarHTML(list) {
  const m = S.ev.month, first = new Date(m), start = addDays(first, -((first.getDay() + 6) % 7));
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    if (i >= 35 && d.getMonth() !== m.getMonth()) break;
    const evs = list.filter(e => d >= e.start && d <= e.end);
    const dem = demandIndex(d);
    cells.push(`<div class="cal-cell ${d.getMonth() !== m.getMonth() ? 'out' : ''} ${d.getTime() === TODAY.getTime() ? 'today' : ''}">
      <span class="cal-num">${d.getDate()}</span>${dem > 1.1 ? `<span class="cal-dem" style="color:${dem >= 1.3 ? 'var(--danger)' : 'var(--brass)'}">${nf1.format(dem)}</span>` : ''}
      ${evs.slice(0, 3).map(e => `<button class="cal-ev ${e.impact}" data-ev="${e.id}" title="${esc(e.title)}">${esc(e.title)}</button>`).join('')}
      ${evs.length > 3 ? `<span class="cal-more">ещё ${evs.length - 3}</span>` : ''}</div>`);
  }
  return `<div class="card"><div class="card-head"><div class="cal-head"><button class="icon-btn" id="calPrev" aria-label="Предыдущий месяц">${ico('left')}</button><h3>${m.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</h3><button class="icon-btn" id="calNext" aria-label="Следующий месяц">${ico('right')}</button><button class="btn sm ghost" id="calToday">Сегодня</button></div><p>Цифра в углу — индекс спроса</p></div>
    <div class="cal">${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => `<div class="cal-dow">${d}</div>`).join('')}${cells.join('')}</div></div>`;
}
function bindCalendar() {
  $('#calPrev').onclick = () => { S.ev.month = new Date(S.ev.month.getFullYear(), S.ev.month.getMonth() - 1, 1); evBody(); };
  $('#calNext').onclick = () => { S.ev.month = new Date(S.ev.month.getFullYear(), S.ev.month.getMonth() + 1, 1); evBody(); };
  $('#calToday').onclick = () => { S.ev.month = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1); evBody(); };
}
function evModal(id) {
  const e = EVENTS.find(x => x.id === id);
  const nights = Math.max(1, dayDiff(e.end, e.start) + 1);
  const compMed = median(COMPETITORS.slice(1).map(c => rateOn(c.id, 'std', e.start)));
  openModal(e.title, `
    <div class="meta" style="display:flex;gap:8px;flex-wrap:wrap"><span class="tag accent">${EVENT_CATS[e.cat]}</span><span class="tag ${e.impact}">Влияние: ${IMPACT[e.impact].label}</span></div>
    <div class="form-grid">
      <div><div class="muted xs">Даты</div><b>${fFull(e.start)}${nights > 1 ? ' — ' + fFull(e.end) : ''}</b></div>
      <div><div class="muted xs">Площадка</div><b>${esc(e.venue)}</b></div>
      <div><div class="muted xs">Посетители</div><b>${e.att ? nf.format(e.att) : '—'}</b></div>
      <div><div class="muted xs">Индекс спроса в первый день</div><b>${nf1.format(demandIndex(e.start))}</b></div>
      <div><div class="muted xs">Рекомендуемый «Стандарт»</div><b>${money(recoRate(e))}</b></div>
      <div><div class="muted xs">Медиана конкурентов</div><b>${compMed ? money(compMed) : 'нет данных'}</b></div>
    </div>
    <div class="reco">${ico('bulb')}<div>${esc(e.note || '')}. ${e.impact === 'high' ? 'Закройте скидочные тарифы, поставьте минимальный срок 2 ночи, откройте продажи пакетов.' : e.impact === 'med' ? 'Поднимите тариф на 10–15% и уберите горящие предложения на эти даты.' : 'Держите базовый тариф, используйте для допродаж (завтрак, поздний выезд).'}</div></div>
    <div class="modal-actions"><button class="btn" id="mIcs">${ico('ics')}Добавить в календарь</button><button class="btn primary" id="mClose">Закрыть</button></div>`,
    b => { $('#mClose', b).onclick = closeModal; $('#mIcs', b).onclick = () => download('sobytie.ics', toICS([e]), 'text/calendar;charset=utf-8'); });
}
function addEventModal() {
  openModal('Новое событие', `
    <div class="form-row"><label for="fT">Название</label><input class="input" id="fT" placeholder="Например, концерт в Филармонии"></div>
    <div class="form-grid">
      <div class="form-row"><label for="fS">Начало</label><input class="input" type="date" id="fS" value="${isoDate(addDays(TODAY, 7))}"></div>
      <div class="form-row"><label for="fE">Окончание</label><input class="input" type="date" id="fE" value="${isoDate(addDays(TODAY, 7))}"></div>
      <div class="form-row"><label for="fC">Категория</label><select class="select" id="fC">${Object.entries(EVENT_CATS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
      <div class="form-row"><label for="fI">Влияние на спрос</label><select class="select" id="fI"><option value="high">Высокое</option><option value="med" selected>Среднее</option><option value="low">Низкое</option></select></div>
      <div class="form-row"><label for="fV">Площадка</label><input class="input" id="fV" placeholder="Площадка"></div>
      <div class="form-row"><label for="fA">Посетители</label><input class="input" type="number" id="fA" min="0" value="1000"></div>
    </div>
    <div class="form-row"><label for="fN">Заметка</label><input class="input" id="fN" placeholder="Кто приедет, на сколько ночей"></div>
    <div class="modal-actions"><button class="btn" id="fCancel">Отмена</button><button class="btn primary" id="fSave">Сохранить</button></div>`,
    b => {
      $('#fCancel', b).onclick = closeModal;
      $('#fSave', b).onclick = () => {
        const t = $('#fT', b).value.trim(); if (!t) { $('#fT', b).focus(); toast('Введите название'); return; }
        const s = new Date($('#fS', b).value + 'T00:00'), en = new Date($('#fE', b).value + 'T00:00');
        EVENTS.push({ id: 'u' + Date.now(), title: t, cat: $('#fC', b).value, start: s, end: en < s ? s : en, venue: $('#fV', b).value || 'Город', att: +$('#fA', b).value || 0, impact: $('#fI', b).value, note: $('#fN', b).value, custom: true });
        EVENTS.sort((a, c) => a.start - c.start); closeModal(); evBody(); toast('Событие добавлено');
      };
    });
}
function toICS(list) {
  const f = d => isoDate(d).replace(/-/g, '');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Servis-radar//RU', ...list.flatMap(e => ['BEGIN:VEVENT', `UID:${e.id}@servis-radar`, `DTSTART;VALUE=DATE:${f(e.start)}`, `DTEND;VALUE=DATE:${f(addDays(e.end, 1))}`, `SUMMARY:${e.title}`, `LOCATION:${e.venue}`, `DESCRIPTION:Влияние: ${IMPACT[e.impact].label}. ${e.note || ''}`, 'END:VEVENT']), 'END:VCALENDAR'].join('\r\n');
}

/* ======================================================================
   КОНКУРЕНТЫ
   ====================================================================== */
function renderRates() {
  const el = $('#tab-rates');
  if (!el.dataset.ready) {
    el.innerHTML = `
      <div class="filters">
        <div class="seg" id="rtRoom"><button data-v="std" class="on">Стандарт</button><button data-v="dlx">Делюкс</button></div>
        <div class="seg" id="rtHor"><button data-v="7">7 дней</button><button data-v="14" class="on">14 дней</button><button data-v="30">30 дней</button><button data-v="60">60 дней</button></div>
        <span class="sep"></span>
        <div class="chips" id="rtComps">${COMPETITORS.map(c => `<button class="chip on" data-c="${c.id}">${esc(c.short)}</button>`).join('')}</div>
      </div>
      <div id="rtBody" style="display:flex;flex-direction:column;gap:20px"></div>`;
    el.dataset.ready = 1;
    segBind('#rtRoom', v => { S.rt.room = v; rtBody(); });
    segBind('#rtHor', v => { S.rt.horizon = +v; rtBody(); });
    $('#rtComps').onclick = e => { const c = e.target.closest('.chip'); if (!c) return; const id = c.dataset.c; S.rt.hidden.has(id) ? S.rt.hidden.delete(id) : S.rt.hidden.add(id); c.classList.toggle('on', !S.rt.hidden.has(id)); rtBody(); };
  }
  rtBody();
}
function rateDates() {
  const set = new Set();
  COMPETITORS.slice(1).forEach(c => (RATES[c.id] ? RATES[c.id].std : []).forEach(x => set.add(isoDate(x.date))));
  return [...set].sort().map(s => parseDateCell(s));
}
function rateSparse() { const d = rateDates().filter(x => x >= TODAY && x <= addDays(TODAY, 30)); return d.length > 0 && d.length < 25; }
function rateStats(room = S.rt.room, horizon = S.rt.horizon) {
  const sparse = rateSparse();
  const days = sparse ? rateDates().filter(d => d >= TODAY && d < addDays(TODAY, horizon + 1)) : [...Array(horizon)].map((_, i) => addDays(TODAY, i));
  if (!days.length) days.push(TODAY);
  const comps = COMPETITORS.slice(1);
  const d0 = days[0];
  const ourToday = rateOn('us', room, d0);
  const medToday = median(comps.map(c => rateOn(c.id, room, d0)));
  const avgBy = COMPETITORS.map(c => ({ c, v: Math.round(avg(days.map(d => rateOn(c.id, room, d)).filter(v => v != null))) }));
  const sorted = [...avgBy].sort((a, b) => a.v - b.v);
  const rank = sorted.findIndex(x => x.c.id === 'us') + 1;
  const ourAvg = avgBy[0].v, medAvg = median(avgBy.slice(1).map(x => x.v));
  let soldOut = 0; days.slice(0, 7).forEach(d => comps.forEach(c => { if (rateOn(c.id, room, d) == null) soldOut++; }));
  const gaps = days.map(d => { const m = median(comps.map(c => rateOn(c.id, room, d))); const o = rateOn('us', room, d); return { d, m, o, gap: m && o ? (m - o) / o : 0 }; });
  return { days, d0, sparse, ourToday, medToday, avgBy, rank, ourAvg, medAvg, soldOut, gaps };
}
function rtBody() {
  const st = rateStats();
  const room = S.rt.room, P = palette();
  const idx = st.ourAvg / st.medAvg;
  const newPromos = PROMOS.filter(p => p.isNew).length;
  const under = st.gaps.filter(g => g.gap > 0.08);
  const body = $('#rtBody');
  body.innerHTML = `
    <div class="kpis">
      ${kpi(st.sparse ? 'Наш тариф ' + fDate(st.d0) : 'Наш тариф сегодня', money(st.ourToday), 'медиана рынка ' + money(st.medToday))}
      ${kpi('Индекс цены (ARI)', nf1.format(idx * 100).replace(',0', '') + '%', '', `<span class="delta neutral">${idx >= 1 ? '▲ дороже' : '▼ дешевле'} медианы на ${pct(Math.abs(idx - 1), 1)}</span>`)}
      ${kpi('Позиция по цене', `${st.rank} из ${COMPETITORS.length}`, '1 — самый дешёвый')}
      ${kpi('Нет мест у конкурентов', st.soldOut, st.sparse ? 'объекто-дат из 7 ближайших' : 'объекто-дней за 7 дней')}
      ${kpi('Новые акции', newPromos, 'не просмотрены')}
    </div>
    ${under.length ? `<div class="reco">${ico('bulb')}<div><b>Недооценённые даты: ${under.length}.</b> Медиана рынка выше нашего тарифа более чем на 8%: ${under.slice(0, 6).map(g => `${fDate(g.d)} (+${Math.round(g.gap * 100)}%)`).join(', ')}${under.length > 6 ? '…' : ''}. Стоит поднять цену.</div></div>` : ''}
    <div class="grid g-3-1">
      <div class="card"><div class="card-head"><div><h3>Динамика тарифов · ${room === 'std' ? 'Стандарт' : 'Делюкс'}</h3><p>${st.sparse ? `Цены Островка на ${st.days.length} ${plural(st.days.length, ['дату', 'даты', 'дат'])}, 1 ночь, 2 гостя. Пропуск — нет мест` : `14 дней истории и ${st.days.length} дней вперёд. Пропуск — нет мест`}</p></div>${pngBtn('chRates', 'tarify-konkurentov')}</div><div class="chart-box tall"><canvas id="chRates"></canvas></div></div>
      <div class="card"><div class="card-head"><div><h3>Средняя цена · ${st.days.length} ${st.sparse ? plural(st.days.length, ['дата', 'даты', 'дат']) : 'дн.'}</h3><p>По возрастанию</p></div>${pngBtn('chRank', 'reiting-cen')}</div><div class="chart-box tall"><canvas id="chRank"></canvas></div></div>
    </div>
    <div class="card"><div class="card-head"><div><h3>Сетка цен</h3><p><span class="cell-heat heat-down" style="min-width:0">дешевле нас</span> &nbsp;<span class="cell-heat heat-up" style="min-width:0">дороже нас</span> &nbsp;разница больше 5%</p></div><button class="btn sm" id="rtCsv">${ico('download')}CSV</button></div>
      <div class="table-wrap">${rateTable(st.days)}</div></div>
    <div class="card"><div class="card-head"><div><h3>Мониторинг акций</h3><p>Найденные промо на сайтах и OTA</p></div></div>
      <div class="filters" style="margin-bottom:16px;box-shadow:none">
        <label class="field">Объект <select class="select" id="pComp"><option value="all">Все</option>${COMPETITORS.slice(1).map(c => `<option value="${c.id}" ${S.rt.pComp === c.id ? 'selected' : ''}>${esc(c.short)}</option>`).join('')}</select></label>
        <label class="field">Тип <select class="select" id="pType"><option value="all">Все</option>${Object.entries(PROMO_TYPES).map(([k, v]) => `<option value="${k}" ${S.rt.pType === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="check"><input type="checkbox" id="pNew" ${S.rt.onlyNew ? 'checked' : ''}>Только новые</label>
        <span class="result-count" id="pCount"></span>
      </div>
      <div class="card-grid" id="promoGrid"></div></div>`;
  $('#rtCsv').onclick = EXPORT.rates;
  $('#pComp').onchange = e => { S.rt.pComp = e.target.value; promoGrid(); };
  $('#pType').onchange = e => { S.rt.pType = e.target.value; promoGrid(); };
  $('#pNew').onchange = e => { S.rt.onlyNew = e.target.checked; promoGrid(); };
  promoGrid();

  const hist = st.sparse ? 0 : 14;
  const all = st.sparse ? st.days : [...Array(14 + st.days.length)].map((_, i) => addDays(TODAY, i - 14));
  const vis = COMPETITORS.filter(c => !S.rt.hidden.has(c.id));
  mkChart('chRates', {
    type: 'line',
    data: { labels: all.map(d => fDate(d)), datasets: vis.map(c => { const i = COMPETITORS.indexOf(c); return { label: c.short, data: all.map(d => rateOn(c.id, room, d)), borderColor: P[i % P.length], backgroundColor: P[i % P.length], borderWidth: c.id === 'us' ? 3 : 1.6, pointRadius: st.sparse ? 3 : 0, pointHoverRadius: 5, tension: .25, spanGaps: false, segment: { borderDash: ctx => ctx.p0DataIndex < hist ? [4, 3] : undefined } }; }) },
    options: { scales: { x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 16, color: ctx => !st.sparse && ctx.index === 14 ? cssv('--accent') : cssv('--muted') } }, y: { ticks: { callback: v => nf.format(v) } } }, plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw == null ? 'нет мест' : money(c.raw)}` } } } }
  });
  const rk = [...st.avgBy].filter(x => !S.rt.hidden.has(x.c.id)).sort((a, b) => a.v - b.v);
  mkChart('chRank', {
    type: 'bar',
    data: { labels: rk.map(x => x.c.short), datasets: [{ data: rk.map(x => x.v), backgroundColor: rk.map(x => x.c.id === 'us' ? cssv('--accent') : cssv('--border-strong')), borderRadius: 5, barThickness: 18 }] },
    options: { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + money(c.raw) } } }, scales: { x: { ticks: { callback: v => nf.format(v / 1000) + 'к' } }, y: { grid: { display: false } } } }
  });
}
function rateTable(days) {
  const room = S.rt.room;
  const rows = COMPETITORS.filter(c => !S.rt.hidden.has(c.id) || c.id === 'us');
  return `<table><thead><tr><th>Объект</th><th class="r">Рейтинг</th>${days.map(d => `<th class="r ${[5, 6].includes(d.getDay()) ? 'wknd' : ''}">${fDate(d)}<br><span class="faint">${fDow(d)}</span></th>`).join('')}</tr></thead><tbody>
    ${rows.map(c => `<tr class="${c.id === 'us' ? 'us-row' : ''}"><td>${c.src && /^http/.test(c.src) ? `<a href="${esc(c.src)}" target="_blank" rel="noopener" class="plain-link">${esc(c.short)}</a>` : esc(c.short)}<div class="faint xs">${c.type}${c.id !== 'us' ? ' · ' + c.dist : ''}${c.rooms ? ' · ' + c.rooms + ' ном.' : ''}</div></td><td class="r">${c.rating10 ? nf1.format(c.rating10) + '<span class="faint xs">/10</span>' : c.rating ? nf1.format(c.rating) : '—'}</td>
      ${days.map(d => { const p = rateOn(c.id, room, d), o = rateOn('us', room, d); if (p == null) return '<td class="r"><span class="tag brass">нет мест</span></td>'; if (c.id === 'us') return `<td class="r num">${nf.format(p)}</td>`; const g = (p - o) / o; return `<td class="r"><span class="cell-heat ${g > 0.05 ? 'heat-up' : g < -0.05 ? 'heat-down' : 'heat-eq'}" title="${g >= 0 ? '+' : ''}${Math.round(g * 100)}% к нашему">${nf.format(p)}</span></td>`; }).join('')}</tr>`).join('')}
    <tr><td class="muted">Медиана рынка</td><td></td>${days.map(d => `<td class="r muted num">${nf.format(median(COMPETITORS.slice(1).map(c => rateOn(c.id, room, d))) || 0)}</td>`).join('')}</tr>
  </tbody></table>`;
}
function filteredPromos() { return PROMOS.filter(p => (S.rt.pComp === 'all' || p.comp === S.rt.pComp) && (S.rt.pType === 'all' || p.type === S.rt.pType) && (!S.rt.onlyNew || p.isNew)).sort((a, b) => b.found - a.found); }
function promoGrid() {
  const list = filteredPromos();
  $('#pCount').textContent = `${list.length} ${plural(list.length, ['акция', 'акции', 'акций'])}`;
  $('#promoGrid').innerHTML = list.length ? list.map(p => { const c = COMPETITORS.find(x => x.id === p.comp); const left = dayDiff(p.until, TODAY); return `<article class="item">
    <div class="item-top"><span class="tag accent">${PROMO_TYPES[p.type]}</span>${p.isNew ? '<span class="tag brass">Новая</span>' : '<span class="tag">Просмотрена</span>'}</div>
    <h4>${esc(p.title)}</h4>
    <div class="meta"><span><b>${esc(c.short)}</b></span><span>${esc(p.channel)}</span><span>Выгода: <b>${esc(p.value)}</b></span></div>
    ${p.src ? `<div class="xs">${srcLink(p.src)}</div>` : ''}
    <div class="item-foot"><span class="muted">Найдена ${fDate(p.found)} · ${p.untilSet === false ? 'срок не указан' : left <= 3 ? `<b style="color:var(--danger)">до ${fDate(p.until)}</b>` : 'до ' + fDate(p.until)}</span>${p.isNew ? `<button class="btn sm" data-seen="${p.id}">${ico('check')}Просмотрено</button>` : ''}</div></article>`; }).join('') : empty('Акций нет', 'По выбранным фильтрам ничего не найдено');
  $$('[data-seen]').forEach(b => b.onclick = () => { PROMOS.find(p => p.id === b.dataset.seen).isNew = false; promoGrid(); updateBadges(); });
}

/* ======================================================================
   ОТЗЫВЫ
   ====================================================================== */
const SRC_COLORS = { 'Яндекс Карты': '#D9472B', '2ГИС': '#2E9E4F', 'Островок': '#2F6FD6', 'Яндекс Путешествия': '#C9921A', 'Суточно.ру': '#7A4FC0' };
const SRC_ABBR = { 'Яндекс Карты': 'ЯК', '2ГИС': '2Г', 'Островок': 'ОС', 'Яндекс Путешествия': 'ЯП', 'Суточно.ру': 'СУ' };
const srcColor = s => SRC_COLORS[s] || '#6A6F69';
const srcAbbr = s => SRC_ABBR[s] || s.slice(0, 2).toUpperCase();
const SENT = { pos: 'Позитив', neu: 'Нейтрально', neg: 'Негатив' };
function filteredReviews() {
  const f = S.rv, q = f.q.trim().toLowerCase(), from = addDays(TODAY, -f.period);
  let l = REVIEWS.filter(r => r.date >= from && (f.src === 'all' || r.source === f.src) && (!f.ratings.size || f.ratings.has(r.rating)) && (f.sent === 'all' || r.sentiment === f.sent) && (f.status === 'all' || (f.status === 'need' ? !r.replied : r.replied)) && (f.topic === 'all' || r.topics.includes(f.topic)) && (!q || (r.text + ' ' + r.author).toLowerCase().includes(q)));
  if (f.sort === 'low') l = l.sort((a, b) => a.rating - b.rating || b.date - a.date);
  else if (f.sort === 'high') l = l.sort((a, b) => b.rating - a.rating || b.date - a.date);
  else l = l.sort((a, b) => b.date - a.date);
  return l;
}
function renderReviews() {
  const el = $('#tab-reviews');
  if (!el.dataset.ready) {
    el.innerHTML = `
      <div class="filters">
        <label class="field">Площадка <select class="select" id="rvSrc"><option value="all">Все</option>${SOURCES.map(s => `<option>${s}</option>`).join('')}</select></label>
        <div class="chips" id="rvRat">${[5, 4, 3, 2, 1].map(n => `<button class="chip" data-r="${n}">${n} ★</button>`).join('')}</div>
        <label class="field">Тон <select class="select" id="rvSent"><option value="all">Любой</option>${Object.entries(SENT).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
        <label class="field">Тема <select class="select" id="rvTopic"><option value="all">Все</option>${Object.entries(TOPICS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
        <div class="seg" id="rvStatus"><button data-v="all" class="on">Все</button><button data-v="need">Нужен ответ</button><button data-v="done">Отвечено</button></div>
        <div class="seg" id="rvPeriod"><button data-v="30">30 дн.</button><button data-v="90" class="on">90 дн.</button></div>
        <input class="input search" id="rvQ" placeholder="Текст или автор…" aria-label="Поиск отзывов">
        <label class="field">Сортировка <select class="select" id="rvSort"><option value="new">Сначала новые</option><option value="low">Сначала низкие</option><option value="high">Сначала высокие</option></select></label>
      </div>
      <div id="rvBody" style="display:flex;flex-direction:column;gap:20px"></div>`;
    el.dataset.ready = 1;
    $('#rvSrc').onchange = e => { S.rv.src = e.target.value; rvBody(); };
    $('#rvRat').onclick = e => { const c = e.target.closest('.chip'); if (!c) return; const n = +c.dataset.r; S.rv.ratings.has(n) ? S.rv.ratings.delete(n) : S.rv.ratings.add(n); c.classList.toggle('on'); rvBody(); };
    $('#rvSent').onchange = e => { S.rv.sent = e.target.value; rvBody(); };
    $('#rvTopic').onchange = e => { S.rv.topic = e.target.value; rvBody(); };
    segBind('#rvStatus', v => { S.rv.status = v; rvBody(); });
    segBind('#rvPeriod', v => { S.rv.period = +v; rvBody(); });
    $('#rvQ').oninput = e => { S.rv.q = e.target.value; rvBody(); };
    $('#rvSort').onchange = e => { S.rv.sort = e.target.value; rvBody(); };
  }
  rvBody();
}
const stars = n => `<span class="stars" aria-label="${n} из 5">${'★'.repeat(n)}<span class="off">${'★'.repeat(5 - n)}</span></span>`;
function reviewStats(list) {
  const a = avg(list.map(r => r.rating));
  const dist = [5, 4, 3, 2, 1].map(n => list.filter(r => r.rating === n).length);
  const replied = list.filter(r => r.replied).length;
  return { a, dist, replied, need: list.length - replied };
}
function rvBody() {
  const list = filteredReviews();
  const st = reviewStats(list);
  const body = $('#rvBody');
  const prev = REVIEWS.filter(r => r.date < addDays(TODAY, -S.rv.period) && r.date >= addDays(TODAY, -S.rv.period * 2));
  const bySrc = SOURCES.map(s => { const l = list.filter(r => r.source === s); return { s, n: l.length, a: avg(l.map(r => r.rating)) }; });
  body.innerHTML = `
    <div class="grid g-1-1-1">
      <div class="card"><div class="card-head"><div><h3>Сводный рейтинг</h3><p>${list.length} ${plural(list.length, ['отзыв', 'отзыва', 'отзывов'])} в выборке</p></div></div>
        <div style="display:flex;gap:20px;align-items:center"><div><div class="rating-big">${list.length ? nf1.format(st.a) : '—'}</div>${stars(Math.round(st.a || 0))}</div>
        <div class="bars" style="flex:1">${st.dist.map((n, i) => `<div class="bar-row"><span>${5 - i}★</span><div class="bar-track"><div class="bar-fill" style="width:${list.length ? n / list.length * 100 : 0}%"></div></div><span class="num">${n}</span></div>`).join('')}</div></div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:16px">${bySrc.map(x => `<div style="display:flex;align-items:center;justify-content:space-between" class="small"><span class="src"><span class="src-ico" style="background:${srcColor(x.s)}">${srcAbbr(x.s)}</span>${x.s}</span><span class="num muted">${x.n ? nf1.format(x.a) + ' · ' + x.n : '—'}</span></div>`).join('')}</div>
        <div class="kpi-foot" style="margin-top:14px"><span class="tag ${st.need ? 'med' : 'low'}">Ждут ответа: ${st.need}</span><span>доля ответов ${list.length ? pct(st.replied / list.length) : '—'}</span></div>
      </div>
      <div class="card"><div class="card-head"><div><h3>Динамика по неделям</h3><p>Средняя оценка и число отзывов</p></div>${pngBtn('chRvTrend', 'otzyvy-dinamika')}</div><div class="chart-box"><canvas id="chRvTrend"></canvas></div></div>
      <div class="card"><div class="card-head"><div><h3>Темы упоминаний</h3><p>Позитив и негатив по темам</p></div>${pngBtn('chTopics', 'otzyvy-temy')}</div><div class="chart-box"><canvas id="chTopics"></canvas></div></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between"><h3 style="font-size:var(--text-base)">Лента отзывов</h3><span class="muted xs">Прошлый период: ${prev.length ? nf1.format(avg(prev.map(r => r.rating))) + '★ · ' + prev.length + ' отз.' : 'нет данных'}</span></div>
    <div class="card-grid">${list.length ? list.map(rvCard).join('') : empty('Отзывов нет', 'Сбросьте часть фильтров')}</div>`;
  $$('[data-reply]', body).forEach(b => b.onclick = () => replyModal(b.dataset.reply));
  // Тренд
  const weeks = Math.ceil(S.rv.period / 7);
  const wl = [...Array(weeks)].map((_, i) => { const end = addDays(TODAY, -(weeks - 1 - i) * 7), start = addDays(end, -6); const l = list.filter(r => r.date >= start && r.date <= end); return { lbl: fDate(start), a: l.length ? +avg(l.map(r => r.rating)).toFixed(2) : null, n: l.length }; });
  mkChart('chRvTrend', {
    data: { labels: wl.map(w => w.lbl), datasets: [
      { type: 'line', label: 'Оценка', data: wl.map(w => w.a), borderColor: cssv('--brass'), backgroundColor: cssv('--brass'), tension: .3, spanGaps: true, pointRadius: 3, yAxisID: 'y', order: 1 },
      { type: 'bar', label: 'Отзывов', data: wl.map(w => w.n), backgroundColor: cssv('--accent') + '55', borderRadius: 3, yAxisID: 'y1', order: 2 }] },
    options: { scales: { x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 10 } }, y: { min: 1, max: 5, ticks: { stepSize: 1 } }, y1: { position: 'right', grid: { display: false }, beginAtZero: true, ticks: { precision: 0 } } } }
  });
  const tk = Object.keys(TOPICS);
  const tp = tk.map(t => ({ t, pos: list.filter(r => r.topics.includes(t) && r.sentiment === 'pos').length, neg: list.filter(r => r.topics.includes(t) && r.sentiment !== 'pos').length })).sort((a, b) => (b.pos + b.neg) - (a.pos + a.neg));
  mkChart('chTopics', {
    type: 'bar',
    data: { labels: tp.map(x => TOPICS[x.t]), datasets: [{ label: 'Позитив', data: tp.map(x => x.pos), backgroundColor: cssv('--success'), borderRadius: 3 }, { label: 'Негатив/нейтр.', data: tp.map(x => x.neg), backgroundColor: cssv('--danger'), borderRadius: 3 }] },
    options: { indexAxis: 'y', scales: { x: { stacked: true, ticks: { precision: 0 } }, y: { stacked: true, grid: { display: false } } },
      onClick: (e, els) => { if (!els.length) return; const t = tp[els[0].index].t; S.rv.topic = S.rv.topic === t ? 'all' : t; $('#rvTopic').value = S.rv.topic; rvBody(); } }
  });
}
function rvCard(r) {
  return `<article class="item review">${!r.replied ? '<span class="needs" aria-hidden="true"></span>' : ''}
    <div class="item-top"><span class="src"><span class="src-ico" style="background:${srcColor(r.source)}">${srcAbbr(r.source)}</span>${r.source}</span>${stars(r.rating)}</div>
    <p class="review-text" style="margin:0">${esc(r.text)}</p>
    <div class="meta"><span><b>${esc(r.author)}</b></span><span>${r.stay}</span><span>${fDate(r.date, { day: 'numeric', month: 'long' })}</span></div>
    <div class="chips">${r.topics.map(t => `<span class="tag">${TOPICS[t]}</span>`).join('')}<span class="tag ${r.sentiment}">${SENT[r.sentiment]}</span></div>
    <div class="item-foot">${r.replied ? `<span class="muted">${ico('check')} Ответ опубликован</span>` : `<span style="color:var(--brass);font-weight:600">Нужен ответ · ${inDays(r.date)}</span>`}<button class="btn sm ${r.replied ? 'ghost' : ''}" data-reply="${r.id}">${r.replied ? 'Шаблон' : 'Ответить'}</button></div></article>`;
}
function replyDraft(r) {
  const name = r.author.split(' ')[0];
  const t = r.topics.map(x => TOPICS[x].toLowerCase());
  const ACC = { clean: 'чистоту', staff: 'работу персонала', location: 'расположение', breakfast: 'завтраки', noise: 'тишину', wifi: 'Wi-Fi', value: 'соотношение цены и качества', room: 'номер' };
  if (r.sentiment === 'pos') return `${name}, спасибо за тёплый отзыв! Особенно приятно, что вы отметили ${r.topics.map(x => ACC[x]).join(' и ')} — передадим команде. Будем рады снова видеть вас в «${HOTEL.name}».\n\nС уважением, управляющий мини-отеля «${HOTEL.name}»`;
  if (r.sentiment === 'neu') return `${name}, благодарим за отзыв и честную оценку. Замечание по теме «${t[0]}» уже взяли в работу. В следующий приезд напишите нам заранее — подберём подходящий номер.\n\nС уважением, управляющий мини-отеля «${HOTEL.name}»`;
  return `${name}, приносим извинения за неудобства. Ситуацию по темам «${t.join('», «')}» разобрали с командой и приняли меры. Пожалуйста, свяжитесь с нами по телефону ресепшена — хотим лично обсудить и компенсировать впечатление.\n\nС уважением, управляющий мини-отеля «${HOTEL.name}»`;
}
function replyModal(id) {
  const r = REVIEWS.find(x => x.id === id);
  openModal('Ответ на отзыв', `
    <div class="small"><span class="src"><span class="src-ico" style="background:${srcColor(r.source)}">${srcAbbr(r.source)}</span>${r.source}</span> · ${stars(r.rating)} · ${esc(r.author)}</div>
    <blockquote class="muted small" style="margin:0;padding-left:12px;border-left:3px solid var(--border-strong)">${esc(r.text)}</blockquote>
    <div class="form-row"><label for="rTxt">Черновик ответа</label><textarea class="input" id="rTxt">${esc(replyDraft(r))}</textarea></div>
    <div class="modal-actions"><button class="btn" id="rCopy">${ico('copy')}Копировать</button>${r.replied ? '' : `<button class="btn primary" id="rDone">${ico('check')}Отметить отвеченным</button>`}</div>`,
    b => { $('#rCopy', b).onclick = () => copyText($('#rTxt', b).value); const d = $('#rDone', b); if (d) d.onclick = () => { r.replied = true; closeModal(); rvBody(); updateBadges(); toast('Отзыв отмечен как отвеченный'); }; });
}

/* ======================================================================
   МЕТРИКИ
   ====================================================================== */
function periodAgg(days, offset = 0) {
  const l = DAILY.slice(DAILY.length - days - offset, DAILY.length - offset);
  const sold = l.reduce((a, d) => a + d.sold, 0), rev = l.reduce((a, d) => a + d.roomRev, 0), extra = l.reduce((a, d) => a + d.extra, 0);
  const avail = l.length * HOTEL.rooms;
  const ch = CH_NAMES.map((_, i) => l.reduce((a, d) => a + d.channels[i] * d.sold, 0));
  const chT = ch.reduce((a, b) => a + b, 0);
  return { l, occ: sold / avail, adr: sold ? rev / sold : 0, revpar: rev / avail, rev, extra, total: rev + extra, cancel: l.reduce((a, d) => a + d.cancel, 0), checkins: l.reduce((a, d) => a + d.checkins, 0), direct: ch[0] / chT, ch: ch.map(v => v / chT), los: avg(l.map(d => d.los)), sold };
}
function deltaHTML(cur, prev, invert = false, pp = false) {
  if (!prev) return '<span class="delta flat">—</span>';
  const d = pp ? cur - prev : (cur - prev) / prev;
  const good = invert ? d < 0 : d > 0;
  const cls = Math.abs(d) < 0.005 ? 'flat' : good ? 'up' : 'down';
  const val = pp ? (d * 100).toFixed(1).replace('.', ',') + ' п.п.' : pct(Math.abs(d), 1);
  return `<span class="delta ${cls}">${d > 0 ? '▲' : d < 0 ? '▼' : '•'} ${pp ? val.replace('-', '') : val}</span>`;
}
function renderMetrics() {
  const el = $('#tab-metrics');
  if (!el.dataset.ready) {
    el.innerHTML = `<div class="filters"><span class="field">Период</span><div class="seg" id="mtPer"><button data-v="7">7 дней</button><button data-v="30" class="on">30 дней</button><button data-v="90">90 дней</button><button data-v="180">180 дней</button></div><span class="result-count">Сравнение с предыдущим периодом той же длины</span></div><div id="mtBody" style="display:flex;flex-direction:column;gap:20px"></div>`;
    el.dataset.ready = 1;
    segBind('#mtPer', v => { S.mt.period = +v; mtBody(); });
  }
  mtBody();
}
function mtBody() {
  const p = S.mt.period;
  const cur = periodAgg(p), prv = p * 2 <= DAILY.length ? periodAgg(p, p) : null;
  const P = palette();
  const body = $('#mtBody');
  body.innerHTML = `
    <div class="kpis">
      ${kpi('Загрузка', pct(cur.occ, 1), 'к пред. периоду', deltaHTML(cur.occ, prv && prv.occ, false, true))}
      ${kpi('ADR', money(Math.round(cur.adr)), 'средняя цена номера', deltaHTML(cur.adr, prv && prv.adr))}
      ${kpi('RevPAR', money(Math.round(cur.revpar)), 'доход на номер', deltaHTML(cur.revpar, prv && prv.revpar))}
      ${kpi('Выручка', money(cur.total), 'номера + доп. услуги', deltaHTML(cur.total, prv && prv.total))}
      ${kpi('Прямые брони', pct(cur.direct, 1), 'без комиссии OTA', deltaHTML(cur.direct, prv && prv.direct, false, true))}
      ${kpi('Отмены', cur.cancel, `ср. срок ${nf1.format(cur.los)} ноч.`, deltaHTML(cur.cancel, prv && prv.cancel, true))}
    </div>
    <div class="grid g-3-1">
      <div class="card"><div class="card-head"><div><h3>Загрузка и ADR по дням</h3><p>Столбцы — загрузка, линия — ADR</p></div>${pngBtn('chOcc', 'zagruzka-adr')}</div><div class="chart-box tall"><canvas id="chOcc"></canvas></div></div>
      <div class="card"><div class="card-head"><div><h3>Каналы продаж</h3><p>Доля проданных ночей</p></div>${pngBtn('chCh', 'kanaly')}</div><div class="chart-box tall"><canvas id="chCh"></canvas></div></div>
    </div>
    <div class="grid g-2">
      <div class="card"><div class="card-head"><div><h3>Темп бронирований на 30 дней</h3><p>Номера в продаже сейчас и год назад</p></div>${pngBtn('chPace', 'temp-bronirovaniy')}</div><div class="chart-box"><canvas id="chPace"></canvas></div></div>
      <div class="card"><div class="card-head"><div><h3>Загрузка по дням недели</h3><p>За выбранный период</p></div>${pngBtn('chDow', 'zagruzka-dni-nedeli')}</div><div class="chart-box"><canvas id="chDow"></canvas></div></div>
    </div>
    <div class="grid g-2">
      <div class="card"><div class="card-head"><div><h3>Задачи службы номеров</h3><p>Нажмите на статус, чтобы сменить</p></div><span class="tag ${OPS_TASKS.filter(t => t.status !== 'done' && t.prio === 'high').length ? 'high' : 'low'}">Срочных: ${OPS_TASKS.filter(t => t.status !== 'done' && t.prio === 'high').length}</span></div><div id="opsList"></div></div>
      <div class="card"><div class="card-head"><div><h3>Сегодня</h3><p>${fFull(TODAY)}</p></div></div>
        <div class="sum-kpis">
          <div class="sum-kpi"><span class="muted xs">Занято номеров</span><b>${DAILY[DAILY.length - 1].sold} / ${HOTEL.rooms}</b></div>
          <div class="sum-kpi"><span class="muted xs">Заезды</span><b>${DAILY[DAILY.length - 1].checkins}</b></div>
          <div class="sum-kpi"><span class="muted xs">Завтра в продаже</span><b>${PACE[1].ty} / ${HOTEL.rooms}</b></div>
          <div class="sum-kpi"><span class="muted xs">Доп. услуги</span><b>${money(DAILY[DAILY.length - 1].extra)}</b></div>
        </div>
        <div class="reco" style="margin-top:16px">${ico('bulb')}<div>${cur.direct < 0.4 ? 'Доля прямых броней ниже 40%. Добавьте на сайт тариф «−5% при прямом бронировании» и кнопку в Telegram.' : 'Доля прямых броней в норме — держите паритет цен с OTA.'}</div></div>
      </div>
    </div>`;
  opsList();
  const l = cur.l;
  mkChart('chOcc', {
    data: { labels: l.map(d => fDate(d.date)), datasets: [
      { type: 'bar', label: 'Загрузка, %', data: l.map(d => Math.round(d.occ * 100)), backgroundColor: cssv('--accent') + 'AA', borderRadius: 2, yAxisID: 'y', order: 2 },
      { type: 'line', label: 'ADR, ₽', data: l.map(d => d.adr), borderColor: cssv('--brass'), backgroundColor: cssv('--brass'), pointRadius: 0, borderWidth: 2, tension: .3, yAxisID: 'y1', order: 1 }] },
    options: { scales: { x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 14 } }, y: { min: 0, max: 100, ticks: { callback: v => v + '%' } }, y1: { position: 'right', grid: { display: false }, ticks: { callback: v => nf.format(v) } } } }
  });
  mkChart('chCh', {
    type: 'doughnut',
    data: { labels: CH_NAMES, datasets: [{ data: cur.ch.map(v => +(v * 100).toFixed(1)), backgroundColor: P.slice(0, 5), borderColor: cssv('--surface'), borderWidth: 3 }] },
    options: { cutout: '64%', interaction: { mode: 'nearest' }, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => ` ${c.label}: ${String(c.raw).replace('.', ',')}%` } } } }
  });
  mkChart('chPace', {
    type: 'line',
    data: { labels: PACE.map(d => fDate(d.date)), datasets: [
      { label: 'Этот год', data: PACE.map(d => d.ty), borderColor: cssv('--accent'), backgroundColor: cssv('--accent') + '22', fill: true, tension: .3, pointRadius: 0, borderWidth: 2 },
      { label: 'Прошлый год', data: PACE.map(d => d.ly), borderColor: cssv('--faint'), borderDash: [5, 4], tension: .3, pointRadius: 0, borderWidth: 1.6 }] },
    options: { scales: { x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 14 } }, y: { min: 0, max: HOTEL.rooms, ticks: { stepSize: 5 } } } }
  });
  const dn = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const dowOcc = dn.map((_, i) => { const x = l.filter(d => (d.date.getDay() + 6) % 7 === i); return x.length ? Math.round(avg(x.map(d => d.occ)) * 100) : 0; });
  mkChart('chDow', {
    type: 'bar',
    data: { labels: dn, datasets: [{ label: 'Загрузка, %', data: dowOcc, backgroundColor: dn.map((_, i) => i >= 4 && i <= 5 ? cssv('--brass') : cssv('--accent') + '99'), borderRadius: 5 }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { min: 0, max: 100, ticks: { callback: v => v + '%' } } } }
  });
}
const T_STATUS = { open: ['Новая', 'med'], progress: ['В работе', 'accent'], done: ['Готово', 'low'] };
const T_PRIO = { high: 'Срочно', med: 'Обычно', low: 'Низкий' };
function opsList() {
  const order = { open: 0, progress: 1, done: 2 };
  $('#opsList').innerHTML = [...OPS_TASKS].sort((a, b) => order[a.status] - order[b.status]).map(t => `<div class="task ${t.status === 'done' ? 'past' : ''}"><span class="task-room">${t.room}</span><div><div class="small" style="font-weight:500">${esc(t.title)}</div><div class="faint xs">${t.kind} · ${T_PRIO[t.prio]} · ${inDays(t.created)}</div></div><button class="tag ${T_STATUS[t.status][1]}" style="border:0;cursor:pointer" data-task="${t.id}">${T_STATUS[t.status][0]}</button></div>`).join('');
  $$('[data-task]').forEach(b => b.onclick = () => { const t = OPS_TASKS.find(x => x.id === b.dataset.task); t.status = t.status === 'open' ? 'progress' : t.status === 'progress' ? 'done' : 'open'; opsList(); });
}


/* ======================================================================
   ОБЩЕПИТ
   ====================================================================== */
const FOOD_GROUP = t => /ланч|обед/i.test(t) ? 'Обед и ланч' : /рожд/i.test(t) ? 'День рождения' : /событ|хэллоуин|тематич/i.test(t) ? 'События и вечеринки' : /кешб|банк|промокод|первое/i.test(t) ? 'Кешбэк, банк, промокоды' : 'Скидки и бонусы';
function filteredFood() {
  const f = S.fd, q = f.q.trim().toLowerCase();
  return FOOD.filter(x => (f.type === 'all' || FOOD_GROUP(x.type) === f.type) && (f.kind === 'all' || x.kind === f.kind) && (!q || (x.place + ' ' + x.title + ' ' + x.addr).toLowerCase().includes(q)) && (!x.until || x.until >= TODAY));
}
function foodAnalysis() {
  const act = FOOD.filter(x => !x.until || x.until >= TODAY);
  const by = {}; act.forEach(x => { const g = FOOD_GROUP(x.type); by[g] = (by[g] || 0) + 1; });
  const lunches = act.filter(x => /ланч|обед/i.test(x.type)).map(x => ({ x, p: numCell((x.value.match(/\d[\d\s]*/) || [''])[0]) })).filter(o => o.p && o.p > 100);
  const checks = [...new Set(act.filter(x => x.check).map(x => x.place + '|' + x.check))].map(k => +k.split('|')[1]);
  const top = Object.entries(by).sort((a, b) => b[1] - a[1]);
  const L = [];
  if (top.length) L.push(`Главная механика октября — «${top[0][0]}» (${top[0][1]} из ${act.length}). Прямых ценовых скидок «на всё меню» почти нет: заведения центра конкурируют поводами (день рождения, Хэллоуин, музыкальные вечера) и лояльностью, а не ценой.`);
  if (lunches.length) L.push(`Обеды в будни — самый массовый вход в ресторан: от ${money(Math.min(...lunches.map(o => o.p)))} (${lunches.sort((a, b) => a.p - b.p)[0].x.place}) до ${money(Math.max(...lunches.map(o => o.p)))}; Кицуне Изакая даёт −20% на кухню пн–пт 12:00–16:00.`);
  if (checks.length) L.push(`Средний чек участников — ${money(Math.min(...checks))}–${money(Math.max(...checks))}, медиана ${money(median(checks))}: это ориентир для пакета «ночь + ужин».`);
  L.push('Онлайн-бронирование через агрегатор (кешбэк 3%) и банковские программы (комплимент и кешбэк 10–15% в «Магадане») смещают выбор гостя в сторону площадок-посредников.');
  const reco = [
    `Договориться с 1–2 заведениями в шаговой доступности (Кицуне Изакая — Большая Садовая, 128) о скидке для гостей «${HOTEL.name}» по ключ-карте: это бесплатное УТП к тарифу.`,
    'Собрать пакеты под пиковые даты: 24–25 октября (SHAMAN, Ростов — Локомотив), 30–31 октября (ВинаРека, Любэ, Хэллоуин) — «2 ночи + ужин/дегустация».',
    'Для деловых гостей 11–13 ноября (Horeca Don, «Ростов Гостеприимный») предложить тариф «с завтраком и бизнес-ланчем» вместе с ближайшим рестораном.',
    'Добавить в приветственное письмо гостю подборку актуальных акций общепита — повышает оценку за «расположение» и «сервис» в отзывах.'
  ];
  return { act, by, top, L, reco };
}
function renderFood() {
  const el = $('#tab-food');
  if (!el.dataset.ready) {
    const kinds = [...new Set(FOOD.map(x => x.kind).filter(Boolean))].sort();
    const groups = [...new Set(FOOD.map(x => FOOD_GROUP(x.type)))];
    el.innerHTML = `
      <div class="filters">
        <label class="field">Механика <select class="select" id="fdType"><option value="all">Все</option>${groups.map(g => `<option>${g}</option>`).join('')}</select></label>
        <label class="field">Заведение <select class="select" id="fdKind"><option value="all">Любое</option>${kinds.map(k => `<option>${esc(k)}</option>`).join('')}</select></label>
        <input class="input search" id="fdQ" placeholder="Название, адрес…" aria-label="Поиск акций общепита">
        <span class="result-count" id="fdCount"></span>
        <button class="btn sm" id="fdCsv">${ico('download')}CSV</button>
      </div>
      <div id="fdBody" style="display:flex;flex-direction:column;gap:20px"></div>`;
    el.dataset.ready = 1;
    $('#fdType').onchange = e => { S.fd.type = e.target.value; fdBody(); };
    $('#fdKind').onchange = e => { S.fd.kind = e.target.value; fdBody(); };
    $('#fdQ').oninput = e => { S.fd.q = e.target.value; fdBody(); };
    $('#fdCsv').onclick = () => CSV.food(false);
  }
  fdBody();
}
function fdBody() {
  const list = filteredFood(), A = foodAnalysis(), P = palette();
  $('#fdCount').textContent = `${list.length} ${plural(list.length, ['предложение', 'предложения', 'предложений'])}`;
  const places = new Set(A.act.map(x => x.place)).size;
  const dated = A.act.filter(x => x.until && x.until <= addDays(TODAY, 31)).length;
  const checks = A.act.filter(x => x.check).map(x => x.check);
  if (!FOOD.length) { $('#fdBody').innerHTML = empty('Нет данных', 'Заполните лист «Общепит» в Google Таблице'); return; }
  $('#fdBody').innerHTML = `
    <div class="kpis">
      ${kpi('Актуальных предложений', A.act.length, 'проверено ' + fDate(FOOD[0].found))}
      ${kpi('Заведений', places, 'центр и события города')}
      ${kpi('С датой в октябре–ноябре', dated, 'событийные и срочные')}
      ${kpi('Средний чек (медиана)', checks.length ? money(median(checks)) : '—', 'по данным ТоМесто')}
    </div>
    <div class="grid g-3-1">
      <div class="card"><div class="card-head"><div><h3>Анализ акций октября</h3><p>Что делают кафе и рестораны центра</p></div></div>
        <ul class="analysis">${A.L.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        <h4 style="margin:16px 0 8px">Что это значит для «${esc(HOTEL.name)}»</h4>
        <div style="display:flex;flex-direction:column;gap:8px">${A.reco.map(t => `<div class="reco">${ico('bulb')}<div>${esc(t)}</div></div>`).join('')}</div>
      </div>
      <div class="card"><div class="card-head"><div><h3>Механики</h3><p>Число предложений</p></div>${pngBtn('chFood', 'akcii-obshchepita')}</div><div class="chart-box tall"><canvas id="chFood"></canvas></div></div>
    </div>
    <div class="card-grid">${list.map(x => `<article class="item">
      <div class="item-top"><span class="tag accent">${esc(x.type)}</span>${x.until ? `<span class="tag ${dayDiff(x.until, TODAY) <= 3 ? 'high' : 'brass'}">до ${fDate(x.until)}</span>` : `<span class="tag">${esc(x.cond || 'постоянная')}</span>`}</div>
      <h4>${esc(x.place)}</h4>
      <p class="small" style="margin:0">${esc(x.title)}</p>
      <div class="meta"><span>${ico('pin')}${esc(x.addr || '—')}</span>${x.kind ? `<span>${esc(x.kind)}</span>` : ''}${x.check ? `<span>чек ${money(x.check)}</span>` : ''}</div>
      <div class="item-foot"><span>Выгода: <b>${esc(x.value || '—')}</b>${x.until && x.cond ? ` <span class="muted">· ${esc(x.cond)}</span>` : ''}</span>${srcLink(x.src)}</div>
    </article>`).join('') || empty('Ничего не найдено', 'Измените фильтры')}</div>`;
  hydrateIcons($('#fdBody'));
  mkChart('chFood', { type: 'bar', data: { labels: A.top.map(t => t[0]), datasets: [{ data: A.top.map(t => t[1]), backgroundColor: A.top.map((t, i) => P[i % P.length]), borderRadius: 5, barThickness: 20 }] }, options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { precision: 0 } }, y: { grid: { display: false } } } } });
}

/* ======================================================================
   СВОДКА
   ====================================================================== */
const SECTIONS = { kpi: 'Ключевые метрики (30 дней)', events: 'Ближайшие события', rates: 'Позиция по ценам', promos: 'Новые акции конкурентов', food: 'Акции общепита', reviews: 'Отзывы', ops: 'Операционные задачи', reco: 'Рекомендации' };
function summaryData() {
  const m = periodAgg(30), mp = periodAgg(30, 30);
  const evs = EVENTS.filter(e => e.end >= TODAY && e.start <= addDays(TODAY, 30)).sort((a, b) => ({ high: 0, med: 1, low: 2 }[a.impact] - { high: 0, med: 1, low: 2 }[b.impact]) || a.start - b.start).slice(0, 6);
  const rs = rateStats('std', 14);
  const promos = PROMOS.filter(p => p.isNew);
  const rv30 = REVIEWS.filter(r => r.date >= addDays(TODAY, -30));
  const need = REVIEWS.filter(r => !r.replied);
  const neg = rv30.filter(r => r.sentiment === 'neg');
  const topNeg = Object.keys(TOPICS).map(t => ({ t, n: neg.filter(r => r.topics.includes(t)).length })).sort((a, b) => b.n - a.n).filter(x => x.n)[0];
  const tasks = OPS_TASKS.filter(t => t.status !== 'done');
  const under = rs.gaps.filter(g => g.gap > 0.08);
  const reco = [];
  if (under.length) reco.push(`Поднять тариф на ${under.length} ${plural(under.length, ['дату', 'даты', 'дат'])} в ближайшие 14 дней: рынок дороже на 8%+ (${under.slice(0, 4).map(g => fDate(g.d)).join(', ')}).`);
  evs.filter(e => e.impact === 'high').slice(0, 2).forEach(e => reco.push(`«${e.title}» (${fDate(e.start)}): закрыть скидки, мин. срок 2 ночи, тариф от ${money(recoRate(e))}.`));
  if (need.length) reco.push(`Ответить на ${need.length} ${plural(need.length, ['отзыв', 'отзыва', 'отзывов'])} без ответа — начать с оценок 1–2★.`);
  if (topNeg) reco.push(`Чаще всего жалуются на тему «${TOPICS[topNeg.t]}» (${topNeg.n} за 30 дней) — назначить ответственного.`);
  if (m.direct < 0.4) reco.push(`Доля прямых броней ${pct(m.direct, 1)} — запустить тариф для бронирования на сайте.`);
  if (promos.some(p => p.type === 'early')) reco.push('Конкуренты открыли раннее бронирование на Новый год — подготовить свой пакет до конца месяца.');
  const fa = foodAnalysis();
  return { m, mp, evs, rs, promos, rv30, need, tasks, reco, fa };
}
function renderSummary() {
  const el = $('#tab-summary');
  const d = summaryData();
  const on = k => S.sm.sections.has(k);
  el.innerHTML = `<div class="grid g-3-1">
    <div class="summary-doc" id="sumDoc">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <div><h2>Сервис-радар: сводка по отелю «${HOTEL.name}»</h2><div class="muted small">${HOTEL.city} · на ${fFull(TODAY)}</div></div>
        <svg viewBox="0 0 40 40" width="36" height="36" fill="none" style="color:var(--accent)"><path d="M10 33V18a10 10 0 0 1 20 0v15" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M15.5 21a4.5 4.5 0 0 1 9 0" stroke="var(--brass)" stroke-width="2.2" stroke-linecap="round"/><circle cx="20" cy="23" r="2.2" fill="var(--brass)"/><path d="M6 33h28" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
      </div>
      ${on('kpi') ? `<h3>${SECTIONS.kpi}${DATA_SOURCE.demoTabs.includes('Метрики') ? ' (демо)' : ''}</h3><div class="sum-kpis">
        <div class="sum-kpi"><span class="muted xs">Загрузка</span><b>${pct(d.m.occ, 1)}</b>${deltaHTML(d.m.occ, d.mp.occ, false, true)}</div>
        <div class="sum-kpi"><span class="muted xs">ADR</span><b>${money(Math.round(d.m.adr))}</b>${deltaHTML(d.m.adr, d.mp.adr)}</div>
        <div class="sum-kpi"><span class="muted xs">RevPAR</span><b>${money(Math.round(d.m.revpar))}</b>${deltaHTML(d.m.revpar, d.mp.revpar)}</div>
        <div class="sum-kpi"><span class="muted xs">Выручка</span><b>${money(d.m.total)}</b>${deltaHTML(d.m.total, d.mp.total)}</div>
        <div class="sum-kpi"><span class="muted xs">Прямые брони</span><b>${pct(d.m.direct, 1)}</b>${deltaHTML(d.m.direct, d.mp.direct, false, true)}</div></div>` : ''}
      ${on('events') ? `<h3>${SECTIONS.events} (30 дней)</h3>${d.evs.length ? `<div class="table-wrap"><table><thead><tr><th>Даты</th><th>Событие</th><th>Влияние</th><th class="r">Реком. тариф</th></tr></thead><tbody>${d.evs.map(e => `<tr><td>${fDate(e.start)}${e.end > e.start ? '–' + fDate(e.end) : ''}</td><td style="white-space:normal">${esc(e.title)}</td><td><span class="tag ${e.impact}">${IMPACT[e.impact].label}</span></td><td class="r">${money(recoRate(e))}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Значимых событий нет.</p>'}` : ''}
      ${on('rates') ? `<h3>${SECTIONS.rates} · Стандарт, 14 дней</h3><ul>
        <li>Наш средний тариф <b>${money(d.rs.ourAvg)}</b>, медиана рынка <b>${money(d.rs.medAvg)}</b> (индекс ${Math.round(d.rs.ourAvg / d.rs.medAvg * 100)}%).</li>
        <li>Позиция по цене: <b>${d.rs.rank} из ${COMPETITORS.length}</b> (1 — самый дешёвый).</li>
        <li>У конкурентов нет мест: ${d.rs.soldOut} объекто-дней за ближайшие 7 дней.</li></ul>` : ''}
      ${on('promos') ? `<h3>${SECTIONS.promos}</h3>${d.promos.length ? `<ul>${d.promos.map(p => `<li><b>${esc(COMPETITORS.find(c => c.id === p.comp).short)}</b>: ${esc(p.title)} (${esc(p.value)}, ${esc(p.channel)}, ${p.untilSet === false ? 'срок не указан' : 'до ' + fDate(p.until)})</li>`).join('')}</ul>` : '<p class="muted small">Новых акций нет.</p>'}` : ''}
      ${on('food') && d.fa.act.length ? `<h3>${SECTIONS.food}</h3><ul>${d.fa.L.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      ${on('reviews') ? `<h3>${SECTIONS.reviews} · 30 дней${DATA_SOURCE.demoTabs.includes('Отзывы') ? ' (демо)' : ''}</h3><ul>
        <li>Получено <b>${d.rv30.length}</b>, средняя оценка <b>${nf1.format(avg(d.rv30.map(r => r.rating)))}★</b>.</li>
        <li>Без ответа: <b>${d.need.length}</b>, из них с оценкой 1–2★: ${d.need.filter(r => r.rating <= 2).length}.</li>
        <li>Негатив: ${d.rv30.filter(r => r.sentiment === 'neg').length} · Позитив: ${d.rv30.filter(r => r.sentiment === 'pos').length}.</li></ul>` : ''}
      ${on('ops') ? `<h3>${SECTIONS.ops}</h3>${d.tasks.length ? `<ul>${d.tasks.map(t => `<li>${t.room}: ${esc(t.title)} — ${T_STATUS[t.status][0].toLowerCase()}${t.prio === 'high' ? ', <b>срочно</b>' : ''}</li>`).join('')}</ul>` : '<p class="muted small">Открытых задач нет.</p>'}` : ''}
      ${on('reco') ? `<h3>${SECTIONS.reco}</h3><ul>${d.reco.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
      <p class="faint xs" style="margin-top:28px">Сформировано в «Сервис-радаре мини-отеля». Источник: Google Таблица «Сервис-радар · ${esc(HOTEL.name)} — данные».</p>
    </div>
    <div class="no-print" style="display:flex;flex-direction:column;gap:20px">
      <div class="card"><div class="card-head"><div><h3>Разделы отчёта</h3><p>Влияют на печать, Markdown и текст</p></div></div>
        ${Object.entries(SECTIONS).map(([k, v]) => `<label class="check"><input type="checkbox" data-sec="${k}" ${on(k) ? 'checked' : ''}>${v}</label>`).join('')}</div>
      <div class="card"><div class="card-head"><div><h3>Экспорт сводки</h3></div></div><div class="export-list">
        <button class="btn primary" id="sPrint">${ico('print')}Печать / сохранить PDF</button>
        <button class="btn" id="sMd">${ico('doc')}Скачать Markdown</button>
        <button class="btn" id="sCopy">${ico('copy')}Копировать для Telegram</button>
        <button class="btn" id="sJson">${ico('download')}Все данные JSON</button></div></div>
      <div class="card"><div class="card-head"><div><h3>Выгрузка таблиц CSV</h3><p>Разделитель «;», открывается в Excel</p></div></div><div class="export-list">
        <button class="btn" data-csv="events">${ico('download')}События</button>
        <button class="btn" data-csv="rates">${ico('download')}Тарифы конкурентов</button>
        <button class="btn" data-csv="promos">${ico('download')}Акции</button>
        <button class="btn" data-csv="food">${ico('download')}Акции общепита</button>
        <button class="btn" data-csv="reviews">${ico('download')}Отзывы</button>
        <button class="btn" data-csv="metrics">${ico('download')}Метрики по дням</button></div></div>
    </div></div>`;
  $$('[data-sec]', el).forEach(c => c.onchange = () => { c.checked ? S.sm.sections.add(c.dataset.sec) : S.sm.sections.delete(c.dataset.sec); renderSummary(); });
  $('#sPrint').onclick = () => window.print();
  $('#sMd').onclick = () => download(`svodka-${isoDate(TODAY)}.md`, summaryMarkdown(), 'text/markdown;charset=utf-8');
  $('#sCopy').onclick = () => copyText(summaryMarkdown(true));
  $('#sJson').onclick = () => download(`servis-radar-${isoDate(TODAY)}.json`, JSON.stringify({ hotel: HOTEL, date: isoDate(TODAY), events: EVENTS, competitors: COMPETITORS, promos: PROMOS, food: FOOD, reviews: REVIEWS, daily: DAILY.map(d => ({ ...d, date: isoDate(d.date) })), tasks: OPS_TASKS }, null, 2), 'application/json');
  $$('[data-csv]', el).forEach(b => b.onclick = () => CSV[b.dataset.csv](true));
}
function summaryMarkdown(tg = false) {
  const d = summaryData(), on = k => S.sm.sections.has(k);
  const b = s => tg ? `*${s}*` : `**${s}**`;
  const h = s => tg ? `\n${b(s)}` : `\n## ${s}`;
  const L = [];
  L.push(tg ? b(`Сервис-радар · «${HOTEL.name}» · ${fFull(TODAY)}`) : `# Сервис-радар: сводка по отелю «${HOTEL.name}»\n\n${HOTEL.city} · ${fFull(TODAY)}`);
  if (on('kpi')) { L.push(h(SECTIONS.kpi)); if (tg) L.push(`Загрузка ${pct(d.m.occ, 1)} · ADR ${money(Math.round(d.m.adr))} · RevPAR ${money(Math.round(d.m.revpar))} · Выручка ${money(d.m.total)} · Прямые ${pct(d.m.direct, 1)}`); else L.push('', '| Метрика | Значение |', '|---|---|', `| Загрузка | ${pct(d.m.occ, 1)} |`, `| ADR | ${money(Math.round(d.m.adr))} |`, `| RevPAR | ${money(Math.round(d.m.revpar))} |`, `| Выручка | ${money(d.m.total)} |`, `| Прямые брони | ${pct(d.m.direct, 1)} |`); }
  if (on('events')) { L.push(h(SECTIONS.events)); d.evs.forEach(e => L.push(`- ${fDate(e.start)} — ${e.title} (${IMPACT[e.impact].label.toLowerCase()}), тариф от ${money(recoRate(e))}`)); }
  if (on('rates')) { L.push(h(SECTIONS.rates)); L.push(`- Наш средний ${money(d.rs.ourAvg)} vs медиана ${money(d.rs.medAvg)}; позиция ${d.rs.rank} из ${COMPETITORS.length}`); }
  if (on('promos')) { L.push(h(SECTIONS.promos)); d.promos.forEach(p => L.push(`- ${COMPETITORS.find(c => c.id === p.comp).short}: ${p.title} (${p.value})`)); }
  if (on('food') && d.fa.act.length) { L.push(h(SECTIONS.food)); d.fa.L.forEach(t => L.push('- ' + t)); }
  if (on('reviews')) { L.push(h(SECTIONS.reviews)); L.push(`- За 30 дней: ${d.rv30.length}, средняя ${nf1.format(avg(d.rv30.map(r => r.rating)))}★; без ответа ${d.need.length}`); }
  if (on('ops')) { L.push(h(SECTIONS.ops)); d.tasks.forEach(t => L.push(`- ${t.room}: ${t.title} — ${T_STATUS[t.status][0].toLowerCase()}`)); }
  if (on('reco')) { L.push(h(SECTIONS.reco)); d.reco.forEach((r, i) => L.push(`${i + 1}. ${r}`)); }
  return L.join('\n');
}

/* ---------- CSV ---------- */
const CSV = {
  events: (all) => download('sobytiya.csv', toCSV(all ? EVENTS : filteredEvents(), [['Начало', e => isoDate(e.start)], ['Окончание', e => isoDate(e.end)], ['Событие', 'title'], ['Категория', e => EVENT_CATS[e.cat]], ['Площадка', 'venue'], ['Посетители', 'att'], ['Влияние', e => IMPACT[e.impact].label], ['Реком. тариф Стандарт', e => recoRate(e)], ['Заметка', 'note'], ['Источник', e => e.src || '']]), 'text/csv;charset=utf-8'),
  rates: () => { const rows = []; for (const c of COMPETITORS) for (const rt of ['std', 'dlx']) for (const x of RATES[c.id][rt]) if (x.date >= TODAY) rows.push({ c: c.short, rt: rt === 'std' ? 'Стандарт' : 'Делюкс', d: isoDate(x.date), p: x.price }); download('tarify.csv', toCSV(rows, [['Дата', 'd'], ['Объект', 'c'], ['Категория', 'rt'], ['Цена, ₽', r => r.p == null ? 'нет мест' : r.p]]), 'text/csv;charset=utf-8'); },
  promos: (all) => download('akcii.csv', toCSV(all ? PROMOS : filteredPromos(), [['Найдена', p => isoDate(p.found)], ['Объект', p => COMPETITORS.find(c => c.id === p.comp).short], ['Тип', p => PROMO_TYPES[p.type]], ['Акция', 'title'], ['Выгода', 'value'], ['Канал', 'channel'], ['Действует до', p => p.untilSet === false ? '' : isoDate(p.until)], ['Новая', p => p.isNew ? 'да' : 'нет'], ['Источник', p => p.src || '']]), 'text/csv;charset=utf-8'),
  food: (all) => download('akcii-obshchepita.csv', toCSV(all ? FOOD : filteredFood(), [['Найдено', x => isoDate(x.found)], ['Заведение', 'place'], ['Адрес', 'addr'], ['Тип заведения', 'kind'], ['Тип акции', 'type'], ['Акция', 'title'], ['Выгода', 'value'], ['Условия', 'cond'], ['Действует до', x => x.until ? isoDate(x.until) : ''], ['Средний чек', 'check'], ['Источник', 'src']]), 'text/csv;charset=utf-8'),
  reviews: (all) => download('otzyvy.csv', toCSV(all ? REVIEWS : filteredReviews(), [['Дата', r => isoDate(r.date)], ['Площадка', 'source'], ['Автор', 'author'], ['Оценка', 'rating'], ['Тон', r => SENT[r.sentiment]], ['Темы', r => r.topics.map(t => TOPICS[t]).join(', ')], ['Номер', 'stay'], ['Ответ', r => r.replied ? 'да' : 'нет'], ['Текст', 'text']]), 'text/csv;charset=utf-8'),
  metrics: (all) => { const l = all ? DAILY : periodAgg(S.mt.period).l; download('metriki.csv', toCSV(l, [['Дата', d => isoDate(d.date)], ['Продано номеров', 'sold'], ['Загрузка, %', d => Math.round(d.occ * 100)], ['ADR, ₽', 'adr'], ['RevPAR, ₽', 'revpar'], ['Выручка номеров, ₽', 'roomRev'], ['Доп. услуги, ₽', 'extra'], ['Заезды', 'checkins'], ['Отмены', 'cancel']]), 'text/csv;charset=utf-8'); }
};
const EXPORT = { events: () => CSV.events(false), rates: () => CSV.rates(), food: () => CSV.food(false), reviews: () => CSV.reviews(false), metrics: () => CSV.metrics(false), summary: () => download(`svodka-${isoDate(TODAY)}.md`, summaryMarkdown(), 'text/markdown;charset=utf-8') };
const RENDER = { events: renderEvents, rates: renderRates, food: renderFood, reviews: renderReviews, metrics: renderMetrics, summary: renderSummary };

function updateBadges() {
  const hi = EVENTS.filter(e => e.impact === 'high' && e.end >= TODAY && e.start <= addDays(TODAY, 30)).length;
  $('#b-events').textContent = hi || '';
  $('#b-rates').textContent = PROMOS.filter(p => p.isNew).length || '';
  $('#b-reviews').textContent = DATA_SOURCE.demoTabs.includes('Отзывы') ? '' : (REVIEWS.filter(r => !r.replied).length || '');
  $('#b-food').textContent = FOOD.filter(x => x.until && x.until >= TODAY && x.until <= addDays(TODAY, 7)).length || '';
}

/* ---------- Источник данных ---------- */
function renderSource() {
  $('#hotelName').textContent = '«' + HOTEL.name + '»';
  $('#hotelMeta').textContent = `${HOTEL.city} · ${HOTEL.rooms} ${plural(HOTEL.rooms, ['номер', 'номера', 'номеров'])}`;
  document.title = 'Сервис-радар мини-отеля · ' + HOTEL.name;
  const el = $('#srcStatus'), t = d => d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  el.className = 'src-status ' + DATA_SOURCE.mode;
  const txt = DATA_SOURCE.mode === 'live' ? `Google Таблица · онлайн, ${t(DATA_SOURCE.at)}`
    : DATA_SOURCE.mode === 'snapshot' ? `Google Таблица · снимок от ${t(DATA_SOURCE.at)}${DATA_SOURCE.error ? '. Онлайн-доступ закрыт' : ''}`
    : 'Демо-данные';
  el.innerHTML = `<span class="dot"></span><span>${txt}</span>`;
  $('#sheetLink').href = SHEET_URL;
}
function rerenderAll() {
  $$('.tab').forEach(t => { delete t.dataset.ready; t.innerHTML = ''; });
  S.rt.hidden.clear(); S.ev.cats.clear(); S.rv.ratings.clear(); S.fd = { type: 'all', kind: 'all', q: '' };
  renderSource(); updateBadges(); setTab(S.tab);
}
async function syncLive(manual) {
  const b = $('#syncBtn'); b.disabled = true; b.textContent = '…';
  try { await loadSheetLive(); rerenderAll(); if (manual) toast('Данные загружены из Google Таблицы'); }
  catch (e) { DATA_SOURCE.error = e.message; renderSource(); if (manual) toast('Нет онлайн-доступа к таблице — показан последний снимок'); }
  finally { b.disabled = false; b.textContent = 'Обновить'; }
}
$('#syncBtn').onclick = () => syncLive(true);

/* ---------- Старт ---------- */
hydrateIcons();
renderSource();
applyTheme();
updateBadges();
$('#updated').textContent = 'Обновлено ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
const start = (location.hash || '').slice(1);
setTab(RENDER[start] ? start : 'events');
syncLive(false);
})();
