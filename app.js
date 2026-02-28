/* ═══════════════════════════════════════════════════════════
   STAMCAR — app.js
   Data source: Google Sheets (public)
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── GOOGLE SHEETS CONFIG ────────────────────────────────── */
// Για να προσθέσεις/αφαιρέσεις αμάξι: άνοιξε το Google Sheet και άλλαξε γραμμές
const SHEET_ID  = '1SGtbhM-LnqbeR4t3P_iV2cA8ip8gvroM9lbUF5ZhXTg';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Φύλλο1`;

/* ── AI Valuation ────────────────────────────────────────── */
const BASE_PRICES = {
  'BMW':46000,'Mercedes-Benz':50000,'Audi':44000,'Volkswagen':30000,
  'Toyota':28000,'Ford':26000,'Hyundai':24000,'Kia':23000,
  'Nissan':22000,'Opel':20000
};
const FUEL_FACTORS      = { petrol:1.0, diesel:1.05, hybrid:1.12, electric:1.2, lpg:0.85 };
const CONDITION_FACTORS = { excellent:1.0, good:0.88, fair:0.74, poor:0.58 };
const CONDITION_GR      = { excellent:'Άριστη', good:'Καλή', fair:'Μέτρια', poor:'Κακή' };
const FUEL_GR           = { petrol:'Βενζίνη', diesel:'Diesel', hybrid:'Υβριδικό', electric:'Ηλεκτρικό', lpg:'LPG/CNG' };

/* ── Global data ─────────────────────────────────────────── */
let ALL_CARS = [];

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounters();
  initReveal();
  initValuation();
  initContact();
  initModal();
  initCursorGlow();
  loadCars();
});

/* ════════════════════════════════════════════════════════════
   LOAD CARS FROM GOOGLE SHEETS
   ════════════════════════════════════════════════════════════ */
async function loadCars() {
  showLoading(true);
  try {
    const res  = await fetch(SHEET_URL);
    const text = await res.text();

    // Google wraps response in /*O_o*/ google.visualization.Query.setResponse({...});
    const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1]);
    const rows = json.table.rows;
    const cols = json.table.cols.map(c => c.label.toLowerCase().trim());

    ALL_CARS = rows
      .map(row => {
        const car = {};
        cols.forEach((col, i) => {
          const cell = row.c[i];
          car[col] = cell ? (cell.v !== null && cell.v !== undefined ? cell.v : '') : '';
        });
        // Parse features: comma or pipe separated string → array
        if (car.features && typeof car.features === 'string') {
          car.features = car.features.split(/[,|]/).map(f => f.trim()).filter(Boolean);
        } else {
          car.features = [];
        }
        // Ensure numbers
        car.year  = parseInt(car.year)  || 0;
        car.km    = parseInt(car.km)    || 0;
        car.hp    = parseInt(car.hp)    || 0;
        car.price = parseInt(car.price) || 0;
        return car;
      })
      .filter(car => car.make && car.model && car.price > 0); // skip empty rows

    renderCars(ALL_CARS);
  } catch (err) {
    console.error('Google Sheets load error:', err);
    showError();
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  document.getElementById('carsLoading').classList.toggle('hidden', !show);
  if (show) {
    document.getElementById('carsGrid').classList.add('hidden');
    document.getElementById('resultsInfo').classList.add('hidden');
    document.getElementById('noResults').classList.add('hidden');
  }
}

function showError() {
  document.getElementById('carsLoading').classList.add('hidden');
  const noRes = document.getElementById('noResults');
  noRes.classList.remove('hidden');
  noRes.querySelector('p').textContent = '❌ Σφάλμα φόρτωσης. Ανανεώστε τη σελίδα.';
}

/* ════════════════════════════════════════════════════════════
   RENDER CARS
   ════════════════════════════════════════════════════════════ */
function renderCars(cars) {
  const grid    = document.getElementById('carsGrid');
  const noRes   = document.getElementById('noResults');
  const resInfo = document.getElementById('resultsInfo');
  const countEl = document.getElementById('resultsCount');

  resInfo.classList.remove('hidden');
  countEl.textContent = cars.length;

  if (!cars.length) {
    grid.classList.add('hidden');
    noRes.classList.remove('hidden');
    noRes.querySelector('p').textContent = 'Δεν βρέθηκαν αυτοκίνητα με αυτά τα κριτήρια.';
    return;
  }

  noRes.classList.add('hidden');
  grid.classList.remove('hidden');
  grid.innerHTML = '';

  cars.forEach((car, idx) => {
    const card = document.createElement('div');
    card.className = 'car-card';
    card.style.animationDelay = `${idx * 0.06}s`;
    const badge = (car.badge || '').toString().toLowerCase().trim();

    card.innerHTML = `
      <div class="car-img-placeholder">
        <svg viewBox="0 0 64 32" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="4" y="12" width="56" height="14" rx="3"/>
          <path d="M16 12 L22 4 L42 4 L48 12"/>
          <circle cx="18" cy="26" r="5"/><circle cx="46" cy="26" r="5"/>
          <circle cx="18" cy="26" r="2.5" fill="currentColor"/>
          <circle cx="46" cy="26" r="2.5" fill="currentColor"/>
        </svg>
        ${badge === 'hot' ? '<span class="car-badge badge-hot">HOT</span>' :
          badge === 'new' ? '<span class="car-badge badge-new">ΝΕΟ</span>' : ''}
      </div>
      <div class="car-info">
        <p class="car-make">${car.make}</p>
        <p class="car-name">${car.model}</p>
        <div class="car-specs">
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${car.year}
          </span>
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            ${Number(car.km).toLocaleString('el-GR')} km
          </span>
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22h18M3 6h18M6 6V3M18 6V3M6 22v-3M18 22v-3M3 14h18"/></svg>
            ${car.fuel}
          </span>
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            ${car.hp} hp
          </span>
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4l3 3"/></svg>
            ${car.gearbox}
          </span>
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            ${car.condition}
          </span>
        </div>
        <div class="car-price-row">
          <p class="car-price">${Number(car.price).toLocaleString('el-GR')} €</p>
          <button class="car-details-btn" data-idx="${idx}">Λεπτομέρειες</button>
        </div>
      </div>
    `;

    card.querySelector('.car-details-btn').addEventListener('click', e => { e.stopPropagation(); openModal(car); });
    card.addEventListener('click', () => openModal(car));
    grid.appendChild(card);
  });
}

/* ════════════════════════════════════════════════════════════
   FILTERS (client-side on loaded data)
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('resetFilters2').addEventListener('click', resetFilters);
  document.getElementById('filterModel').addEventListener('input', debounce(applyFilters, 350));
});

function applyFilters() {
  const make    = document.getElementById('filterMake').value;
  const model   = document.getElementById('filterModel').value.toLowerCase().trim();
  const year    = parseInt(document.getElementById('filterYear').value) || 0;
  const fuel    = document.getElementById('filterFuel').value;
  const gearbox = document.getElementById('filterGearbox').value;
  const maxKm   = parseInt(document.getElementById('filterKm').value) || Infinity;

  const filtered = ALL_CARS.filter(car => {
    if (make    && car.make    !== make)    return false;
    if (model   && !car.model.toLowerCase().includes(model)) return false;
    if (year    && car.year < year)         return false;
    if (fuel    && car.fuel    !== fuel)    return false;
    if (gearbox && car.gearbox !== gearbox) return false;
    if (car.km  > maxKm)                   return false;
    return true;
  });

  renderCars(filtered);
}

function resetFilters() {
  ['filterMake','filterYear','filterFuel','filterGearbox','filterKm'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('filterModel').value = '';
  renderCars(ALL_CARS);
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

/* ════════════════════════════════════════════════════════════
   MODAL
   ════════════════════════════════════════════════════════════ */
function openModal(car) {
  const modal   = document.getElementById('carModal');
  const content = document.getElementById('modalContent');
  const features = Array.isArray(car.features) ? car.features : [];

  content.innerHTML = `
    <div style="margin-bottom:1.5rem;">
      <p style="font-family:'Orbitron',sans-serif;font-size:.65rem;letter-spacing:.2em;color:#B1121A;text-transform:uppercase;margin-bottom:.4rem;">${car.make}</p>
      <h2 style="font-size:1.4rem;color:#fff;margin-bottom:.5rem;font-family:'Orbitron',sans-serif;">${car.model}</h2>
      <p style="font-family:'Orbitron',sans-serif;font-size:1.9rem;font-weight:900;background:linear-gradient(135deg,#fff,#c8c8c8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${Number(car.price).toLocaleString('el-GR')} €</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.5rem;">
      ${[
        ['Χρονολογία', car.year],
        ['Χιλιόμετρα', Number(car.km).toLocaleString('el-GR') + ' km'],
        ['Καύσιμο',    car.fuel],
        ['Κιβώτιο',    car.gearbox],
        ['Ιπποδύναμη', car.hp + ' hp'],
        ['Κατάσταση',  car.condition],
      ].map(([l,v]) => `
        <div style="background:#1C1C1C;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:.75rem 1rem;">
          <p style="font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.15em;color:#666;text-transform:uppercase;margin-bottom:.2rem;">${l}</p>
          <p style="font-weight:600;color:#fff;font-size:.9rem;">${v}</p>
        </div>
      `).join('')}
    </div>
    ${features.length ? `
    <div style="margin-bottom:1.5rem;">
      <p style="font-family:'Orbitron',sans-serif;font-size:.65rem;letter-spacing:.2em;color:#666;text-transform:uppercase;margin-bottom:.75rem;">Εξοπλισμός</p>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:.4rem;">
        ${features.map(f => `<li style="display:flex;align-items:center;gap:.5rem;font-size:.875rem;color:#D9D9D9;"><span style="color:#B1121A;font-weight:700;">→</span>${f}</li>`).join('')}
      </ul>
    </div>` : ''}
    <div style="display:flex;gap:1rem;flex-wrap:wrap;">
      <a href="tel:6988091918" class="btn btn-primary" style="flex:1;min-width:140px;justify-content:center;">📞 6988091918</a>
      <a href="#contact" class="btn btn-outline" style="flex:1;min-width:140px;justify-content:center;" onclick="document.getElementById('carModal').classList.add('hidden')">Αποστολή Μηνύματος</a>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function initModal() {
  const modal    = document.getElementById('carModal');
  const closeBtn = document.getElementById('modalClose');
  const close    = () => { modal.classList.add('hidden'); document.body.style.overflow = ''; };
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ════════════════════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

/* ════════════════════════════════════════════════════════════
   HERO COUNTERS
   ════════════════════════════════════════════════════════════ */
function initCounters() {
  let started = false;
  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || started) return;
    started = true;
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      let cur = 0;
      const step = target / (1800 / 16);
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = Math.round(cur);
        if (cur >= target) clearInterval(t);
      }, 16);
    });
  }, { threshold: 0.5 });
  const hero = document.getElementById('hero');
  if (hero) obs.observe(hero);
}

/* ════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ════════════════════════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════════════════════
   AI VALUATION
   ════════════════════════════════════════════════════════════ */
function initValuation() {
  const yearSel = document.getElementById('valYear');
  const y = new Date().getFullYear();
  for (let i = y; i >= 2000; i--) {
    const o = document.createElement('option');
    o.value = i; o.textContent = i;
    yearSel.appendChild(o);
  }
  document.getElementById('estimateBtn').addEventListener('click', runEstimation);
}

function runEstimation() {
  const make      = document.getElementById('valMake').value;
  const model     = document.getElementById('valModel').value.trim();
  const year      = parseInt(document.getElementById('valYear').value);
  const km        = parseInt(document.getElementById('valKm').value);
  const fuel      = document.getElementById('valFuel').value;
  const condition = document.getElementById('valCondition').value;

  if (!make || !model || !year || isNaN(km) || !fuel || !condition) {
    alert('⚠️ Συμπληρώστε όλα τα υποχρεωτικά πεδία.');
    return;
  }

  document.getElementById('valResult').classList.add('hidden');
  document.getElementById('valLoading').classList.remove('hidden');

  ['step1','step2','step3','step4'].forEach((id, i) => {
    document.getElementById(id).classList.remove('active');
    setTimeout(() => document.getElementById(id).classList.add('active'), i * 500 + 100);
  });

  setTimeout(() => {
    const result = calcValue({ make, year, km, fuel, condition });
    displayResult(result, { make, model, year, km, fuel, condition });
  }, 2400);
}

function calcValue({ make, year, km, fuel, condition }) {
  const base = BASE_PRICES[make] || 24000;
  const age  = new Date().getFullYear() - year;
  let price  = base;
  if (age > 0) { price *= 0.88; for (let i = 1; i < age; i++) price *= 0.92; }
  const expKm    = age * 20000;
  const excessKm = Math.max(0, km - expKm);
  const kmFactor = Math.max(0.5, 1 - excessKm * 0.004 / 10000);
  const fuelMult = FUEL_FACTORS[fuel] || 1;
  const condMult = CONDITION_FACTORS[condition] || 0.85;
  price = Math.round(price * kmFactor * fuelMult * condMult / 100) * 100;
  let conf = 80;
  if (BASE_PRICES[make]) conf += 8;
  if (age <= 5) conf += 5;
  if (km < 100000) conf += 3;
  return { price, confidence: Math.min(96, conf), kmFactor, fuelMult, condMult, age };
}

function displayResult(result, params) {
  document.getElementById('valLoading').classList.add('hidden');
  document.getElementById('valResult').classList.remove('hidden');
  document.getElementById('resultVehicleName').textContent = `${params.make} ${params.model} (${params.year})`;
  document.getElementById('resultPrice').textContent = result.price.toLocaleString('el-GR') + ' €';
  const low  = Math.round(result.price * 0.92 / 100) * 100;
  const high = Math.round(result.price * 1.08 / 100) * 100;
  document.getElementById('resultRange').textContent = `Εύρος: ${low.toLocaleString('el-GR')} € – ${high.toLocaleString('el-GR')} €`;
  document.getElementById('confidenceVal').textContent = result.confidence + '%';
  setTimeout(() => { document.getElementById('confidenceBar').style.width = result.confidence + '%'; }, 100);
  const kmImpact = Math.round((1 - result.kmFactor) * 100);
  document.getElementById('resultFactors').innerHTML = `
    <div class="factor-item"><p class="factor-label">Ηλικία</p><p class="factor-value ${result.age > 8 ? 'negative' : ''}">${result.age} έτη</p></div>
    <div class="factor-item"><p class="factor-label">Επίδραση Km</p><p class="factor-value ${kmImpact > 10 ? 'negative' : ''}">${kmImpact > 0 ? '-' + kmImpact + '%' : 'Κανονική'}</p></div>
    <div class="factor-item"><p class="factor-label">Καύσιμο</p><p class="factor-value ${result.fuelMult > 1 ? 'positive' : ''}">${FUEL_GR[params.fuel]}</p></div>
    <div class="factor-item"><p class="factor-label">Κατάσταση</p><p class="factor-value ${result.condMult < 0.8 ? 'negative' : 'positive'}">${CONDITION_GR[params.condition]}</p></div>
  `;
}

/* ════════════════════════════════════════════════════════════
   CONTACT FORM
   ════════════════════════════════════════════════════════════ */
function initContact() {
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const msg   = document.getElementById('cMsg').value.trim();
    if (!name || !email || !msg) return;
    const btn = e.target.querySelector('[type=submit]');
    btn.textContent = 'Αποστολή...';
    btn.disabled = true;
    setTimeout(() => {
      e.target.reset();
      document.getElementById('formSuccess').classList.remove('hidden');
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Αποστολή Μηνύματος`;
      btn.disabled = false;
    }, 1500);
  });
}

/* ════════════════════════════════════════════════════════════
   CURSOR GLOW
   ════════════════════════════════════════════════════════════ */
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.createElement('div');
  glow.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(177,18,26,0.04) 0%,transparent 70%);transform:translate(-50%,-50%);transition:left .15s ease,top .15s ease;will-change:left,top;';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
}

console.log('%cSTAMCAR', 'color:#B1121A;font-family:Orbitron,sans-serif;font-size:20px;font-weight:900;letter-spacing:4px;');
