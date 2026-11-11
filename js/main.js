/* Customer booking page: language, route stops, cars, reviews and the booking form. */
let lang = "en";
try { const saved = localStorage.getItem("adys-lang"); if (saved === "si" || saved === "en") lang = saved; } catch (e) {}

function t(key, vars) {
  let s = (T[lang] && T[lang][key] !== undefined) ? T[lang][key] : (T.en[key] !== undefined ? T.en[key] : key);
  if (vars && typeof s === "string") for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}
const vName = (v, l) => (v.name[l || lang] || v.name.en);
function durText(a,b,l){
  const diff = minutes(b) - minutes(a); if (!(diff > 0)) return "";
  const h = Math.floor(diff/60), m = diff % 60;
  const prev = lang; if (l) lang = l;
  const out = m ? t("hrsmin",{h,m}) : t("hrs",{h});
  lang = prev; return out;
}

/* ---------- route stops ---------- */
let stops = ["", ""];
function renderStops(){
  const ul = $("stops"); ul.innerHTML = "";
  stops.forEach((val, i) => {
    const first = i === 0, last = i === stops.length - 1;
    const li = document.createElement("li");
    li.className = "stop" + (first || last ? " end" : "");
    const label = first ? t("s_start") : last ? t("s_end") : t("s_stop",{n:i});
    const ph = first ? t("s_ph_start") : last ? t("s_ph_end") : t("s_ph_stop");
    li.innerHTML = `<span class="dot" aria-hidden="true"></span>
      <div><span class="slabel"></span><input type="text"></div>
      <span></span>`;
    li.querySelector(".slabel").textContent = label;
    const inp = li.querySelector("input");
    inp.value = val; inp.placeholder = ph; inp.setAttribute("aria-label", label);
    inp.addEventListener("input", () => { stops[i] = inp.value; });
    if (!first && !last) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "icon-btn"; b.textContent = "×"; b.setAttribute("aria-label", t("remove"));
      b.addEventListener("click", () => { stops.splice(i,1); renderStops(); });
      li.lastElementChild.replaceWith(b);
    }
    ul.appendChild(li);
  });
}
$("addStop").addEventListener("click", () => {
  stops.splice(stops.length - 1, 0, ""); renderStops();
  const inputs = $("stops").querySelectorAll("input"); inputs[inputs.length - 2].focus();
});

/* ---------- vehicles ---------- */
let selectedVehicle = "";
function renderVehicleSelect(){
  const sel = $("f-vehicle"); sel.innerHTML = "";
  const o0 = document.createElement("option"); o0.value = ""; o0.textContent = t("choose_ph"); sel.appendChild(o0);
  VEHICLES.forEach(v => { const o = document.createElement("option"); o.value = v.id; o.textContent = vName(v); sel.appendChild(o); });
  sel.value = selectedVehicle;
}
$("f-vehicle").addEventListener("change", (e) => { selectedVehicle = e.target.value; renderCars(); });

const carSvg = `<svg viewBox="0 0 200 90" aria-hidden="true"><path fill="currentColor" d="M8 64 Q10 48 30 46 L60 44 Q78 24 102 22 L128 22 Q150 24 164 44 L184 48 Q194 51 194 64 Z"/><path d="M70 44 Q84 30 102 29 L118 29 L118 44 Z M124 29 L128 29 Q144 30 154 44 L124 44 Z" fill="var(--mist)"/><circle cx="52" cy="66" r="12" fill="currentColor"/><circle cx="52" cy="66" r="5" fill="var(--mist)"/><circle cx="154" cy="66" r="12" fill="currentColor"/><circle cx="154" cy="66" r="5" fill="var(--mist)"/><path d="M172 47 L188 58 M178 46 L192 56" stroke="var(--ribbon)" stroke-width="3" stroke-linecap="round"/></svg>`;

function renderCars(){
  const box = $("carList"); box.innerHTML = "";
  VEHICLES.filter(v => v.gallery !== false).forEach(v => {
    const card = document.createElement("article");
    card.className = "car" + (selectedVehicle === v.id ? " selected" : "");
    const photos = document.createElement("div"); photos.className = "photos";
    if (v.photos && v.photos.length) {
      v.photos.forEach((src, i) => { const img = document.createElement("img"); img.src = src; img.loading = "lazy"; img.alt = `${vName(v,"en")} photo ${i+1}`; photos.appendChild(img); });
    } else {
      photos.innerHTML = `<div class="ph"><div>${carSvg}<div></div></div></div>`;
      photos.querySelector(".ph div div").textContent = t("photos_soon");
    }
    const body = document.createElement("div"); body.className = "car-body";
    const h = document.createElement("h3"); h.className = "display"; h.textContent = vName(v);
    const p = document.createElement("p"); p.textContent = v.note ? (v.note[lang] || v.note.en) : "";
    const b = document.createElement("button"); b.type = "button";
    const isSel = selectedVehicle === v.id;
    b.className = "btn btn-small " + (isSel ? "btn-primary" : "btn-ghost");
    b.textContent = isSel ? t("chosen") : t("choose");
    b.setAttribute("aria-pressed", isSel ? "true" : "false");
    b.addEventListener("click", () => {
      selectedVehicle = v.id; $("f-vehicle").value = v.id; renderCars();
      if (!$("bookingForm").classList.contains("hidden")) $("f-vehicle").scrollIntoView({block:"center"});
    });
    body.append(h, p, b); card.append(photos, body); box.appendChild(card);
  });
}

/* ---------- duration ---------- */
function updateDuration(){
  const d = durText($("f-from").value, $("f-to").value);
  $("duration").textContent = d ? t("dur",{h:d}) : "";
}
["f-from","f-to"].forEach(id => $(id).addEventListener("input", updateDuration));

/* ---------- language ---------- */
function applyLang(){
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  const ol = $("termsList"); ol.innerHTML = "";
  t("terms").forEach(s => { const li = document.createElement("li"); li.textContent = s; ol.appendChild(li); });
  $("langBtn").textContent = t("lang_btn");
  renderStops(); renderVehicleSelect(); renderCars(); updateDuration();
  if ($("formError").textContent) $("formError").textContent = "";
}
$("langBtn").addEventListener("click", () => {
  lang = lang === "en" ? "si" : "en";
  try { localStorage.setItem("adys-lang", lang); } catch (e) {}
  applyLang();
});

/* ---------- booking form ---------- */
$("f-same").addEventListener("change", (e) => { $("f-wa").classList.toggle("hidden", e.target.checked); if (!e.target.checked) $("f-wa").focus(); });
(function setMinDate(){ const d = new Date(); const iso = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); $("f-date").min = iso; })();

function buildMessage(b){
  const lines = [
    "*Wedding car booking request*",
    `Ref: ${b.ref}`,
    `Name: ${b.name}`,
    `Contact: ${b.phone}`,
    `WhatsApp: ${b.wa}`,
    `Date: ${isoToDMY(b.date)}`,
    `Time: ${b.from} to ${b.to} (${durText(b.from, b.to, "en")})`,
    "Route:"
  ];
  b.route.forEach((s, i) => {
    const tag = i === 0 ? "Start: " : i === b.route.length - 1 ? "Finish: " : "";
    lines.push(`${i+1}. ${tag}${s}`);
  });
  lines.push(`Vehicle: ${b.vehicle}`);
  lines.push(`Decoration: ${b.deco === "with" ? "With deco" : "Without deco"}`);
  lines.push(`Notes: ${b.notes || "None"}`);
  lines.push("Terms: Agreed");
  return lines.join("\n");
}

$("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const err = $("formError");
  const same = $("f-same").checked;
  const b = {
    name: $("f-name").value.trim(),
    phone: $("f-phone").value.trim(),
    wa: same ? $("f-phone").value.trim() : $("f-wa").value.trim(),
    date: $("f-date").value,
    from: $("f-from").value,
    to: $("f-to").value,
    route: stops.map(s => s.trim()),
    vehicleId: $("f-vehicle").value,
    deco: document.querySelector('input[name="deco"]:checked').value,
    notes: $("f-notes").value.trim()
  };
  const missing = [];
  if (!b.name) missing.push(t("lbl_name"));
  if (!b.phone) missing.push(t("lbl_phone"));
  if (!same && !b.wa) missing.push(t("lbl_wa"));
  if (!b.date) missing.push(t("lbl_date"));
  if (!b.from) missing.push(t("lbl_from"));
  if (!b.to) missing.push(t("lbl_to"));
  if (!b.route[0]) missing.push(t("lbl_start"));
  if (!b.route[b.route.length - 1]) missing.push(t("lbl_end"));
  if (!b.vehicleId) missing.push(t("lbl_vehicle"));
  if (missing.length) { err.textContent = t("err_fill",{list: missing.join(", ")}); return; }
  if (!validLocal(b.phone) || (!same && !validLocal(b.wa))) { err.textContent = t("err_phone"); return; }
  if ($("f-date").min && b.date < $("f-date").min) { err.textContent = t("err_past"); return; }
  if (minutes(b.to) <= minutes(b.from)) { err.textContent = t("err_time"); return; }
  if (!$("f-agree").checked) { err.textContent = t("err_terms"); return; }
  err.textContent = "";

  b.route = b.route.filter(Boolean);
  const v = VEHICLES.find(x => x.id === b.vehicleId);
  b.vehicle = vName(v, "en");
  b.ref = makeRef(b.date);
  const msg = buildMessage(b);

  $("refOut").textContent = b.ref;
  $("waLink").href = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(msg)}`;
  $("bookingForm").classList.add("hidden");
  $("doneCard").classList.remove("hidden");
  $("doneCard").scrollIntoView({block:"start"});
  $("doneCard").focus({preventScroll:true});
});

$("newBooking").addEventListener("click", () => {
  $("bookingForm").reset(); stops = ["", ""]; selectedVehicle = "";
  $("f-wa").classList.add("hidden"); renderStops(); renderVehicleSelect(); renderCars(); updateDuration();
  $("doneCard").classList.add("hidden"); $("bookingForm").classList.remove("hidden");
  $("bookingForm").scrollIntoView({block:"start"});
});

/* ---------- footer ---------- */
$("footPhone").textContent = BUSINESS.phone;
$("footPhone").href = `https://wa.me/${BUSINESS.whatsapp}`;
$("footAddr").textContent = BUSINESS.address;

/* ---------- start ---------- */
applyLang();

/* ---------- Page animations ---------- */
(function pageAnimations(){
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  // 1. Rose petals falling across the page
  const box = document.querySelector(".petal-rain");
  if (box) {
    const colors = ["#C8102E", "#E0334F", "#FFFFFF", "#F6D5DA"];
    const count = window.innerWidth < 600 ? 14 : 18;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      const size = 8 + Math.random() * 8;
      p.className = "rain-petal";
      p.style.left = ((i + Math.random()) / count * 100) + "vw";
      p.style.width = size + "px";
      p.style.height = (size * 1.4) + "px";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (10 + Math.random() * 10) + "s";
      p.style.animationDelay = (-Math.random() * 20) + "s";
      p.style.setProperty("--drift", (Math.random() * 120 - 60) + "px");
      p.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
      box.appendChild(p);
    }
  }

  // 2. Sections gently appear while scrolling
  const items = document.querySelectorAll("main section .wrap > *, .steps li");
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
  items.forEach((el) => {
    el.classList.add("reveal");
    if (el.matches(".steps li")) el.style.transitionDelay = Array.from(el.parentNode.children).indexOf(el) * 120 + "ms";
    io.observe(el);
  });
})();

/* ---------- Invitation card: open the booking form ---------- */
function openBooking(){
  const sec = $("book");
  if (!sec.classList.contains("closed")) return;
  const card = $("inviteOpen");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { sec.classList.remove("closed"); return; }
  card.classList.add("opening");
  setTimeout(() => {
    sec.classList.remove("closed");
    sec.classList.add("opened");
    card.classList.remove("opening");
  }, 650);
}
$("inviteOpen").addEventListener("click", openBooking);
document.addEventListener("click", (e) => {
  // "Booking" buttons and menu links open the card automatically
  if (e.target.closest('a[href="#book"]')) openBooking();
  // "Choose this car" opens the form and jumps to the car list
  if (e.target.closest(".car-body button")) {
    openBooking();
    setTimeout(() => $("f-vehicle").scrollIntoView({ block: "center", behavior: "smooth" }), 700);
  }
});

/* ---------- Car showcase animations ---------- */
(function carShowcase(){
  const list = $("carList");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) { list.classList.add("show-cars", "shown"); return; }

  // Slide the cars in the first time the customer scrolls to them
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      list.classList.add("show-cars");
      setTimeout(() => list.classList.add("shown"), 2500);
      io.disconnect();
    }
  }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
  io.observe(list);

  // Hearts float up from "Choose this car"
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".car-body button")) return;
    for (let i = 0; i < 7; i++) {
      const h = document.createElement("span");
      h.className = "heart-pop";
      h.textContent = "\u2665\uFE0E";
      h.style.left = (e.clientX - 8 + (Math.random() * 40 - 20)) + "px";
      h.style.top = (e.clientY - 10) + "px";
      h.style.color = i % 2 ? "#C8102E" : "#E0334F";
      h.style.setProperty("--x", (Math.random() * 80 - 40) + "px");
      h.style.animationDelay = (i * 60) + "ms";
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1700);
    }
  });
})();

/* ---------- Booking form extras ---------- */
(function formExtras(){
  const form = $("bookingForm");
  if (!form) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Progress ribbon at the top of the form
  const box = document.createElement("div");
  box.className = "form-progress";
  box.setAttribute("aria-hidden", "true");
  box.innerHTML = '<div class="fp-track"><div class="fp-fill"></div>' +
    '<span class="fp-car"><svg viewBox="0 0 32 16" width="32" height="16">' +
    '<path d="M2 11Q2 7 6 7H9L12 3H21L25 7H28Q31 7 31 10V12H2Z" fill="var(--main)"/>' +
    '<path d="M13 4H17V7H10.5ZM18 4H20.5L23.5 7H18Z" fill="#FFFFFF" opacity=".85"/>' +
    '<circle cx="9" cy="12.5" r="2.6" fill="#2D1F22"/><circle cx="24" cy="12.5" r="2.6" fill="#2D1F22"/>' +
    '</svg></span><span class="fp-end">\u2665\uFE0E</span></div>';
  form.prepend(box);
  const fill = box.querySelector(".fp-fill");
  const car = box.querySelector(".fp-car");

  function update(){
    const stopInputs = $("stops").querySelectorAll("input");
    const checks = [
      $("f-name").value.trim(),
      $("f-phone").value.trim(),
      $("f-same").checked || $("f-wa").value.trim(),
      $("f-date").value,
      $("f-from").value,
      $("f-to").value,
      stopInputs.length && stopInputs[0].value.trim(),
      stopInputs.length && stopInputs[stopInputs.length - 1].value.trim(),
      $("f-vehicle").value,
      $("f-agree").checked
    ];
    const pct = Math.round(checks.filter(Boolean).length / checks.length * 100);
    box.style.setProperty("--p", pct / 100);
    box.classList.toggle("done", pct === 100);
  }
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("reset", () => setTimeout(update, 0));
  document.addEventListener("click", () => setTimeout(update, 0));
  update();

  // 2. Hearts float up when the terms box is ticked
  $("f-agree").addEventListener("change", (e) => {
    if (!e.target.checked || reduce) return;
    const r = e.target.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const h = document.createElement("span");
      h.className = "heart-pop";
      h.textContent = "\u2665\uFE0E";
      h.style.left = (r.left + r.width / 2 - 8 + (Math.random() * 30 - 15)) + "px";
      h.style.top = (r.top - 6) + "px";
      h.style.color = i % 2 ? "#C8102E" : "#E0334F";
      h.style.setProperty("--x", (Math.random() * 60 - 30) + "px");
      h.style.animationDelay = (i * 60) + "ms";
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1700);
    }
  });
})();

/* ---------- Celebration after "Continue to WhatsApp" ---------- */
(function celebration(){
  const done = $("doneCard");
  if (!done) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CAR = '<svg viewBox="-70 0 290 90">' +
    '<path d="M12 62Q-10 66-30 74M12 64Q-20 72-52 79" stroke="#9AA0A8" stroke-width="1.2" fill="none"/>' +
    '<rect class="cel-can" x="-36" y="69" width="10" height="13" rx="2" fill="#C9CDD3"/>' +
    '<rect class="cel-can" x="-60" y="73" width="10" height="13" rx="2" fill="#AEB4BC" style="animation-delay:.11s"/>' +
    '<path d="M10 62Q10 48 26 46L58 44Q74 24 100 22H140Q160 24 176 44L200 48Q212 50 212 62V70H10Z" fill="#8C1C35"/>' +
    '<path d="M66 44Q80 30 100 29H116V44ZM122 29H140Q156 30 168 44H122Z" fill="#F7E9EA"/>' +
    '<rect x="14" y="50" width="42" height="11" rx="2" fill="#FFFFFF"/>' +
    '<text x="35" y="58" font-size="6.4" text-anchor="middle" fill="#C8102E" font-family="Georgia,serif" font-style="italic">Just Married</text>' +
    '<path d="M196 50C188 42 182 46 186 52C190 56 196 52 196 50ZM196 50C204 42 210 46 206 52C202 56 196 52 196 50Z" fill="#FFFFFF"/>' +
    '<circle cx="196" cy="50" r="2.5" fill="#C49A45"/>' +
    '<circle cx="52" cy="70" r="14" fill="#2D1F22"/><circle cx="52" cy="70" r="6" fill="#C9CDD3"/>' +
    '<circle cx="172" cy="70" r="14" fill="#2D1F22"/><circle cx="172" cy="70" r="6" fill="#C9CDD3"/>' +
    '</svg>';

  function celebrate(){
    if (reduce) return;
    const box = document.createElement("div");
    box.className = "celebrate";
    box.setAttribute("aria-hidden", "true");

    const msg = document.createElement("div");
    msg.className = "cel-msg";
    msg.textContent = t("cel_title");
    box.appendChild(msg);

    const colors = ["#C8102E", "#E0334F", "#FFFFFF", "#C49A45", "#F6D5DA"];
    const reach = Math.min(window.innerWidth, window.innerHeight) * 0.45;
    for (let i = 0; i < 40; i++) {
      const s = document.createElement("span");
      const heart = i % 3 === 0;
      const a = Math.random() * Math.PI * 2;
      const d = 100 + Math.random() * reach;
      s.className = "cel-bit" + (heart ? " heart" : "");
      if (heart) { s.textContent = "\u2665\uFE0E"; s.style.color = i % 2 ? "#C8102E" : "#FFFFFF"; }
      else s.style.background = colors[i % colors.length];
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d + "px");
      s.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
      s.style.animationDelay = Math.random() * 150 + "ms";
      box.appendChild(s);
    }

    const car = document.createElement("div");
    car.className = "cel-car";
    car.innerHTML = CAR;
    box.appendChild(car);

    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3800);
  }

  // Runs when the "ready to send" card appears after a successful booking
  new MutationObserver(() => {
    if (!done.classList.contains("hidden")) celebrate();
  }).observe(done, { attributes: true, attributeFilter: ["class"] });
})();

/* ---------- Footer details ---------- */
$("footYear").textContent = new Date().getFullYear();
$("footWa").href = "https://wa.me/" + BUSINESS.whatsapp;

/* ---------- Floating WhatsApp button ---------- */
(function waFloat(){
  const btn = $("waFloat");
  if (!btn) return;
  const link = () => "https://wa.me/" + BUSINESS.whatsapp + "?text=" + encodeURIComponent(t("wa_msg"));
  btn.href = link();
  btn.addEventListener("click", () => { btn.href = link(); });

  // Appears after scrolling a little; shows "Chat with us" once
  let tipShown = false;
  function onScroll(){
    if (window.scrollY > 300) {
      if (!btn.classList.contains("show")) {
        btn.classList.add("show");
        if (!tipShown) {
          tipShown = true;
          setTimeout(() => btn.classList.add("tip"), 700);
          setTimeout(() => btn.classList.remove("tip"), 4700);
        }
      }
    } else {
      btn.classList.remove("show");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---------- Header: shrink on scroll + highlight current section ---------- */
(function headerExtras(){
  const head = document.querySelector("header.top");
  if (!head) return;
  const onScroll = () => head.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!("IntersectionObserver" in window)) return;
  const links = Array.from(document.querySelectorAll('nav.links a[href^="#"]'));
  const map = new Map();
  links.forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s) map.set(s, a); });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.remove("active"));
        map.get(e.target).classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((a, s) => io.observe(s));
})();