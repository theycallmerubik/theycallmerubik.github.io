// ---------- Clock dial ticks ----------
(function buildTicks() {
  const ticks = document.getElementById('ticks');
  if (!ticks) return;
  const cx = 71, cy = 71;
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const isHour = i % 5 === 0;
    const r1 = isHour ? 60 : 63;
    const r2 = 66;
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke-width', isHour ? 1.4 : 0.6);
    if (isHour) line.setAttribute('stroke', '#e6e9ff');
    ticks.appendChild(line);
  }
})();

// ---------- Date display ----------
let hs, hts, hm, htm, hh, hth, flag;

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function renderDateCells(parts) {
  const el = document.getElementById('date');
  el.innerHTML = parts.map((p) => `<span>${p}</span>`).join('');
}

function showGregorianDate() {
  const today = new Date();
  const y = today.getFullYear();
  const century = Math.floor(y / 100);
  const yy = y - century * 100;
  renderDateCells([century, pad2(yy), pad2(today.getMonth() + 1), pad2(today.getDate())]);

  const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const persianDayIndex = (today.getDay() + 1) % 7;
  document.getElementById('weekday').textContent = daysOfWeek[persianDayIndex];

  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((today - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  document.getElementById('week-type').textContent = (weekNumber % 2 === 0) ? 'Even' : 'Odd';
  document.getElementById('calendar-name').textContent = 'Gregorian';
  document.body.classList.remove('rtl');
  flag = false;
}

function showJalaliDate() {
  const today = new Date();
  const shamsi = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const century = Math.floor(shamsi.jy / 100);
  const yy = shamsi.jy - century * 100;
  renderDateCells([century, pad2(yy), pad2(shamsi.jm), pad2(shamsi.jd)]);

  const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  const persianDayIndex = (today.getDay() + 1) % 7;
  document.getElementById('weekday').textContent = daysOfWeek[persianDayIndex];

  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((today - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  document.getElementById('week-type').textContent = (weekNumber % 2 === 0) ? 'زوج' : 'فرد';
  document.getElementById('calendar-name').textContent = 'Jalali';
  document.body.classList.add('rtl');
  flag = true;
}

showJalaliDate();

// ---------- Swap button ----------
document.querySelector('.swap').addEventListener('click', () => {
  const btn = document.querySelector('.swap');
  btn.classList.toggle('rotate');
  if (flag) showGregorianDate(); else showJalaliDate();
  setTimeout(() => btn.classList.toggle('rotate'), 1000);
});

// ---------- Theme toggle ----------
document.querySelector('.mode button').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const isLight = document.body.classList.toggle('Light-mode');
  btn.style.transform = isLight ? 'translateX(24px)' : 'translateX(0px)';
});

// ---------- Analog clock animation ----------
function lerp(a, b, t) { return a + (b - a) * t; }

let last = new Date(), lastSecond = 0, delta = 0, sDeg = 0, mDeg = 0;

function seconds(s) {
  let target = (s / 60) * 360;
  if (target === 0 && sDeg > 300) sDeg = -6;
  sDeg = lerp(sDeg, target, Math.min(1, delta * 24));
  hs.transform('R ' + sDeg + ',71,71');
  if (hts) hts.transform('R ' + (-sDeg) + ',71,71');
}
function minutes(m) {
  let target = (m / 60) * 360;
  if (target === 0 && mDeg > 300) mDeg = -6;
  mDeg = lerp(mDeg, target, Math.min(1, delta * 24));
  hm.transform('T0,0 R ' + mDeg + ',71,71');
  if (htm) htm.transform('T0,0 R ' + (-mDeg) + ',71,71');
}
function hours(h, m) {
  const deg = ((h % 12) + m / 60) / 12 * 360;
  hh.transform('T0,0 R ' + deg + ',71,71');
  if (hth) hth.transform('T0,0 R ' + (-deg) + ',71,71');
}
function updateTimes(s, m, h) {
  document.querySelectorAll('.displayS').forEach(el => el.textContent = pad2(s));
  document.querySelectorAll('.displayM').forEach(el => el.textContent = pad2(m));
  document.querySelectorAll('.displayH').forEach(el => el.textContent = pad2(h));
}

function draw() {
  const now = new Date();
  delta = (now.getTime() - last.getTime()) / 1000;
  last = now;
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  seconds(s); minutes(m); hours(h, m);
  if (s !== lastSecond) updateTimes(s, m, h);
  lastSecond = s;
  requestAnimationFrame(draw);
}

window.addEventListener('load', () => {
  const c = Snap('#clock');
  hs  = c.select('#handS');  hts = c.select('#handTextS');
  hm  = c.select('#handM');  htm = c.select('#handTextM');
  hh  = c.select('#handH');  hth = c.select('#handTextH');
  if (hs && hm && hh) draw();
  // Refresh date at next midnight then daily
  const now = new Date();
  const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
  setTimeout(() => {
    (flag ? showJalaliDate : showGregorianDate)();
    setInterval(() => (flag ? showJalaliDate : showGregorianDate)(), 86400000);
  }, msToMidnight);
});