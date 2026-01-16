/* =========================================================
   STAMCAR — Vanilla JS (GitHub Pages friendly)
   - Dummy car data
   - Live filtering
   - AI-like rule-based estimator (no backend)
   - Scroll reveal (IntersectionObserver)
   - Mobile nav
   - Contact form: mailto compose
   ========================================================= */

"use strict";

/* -------------------------
   Dummy car data (edit freely)
   ------------------------- */
const CARS = [
  { id: 1, brand: "BMW", model: "320i", year: 2019, km: 78000, fuel: "Βενζίνη", trans: "Αυτόματο", hp: 184, condition: "Πολύ καλή", price: 26900, tag: "Sport Line" },
  { id: 2, brand: "Mercedes-Benz", model: "A200", year: 2020, km: 52000, fuel: "Βενζίνη", trans: "Αυτόματο", hp: 163, condition: "Άριστη", price: 29900, tag: "AMG Pack" },
  { id: 3, brand: "Audi", model: "A3", year: 2018, km: 99000, fuel: "Diesel", trans: "Αυτόματο", hp: 150, condition: "Καλή", price: 21900, tag: "S line" },
  { id: 4, brand: "VW", model: "Golf", year: 2021, km: 41000, fuel: "Υβριδικό", trans: "Αυτόματο", hp: 204, condition: "Άριστη", price: 27900, tag: "eHybrid" },
  { id: 5, brand: "Toyota", model: "Corolla", year: 2022, km: 26000, fuel: "Υβριδικό", trans: "Αυτόματο", hp: 184, condition: "Άριστη", price: 26800, tag: "Hybrid" },
  { id: 6, brand: "Tesla", model: "Model 3", year: 2021, km: 68000, fuel: "Ηλεκτρικό", trans: "Αυτόματο", hp: 283, condition: "Πολύ καλή", price: 32900, tag: "Long Range" },
  { id: 7, brand: "BMW", model: "X1", year: 2017, km: 118000, fuel: "Diesel", trans: "Αυτόματο", hp: 190, condition: "Καλή", price: 22900, tag: "xDrive" },
  { id: 8, brand: "Audi", model: "Q3", year: 2019, km: 86000, fuel: "Βενζίνη", trans: "Αυτόματο", hp: 150, condition: "Πολύ καλή", price: 27900, tag: "Quattro look" },
  { id: 9, brand: "Mercedes-Benz", model: "C200", year: 2016, km: 132000, fuel: "Diesel", trans: "Αυτόματο", hp: 136, condition: "Μέτρια", price: 17900, tag: "Executive" },
  { id: 10, brand: "Peugeot", model: "3008", year: 2020, km: 70000, fuel: "Diesel", trans: "Αυτόματο", hp: 130, condition: "Πολύ καλή", price: 24500, tag: "GT Line" },
  { id: 11, brand: "VW", model: "Tiguan", year: 2018, km: 104000, fuel: "Diesel", trans: "Χειροκίνητο", hp: 150, condition: "Καλή", price: 21900, tag: "Comfort" },
  { id: 12, brand: "Toyota", model: "Yaris", year: 2019, km: 74000, fuel: "Υβριδικό", trans: "Αυτόματο", hp: 116, condition: "Πολύ καλή", price: 15900, tag: "City" }
];

/* -------------------------
   Estimator base prices (demo)
   - Key: "Brand|Model"
   - Value: base price reference in EUR (good condition)
   ------------------------- */
const BASE_PRICE = {
  "BMW|320i": 32000,
  "BMW|X1": 30000,
  "Mercedes-Benz|A200": 34000,
  "Mercedes-Benz|C200": 33000,
  "Audi|A3": 30000,
  "Audi|Q3": 34000,
  "VW|Golf": 29000,
  "VW|Tiguan": 33000,
  "Toyota|Corolla": 28000,
  "Toyota|Yaris": 19000,
  "Tesla|Model 3": 42000,
  "Peugeot|3008": 32000
};

const $ = (sel) => document.querySelector(sel);

/* -------------------------
   Helpers
   ------------------------- */
function formatEUR(n){
  const rounded = Math.round(n);
  return rounded.toLocaleString("el-GR") + " €";
}
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function unique(arr){ return [...new Set(arr)].sort((a,b)=>a.localeCompare(b, "el")); }

/* -------------------------
   Scroll reveal
   ------------------------- */
function initReveal(){
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

/* -------------------------
   Mobile nav
   ------------------------- */
function initNav(){
  const btn = $("#navToggle");
  const links = $("#navLinks");
  if(!btn || !links) return;

  btn.addEventListener("click", ()=>{
    const isOpen = links.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  // close on link click (mobile)
  links.addEventListener("click", (e)=>{
    const a = e.target.closest("a");
    if(!a) return;
    links.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  });
}

/* -------------------------
   Search: populate filters + live filtering
   ------------------------- */
function initSearch(){
  const fBrand = $("#fBrand");
  const fModel = $("#fModel");
  const fYear = $("#fYear");
  const fKm = $("#fKm");
  const fFuel = $("#fFuel");
  const fTrans = $("#fTrans");
  const fHp = $("#fHp");
  const fCond = $("#fCond");

  const clearBtn = $("#clearFilters");
  const grid = $("#resultsGrid");
  const empty = $("#resultsEmpty");
  const count = $("#resultCount");

  if(!grid) return;

  // Brands
  const brands = unique(CARS.map(c => c.brand));
  for(const b of brands){
    const o = document.createElement("option");
    o.value = b; o.textContent = b;
    fBrand.appendChild(o);
  }

  function refreshModels(){
    const selectedBrand = fBrand.value;
    fModel.innerHTML = `<option value="">Όλα</option>`;

    if(!selectedBrand){
      fModel.disabled = true;
      return;
    }
    const models = unique(CARS.filter(c=>c.brand===selectedBrand).map(c=>c.model));
    for(const m of models){
      const o = document.createElement("option");
      o.value = m; o.textContent = m;
      fModel.appendChild(o);
    }
    fModel.disabled = false;
  }

  function getFilters(){
    return {
      brand: fBrand.value.trim(),
      model: fModel.value.trim(),
      yearMin: Number(fYear.value) || null,
      kmMax: Number(fKm.value) || null,
      fuel: fFuel.value.trim(),
      trans: fTrans.value.trim(),
      hpMin: Number(fHp.value) || null,
      cond: fCond.value.trim()
    };
  }

  function applyFilters(){
    const f = getFilters();

    let results = CARS.filter(c=>{
      if(f.brand && c.brand !== f.brand) return false;
      if(f.model && c.model !== f.model) return false;
      if(f.yearMin && c.year < f.yearMin) return false;
      if(f.kmMax && c.km > f.kmMax) return false;
      if(f.fuel && c.fuel !== f.fuel) return false;
      if(f.trans && c.trans !== f.trans) return false;
      if(f.hpMin && c.hp < f.hpMin) return false;
      if(f.cond && c.condition !== f.cond) return false;
      return true;
    });

    // Premium-ish ordering: newest first, then lowest km
    results.sort((a,b)=> (b.year - a.year) || (a.km - b.km));

    renderResults(results);
  }

  function renderResults(results){
    grid.innerHTML = "";
    count.textContent = `${results.length} αποτελέσματα`;
    empty.hidden = results.length !== 0;

    for(const c of results){
      const el = document.createElement("article");
      el.className = "car";
      el.innerHTML = `
        <div class="car__top">
          <div>
            <h4 class="car__title">${escapeHTML(c.brand)} ${escapeHTML(c.model)}</h4>
            <p class="car__sub">${c.year} • ${c.km.toLocaleString("el-GR")} km • ${escapeHTML(c.fuel)} • ${escapeHTML(c.trans)}</p>
          </div>
          <span class="car__badge">${formatEUR(c.price)}</span>
        </div>

        <div class="car__specs">
          <div class="spec"><span class="spec__k">Ιπποδύναμη</span><span class="spec__v">${c.hp} hp</span></div>
          <div class="spec"><span class="spec__k">Κατάσταση</span><span class="spec__v">${escapeHTML(c.condition)}</span></div>
          <div class="spec"><span class="spec__k">Tag</span><span class="spec__v">${escapeHTML(c.tag)}</span></div>
          <div class="spec"><span class="spec__k">ID</span><span class="spec__v">#${c.id}</span></div>
        </div>
      `;
      grid.appendChild(el);
    }
  }

  function escapeHTML(str){
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // Events
  fBrand.addEventListener("change", ()=>{
    refreshModels();
    applyFilters();
  });

  [fModel, fYear, fKm, fFuel, fTrans, fHp, fCond].forEach(el=>{
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });

  clearBtn.addEventListener("click", ()=>{
    $("#searchForm").reset();
    fModel.innerHTML = `<option value="">Όλα</option>`;
    fModel.disabled = true;
    applyFilters();
  });

  refreshModels();
  applyFilters();
}

/* -------------------------
   Estimator (AI-like)
   ------------------------- */
function initEstimator(){
  const eBrand = $("#eBrand");
  const eModel = $("#eModel");
  const eYear = $("#eYear");
  const eKm = $("#eKm");
  const eFuel = $("#eFuel");
  const eCond = $("#eCond");

  const form = $("#estimateForm");
  const aiBox = $("#aiBox");
  const aiBar = $("#aiBar");
  const aiLog = $("#aiLog");
  const aiStatus = $("#aiStatus");

  const out = $("#estimateResult");
  const rValue = $("#rValue");
  const rRange = $("#rRange");
  const rConf = $("#rConf");

  if(!form || !eBrand || !eModel) return;

  // populate from dataset
  const brands = unique(CARS.map(c=>c.brand));
  for(const b of brands){
    const o = document.createElement("option");
    o.value = b; o.textContent = b;
    eBrand.appendChild(o);
  }

  function refreshEstimatorModels(){
    const b = eBrand.value;
    eModel.innerHTML = `<option value="">Επίλεξε</option>`;
    if(!b){ eModel.disabled = true; return; }
    const models = unique(CARS.filter(c=>c.brand===b).map(c=>c.model));
    for(const m of models){
      const o = document.createElement("option");
      o.value = m; o.textContent = m;
      eModel.appendChild(o);
    }
    eModel.disabled = false;
  }

  eBrand.addEventListener("change", refreshEstimatorModels);

  form.addEventListener("submit", async (ev)=>{
    ev.preventDefault();
    out.hidden = true;

    const brand = eBrand.value.trim();
    const model = eModel.value.trim();
    const year = Number(eYear.value);
    const km = Number(eKm.value);
    const fuel = eFuel.value.trim();
    const cond = eCond.value.trim();

    const key = `${brand}|${model}`;
    const base = BASE_PRICE[key] ?? guessBaseFromBrand(brand);

    // AI-like loading UX
    aiBox.hidden = false;
    aiLog.textContent = "";
    aiBar.style.width = "0%";
    aiStatus.textContent = "Initializing…";

    const steps = [
      "Scanning market segments…",
      "Applying depreciation curve…",
      "Normalizing mileage penalty…",
      "Adjusting fuel factor…",
      "Calibrating condition multiplier…",
      "Finalizing estimate…"
    ];

    for(let i=0;i<steps.length;i++){
      aiStatus.textContent = steps[i];
      aiLog.textContent += `> ${steps[i]}\n`;
      aiBar.style.width = `${Math.round(((i+1)/steps.length)*100)}%`;
      // small delay for “AI feel”
      await sleep(340 + i*90);
    }

    const result = estimatePrice({ base, year, km, fuel, cond });
    const conf = confidenceScore({ brand, model, year, km, fuel, cond, hasExactBase: (BASE_PRICE[key] != null) });

    rValue.textContent = formatEUR(result.value);
    rRange.textContent = `${formatEUR(result.min)} – ${formatEUR(result.max)}`;
    rConf.textContent = `${conf}%`;

    // Smooth reveal
    await sleep(180);
    out.hidden = false;
    out.scrollIntoView({ behavior:"smooth", block:"nearest" });

    aiStatus.textContent = "Done.";
  });

  refreshEstimatorModels();
}

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

function guessBaseFromBrand(brand){
  // fallback if brand/model not in base table
  const brandAvg = {
    "BMW": 31000,
    "Mercedes-Benz": 33000,
    "Audi": 31500,
    "VW": 28000,
    "Toyota": 24000,
    "Tesla": 41000,
    "Peugeot": 26000
  };
  return brandAvg[brand] ?? 26000;
}

function estimatePrice({ base, year, km, fuel, cond }){
  const now = new Date().getFullYear();
  const age = clamp(now - year, 0, 35);

  // Depreciation (simple curve): 11% first year, then 7% per year
  const depFirst = 0.11;
  const depNext = 0.07;

  let price = base;
  if(age >= 1){
    price *= (1 - depFirst);
    for(let i=2; i<=age; i++) price *= (1 - depNext);
  }

  // Mileage penalty: baseline 15k/year, penalize above
  const expectedKm = age * 15000;
  const over = Math.max(0, km - expectedKm);
  // every extra 10k => -2.2%
  const kmPenalty = (over / 10000) * 0.022;
  price *= (1 - clamp(kmPenalty, 0, 0.35));

  // Fuel factor
  const fuelFactor = {
    "Βενζίνη": 1.00,
    "Diesel": 0.98,
    "Υβριδικό": 1.05,
    "Ηλεκτρικό": 1.04
  }[fuel] ?? 1.00;
  price *= fuelFactor;

  // Condition factor
  const condFactor = {
    "Άριστη": 1.06,
    "Πολύ καλή": 1.02,
    "Καλή": 0.96,
    "Μέτρια": 0.88
  }[cond] ?? 1.00;
  price *= condFactor;

  // Guard rails
  price = clamp(price, 1200, 250000);

  // Range: +/- based on age & condition uncertainty
  const rangePct = clamp(0.05 + age*0.005 + (cond === "Μέτρια" ? 0.04 : 0), 0.06, 0.18);
  const min = price * (1 - rangePct);
  const max = price * (1 + rangePct);

  return {
    value: price,
    min,
    max
  };
}

function confidenceScore({ year, km, fuel, cond, hasExactBase }){
  let score = 78;
  if(hasExactBase) score += 10;
  if(Number.isFinite(year) && year >= 2005) score += 4;
  if(Number.isFinite(km) && km >= 0) score += 4;
  if(fuel) score += 2;
  if(cond) score += 2;

  // older cars => lower confidence (market variance)
  const age = new Date().getFullYear() - year;
  score -= clamp(age * 0.8, 0, 14);

  return clamp(Math.round(score), 55, 96);
}

/* -------------------------
   Contact form (mailto)
   ------------------------- */
function initContact(){
  const form = $("#contactForm");
  const toast = $("#toast");
  if(!form) return;

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = $("#cName").value.trim();
    const email = $("#cEmail").value.trim();
    const msg = $("#cMsg").value.trim();

    const subject = encodeURIComponent("STAMCAR • Νέο μήνυμα από site");
    const body = encodeURIComponent(
      `Ονοματεπώνυμο: ${name}\nEmail: ${email}\n\nΜήνυμα:\n${msg}\n\n—\nΣτάλθηκε από το website της STAMCAR`
    );

    // show toast
    toast.hidden = false;
    toast.textContent = "Άνοιγμα email εφαρμογής…";
    setTimeout(()=>{ toast.hidden = true; }, 1800);

    window.location.href = `mailto:info@stamcar.gr?subject=${subject}&body=${body}`;
    form.reset();
  });
}

/* -------------------------
   Footer year
   ------------------------- */
function initYear(){
  const y = $("#yearNow");
  if(y) y.textContent = String(new Date().getFullYear());
}

/* -------------------------
   Boot
   ------------------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  initNav();
  initReveal();
  initSearch();
  initEstimator();
  initContact();
  initYear();
});
