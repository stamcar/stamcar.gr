/* ═══════════════════════════════════════════════════════════
   STAMCAR — Premium Automotive JavaScript
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── CAR DATA ────────────────────────────────────────────── */
const CAR_DATA = [
  {
    "id": 4,
    "make": "Opel",
    "model": "Corsa",
    "year": 2013,
    "km": 270000,
    "fuel": "Diesel",
    "gearbox": "Χειροκίνητο",
    "hp": 95,
    "condition": "Άριστη",
    "price": 5500,
    "badge": "hot",
    "features": [
      "IQ.LIGHT",
      "Dynaudio ηχοσύστημα",
      "DCC ανάρτηση",
      "Digital cockpit Pro"
    ]
  }
];

/* ── BASE PRICES for AI Valuation ────────────────────────── */
const BASE_PRICES = {
  'BMW':          42000,
  'Mercedes-Benz':46000,
  'Audi':         40000,
  'Volkswagen':   28000,
  'Toyota':       26000,
  'Ford':         24000,
  'Hyundai':      22000,
  'Kia':          21000,
  'Nissan':       20000,
  'Opel':         18000,
};
const FUEL_FACTORS = { petrol:1.0, diesel:1.05, hybrid:1.12, electric:1.2, lpg:0.85 };
const CONDITION_FACTORS = { excellent:1.0, good:0.88, fair:0.74, poor:0.58 };
const CONDITION_LABELS_GR = { excellent:'Άριστη', good:'Καλή', fair:'Μέτρια', poor:'Κακή' };
const FUEL_LABELS_GR = { petrol:'Βενζίνη', diesel:'Diesel', hybrid:'Υβριδικό', electric:'Ηλεκτρικό', lpg:'LPG/CNG' };

/* ════════════════════════════════════════════════════════════
   NAVBAR — scroll & hamburger
   ════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
})();

/* ════════════════════════════════════════════════════════════
   HERO COUNTER — animate numbers on load
   ════════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num');
  let started = false;

  function startCounters() {
    if (started) return;
    started = true;
    counters.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      let current = 0;
      const duration = 1800;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.round(current);
        if (current >= target) clearInterval(timer);
      }, 16);
    });
  }

  // Start when hero is visible
  const heroObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) startCounters();
  }, { threshold: 0.5 });

  const hero = document.getElementById('hero');
  if (hero) heroObs.observe(hero);
})();

/* ════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ════════════════════════════════════════════════════════════ */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════════════════════════
   CAR SEARCH & FILTER
   ════════════════════════════════════════════════════════════ */
(function initSearch() {
  let currentData = [...CAR_DATA];

  function renderCars(data) {
    const grid = document.getElementById('carsGrid');
    const noResults = document.getElementById('noResults');
    const countEl = document.getElementById('resultsCount');

    countEl.textContent = data.length;
    grid.innerHTML = '';

    if (data.length === 0) {
      noResults.classList.remove('hidden');
      return;
    }
    noResults.classList.add('hidden');

    data.forEach((car, idx) => {
      const card = document.createElement('div');
      card.className = 'car-card';
      card.style.animationDelay = `${idx * 0.06}s`;
      card.innerHTML = `
        <div class="car-img-placeholder">
          <svg viewBox="0 0 64 32" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="4" y="12" width="56" height="14" rx="3"/>
            <path d="M16 12 L22 4 L42 4 L48 12"/>
            <circle cx="18" cy="26" r="5"/><circle cx="46" cy="26" r="5"/>
            <circle cx="18" cy="26" r="2.5" fill="currentColor"/>
            <circle cx="46" cy="26" r="2.5" fill="currentColor"/>
          </svg>
          ${car.badge ? `<span class="car-badge badge-${car.badge}">${car.badge === 'new' ? 'ΝΕΟ' : 'HOT'}</span>` : ''}
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
              ${car.km.toLocaleString('el-GR')} km
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
            <p class="car-price">${car.price.toLocaleString('el-GR')} €</p>
            <button class="car-details-btn" data-id="${car.id}">Λεπτομέρειες</button>
          </div>
        </div>
      `;
      card.querySelector('.car-details-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(car);
      });
      card.addEventListener('click', () => openModal(car));
      grid.appendChild(card);
    });
  }

  function applyFilters() {
    const make     = document.getElementById('filterMake').value;
    const model    = document.getElementById('filterModel').value.toLowerCase().trim();
    const yearFrom = parseInt(document.getElementById('filterYearFrom').value) || 0;
    const fuel     = document.getElementById('filterFuel').value;
    const gearbox  = document.getElementById('filterGearbox').value;
    const maxKm    = parseInt(document.getElementById('filterKm').value) || Infinity;

    currentData = CAR_DATA.filter(car => {
      if (make && car.make !== make) return false;
      if (model && !car.model.toLowerCase().includes(model)) return false;
      if (yearFrom && car.year < yearFrom) return false;
      if (fuel && car.fuel !== fuel) return false;
      if (gearbox && car.gearbox !== gearbox) return false;
      if (car.km > maxKm) return false;
      return true;
    });

    renderCars(currentData);
  }

  function resetFilters() {
    ['filterMake','filterYearFrom','filterFuel','filterGearbox','filterKm'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('filterModel').value = '';
    currentData = [...CAR_DATA];
    renderCars(currentData);
  }

  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('resetFilters2').addEventListener('click', resetFilters);

  // Live search on model input
  document.getElementById('filterModel').addEventListener('input', applyFilters);

  // Initial render
  renderCars(CAR_DATA);
})();

/* ════════════════════════════════════════════════════════════
   CAR MODAL
   ════════════════════════════════════════════════════════════ */
function openModal(car) {
  const modal = document.getElementById('carModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div style="margin-bottom:1.5rem;">
      <p style="font-family:var(--font-display);font-size:.65rem;letter-spacing:.2em;color:var(--red);text-transform:uppercase;margin-bottom:.4rem;">${car.make}</p>
      <h2 style="font-size:1.6rem;color:#fff;margin-bottom:.5rem;">${car.model}</h2>
      <p style="font-family:var(--font-display);font-size:2rem;font-weight:900;background:linear-gradient(135deg,#fff,#c8c8c8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${car.price.toLocaleString('el-GR')} €</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.5rem;">
      ${[
        ['Χρονολογία', car.year],
        ['Χιλιόμετρα', car.km.toLocaleString('el-GR') + ' km'],
        ['Καύσιμο', car.fuel],
        ['Κιβώτιο', car.gearbox],
        ['Ιπποδύναμη', car.hp + ' hp'],
        ['Κατάσταση', car.condition],
      ].map(([label, val]) => `
        <div style="background:var(--bg-card2);border:1px solid var(--border-sub);border-radius:8px;padding:.75rem 1rem;">
          <p style="font-family:var(--font-display);font-size:.6rem;letter-spacing:.15em;color:var(--text-dim);text-transform:uppercase;margin-bottom:.2rem;">${label}</p>
          <p style="font-weight:600;color:#fff;">${val}</p>
        </div>
      `).join('')}
    </div>
    <div style="margin-bottom:1.5rem;">
      <p style="font-family:var(--font-display);font-size:.65rem;letter-spacing:.2em;color:var(--text-dim);text-transform:uppercase;margin-bottom:.75rem;">Εξοπλισμός</p>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:.4rem;">
        ${car.features.map(f => `
          <li style="display:flex;align-items:center;gap:.5rem;font-size:.875rem;color:var(--text);">
            <span style="color:var(--red);font-weight:700;">→</span> ${f}
          </li>
        `).join('')}
      </ul>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;">
      <a href="tel:6988091918" class="btn btn-primary" style="flex:1;justify-content:center;">
        📞 6988091918
      </a>
      <a href="#contact" class="btn btn-outline" style="flex:1;justify-content:center;" onclick="document.getElementById('carModal').classList.add('hidden')">
        Αποστολή Μηνύματος
      </a>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

(function initModal() {
  const modal = document.getElementById('carModal');
  const closeBtn = document.getElementById('modalClose');

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();

/* ════════════════════════════════════════════════════════════
   AI VALUATION ENGINE
   ════════════════════════════════════════════════════════════ */
(function initValuation() {
  // Populate year select
  const yearSelect = document.getElementById('valYear');
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 2000; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  document.getElementById('estimateBtn').addEventListener('click', runEstimation);

  function runEstimation() {
    const make      = document.getElementById('valMake').value;
    const model     = document.getElementById('valModel').value.trim();
    const year      = parseInt(document.getElementById('valYear').value);
    const km        = parseInt(document.getElementById('valKm').value);
    const fuel      = document.getElementById('valFuel').value;
    const condition = document.getElementById('valCondition').value;

    // Validation
    if (!make || !model || !year || isNaN(km) || !fuel || !condition) {
      alert('⚠️ Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.');
      return;
    }
    if (km < 0 || km > 999999) {
      alert('⚠️ Παρακαλώ εισάγετε έγκυρα χιλιόμετρα (0 - 999.999).');
      return;
    }

    // Show loading, hide form and result
    document.getElementById('valResult').classList.add('hidden');
    document.getElementById('valLoading').classList.remove('hidden');

    // Animate loading steps
    const steps = ['step1','step2','step3','step4'];
    steps.forEach((id, i) => {
      document.getElementById(id).classList.remove('active');
      setTimeout(() => {
        document.getElementById(id).classList.add('active');
      }, i * 500 + 100);
    });

    // Simulate AI processing
    setTimeout(() => {
      const result = calculateValue({ make, model, year, km, fuel, condition });
      displayResult(result, { make, model, year, km, fuel, condition });
    }, 2400);
  }

  function calculateValue({ make, model, year, km, fuel, condition }) {
    // Base price from brand
    const base = BASE_PRICES[make] || 22000;

    // Age depreciation: 12% first year, 8% subsequent years
    const age = new Date().getFullYear() - year;
    let depreciated = base;
    if (age > 0) {
      depreciated = base * 0.88; // first year
      for (let i = 1; i < age; i++) {
        depreciated *= 0.92; // each additional year
      }
    }

    // Km penalty
    const avgKmPerYear = 20000;
    const expectedKm = age * avgKmPerYear;
    const excessKm = Math.max(0, km - expectedKm);
    const kmPenaltyRate = 0.04 / 10000; // 4% per 10k excess km
    const kmFactor = 1 - (excessKm * kmPenaltyRate);

    // Fuel factor
    const fuelMult = FUEL_FACTORS[fuel] || 1;

    // Condition factor
    const condMult = CONDITION_FACTORS[condition] || 0.85;

    // Final calculation
    let price = depreciated * Math.max(0.5, kmFactor) * fuelMult * condMult;

    // Round to nearest 100
    price = Math.round(price / 100) * 100;

    // Confidence based on how much data we have
    let confidence = 82;
    if (Object.keys(BASE_PRICES).includes(make)) confidence += 8;
    if (age <= 5) confidence += 5;
    if (km < 100000) confidence += 3;
    confidence = Math.min(96, confidence);

    return { price, confidence, kmFactor, condMult, fuelMult, age, excessKm };
  }

  function displayResult(result, params) {
    document.getElementById('valLoading').classList.add('hidden');
    const resultEl = document.getElementById('valResult');
    resultEl.classList.remove('hidden');

    // Vehicle name
    document.getElementById('resultVehicleName').textContent =
      `${params.make} ${params.model} (${params.year})`;

    // Price
    const { price, confidence } = result;
    document.getElementById('resultPrice').textContent =
      price.toLocaleString('el-GR') + ' €';

    const low  = Math.round((price * 0.92) / 100) * 100;
    const high = Math.round((price * 1.08) / 100) * 100;
    document.getElementById('resultRange').textContent =
      `Εύρος: ${low.toLocaleString('el-GR')} € – ${high.toLocaleString('el-GR')} €`;

    // Confidence bar
    document.getElementById('confidenceVal').textContent = confidence + '%';
    setTimeout(() => {
      document.getElementById('confidenceBar').style.width = confidence + '%';
    }, 100);

    // Factors
    const kmImpact  = Math.round((1 - Math.max(0.5, result.kmFactor)) * 100);
    const condLabel = CONDITION_LABELS_GR[params.condition];
    const fuelLabel = FUEL_LABELS_GR[params.fuel];

    document.getElementById('resultFactors').innerHTML = `
      <div class="factor-item">
        <p class="factor-label">Ηλικία Οχήματος</p>
        <p class="factor-value ${result.age > 8 ? 'negative' : ''}">${result.age} έτη</p>
      </div>
      <div class="factor-item">
        <p class="factor-label">Επίδραση Km</p>
        <p class="factor-value ${kmImpact > 10 ? 'negative' : ''}">${kmImpact > 0 ? '-' + kmImpact + '%' : 'Κανονική χρήση'}</p>
      </div>
      <div class="factor-item">
        <p class="factor-label">Τύπος Καυσίμου</p>
        <p class="factor-value ${result.fuelMult >= 1.1 ? 'positive' : ''}">${fuelLabel} ${result.fuelMult > 1 ? '(+' + Math.round((result.fuelMult-1)*100) + '%)' : result.fuelMult < 1 ? '(' + Math.round((result.fuelMult-1)*100) + '%)' : ''}</p>
      </div>
      <div class="factor-item">
        <p class="factor-label">Κατάσταση</p>
        <p class="factor-value ${result.condMult < 0.8 ? 'negative' : result.condMult === 1 ? 'positive' : ''}">${condLabel}</p>
      </div>
    `;
  }
})();

/* ════════════════════════════════════════════════════════════
   CONTACT FORM
   ════════════════════════════════════════════════════════════ */
(function initContact() {
  const form = document.getElementById('contactForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const msg   = document.getElementById('cMsg').value.trim();

    if (!name || !email || !msg) return;

    const btn = form.querySelector('[type=submit]');
    btn.textContent = 'Αποστολή...';
    btn.disabled = true;

    // Simulate form submission
    setTimeout(() => {
      form.reset();
      btn.textContent = '✓ Εστάλη';
      document.getElementById('formSuccess').classList.remove('hidden');
      setTimeout(() => {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Αποστολή Μηνύματος`;
        btn.disabled = false;
      }, 3000);
    }, 1500);
  });
})();

/* ════════════════════════════════════════════════════════════
   SMOOTH ACTIVE NAV LINKS
   ════════════════════════════════════════════════════════════ */
(function initActiveSections() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active-link',
            link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

/* ════════════════════════════════════════════════════════════
   CURSOR GLOW (desktop)
   ════════════════════════════════════════════════════════════ */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip mobile

  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9999;
    width:400px;height:400px;border-radius:50%;
    background:radial-gradient(circle, rgba(177,18,26,0.04) 0%, transparent 70%);
    transform:translate(-50%,-50%);
    transition:left .15s ease, top .15s ease;
    will-change:left,top;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();

console.log('%cSTAMCAR — Premium Automotive', 'color:#B1121A;font-family:Orbitron,sans-serif;font-size:18px;font-weight:900;letter-spacing:4px;');
console.log('%cΑγορά – Εύρεση – Πώληση Αυτοκινήτων', 'color:#888;font-family:Montserrat,sans-serif;font-size:12px;');


