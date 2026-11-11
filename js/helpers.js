/* Small helper functions used by both pages. */
const $ = (id) => document.getElementById(id);
function digits(s){ return (s || "").replace(/\D/g, ""); }
function waNumber(s){
  let d = digits(s);
  if (d.startsWith("0") && d.length === 10) d = "94" + d.slice(1);
  else if (d.length === 9 && d.startsWith("7")) d = "94" + d;
  return d;
}
function validLocal(s){ const d = digits(s); return d.length === 10 || (d.startsWith("94") && d.length === 11); }
function isoToDMY(iso){ if(!iso) return ""; const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; }
function dmyToIso(s){ const m = (s||"").match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/); return m ? `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}` : ""; }
function minutes(hhmm){ const [h,m] = (hhmm||"").split(":").map(Number); return h*60 + m; }
function rs(n){ return "Rs. " + (Number(n)||0).toLocaleString("en-US"); }
function pretty12(hhmm){
  if(!hhmm) return "";
  let [h,m] = hhmm.split(":").map(Number); const ap = h >= 12 ? "p.m." : "a.m.";
  h = h % 12 || 12; return `${String(h).padStart(2,"0")}.${String(m).padStart(2,"0")} ${ap}`;
}
function makeRef(iso){
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; let r = "";
  for (let i=0;i<3;i++) r += chars[Math.floor(Math.random()*chars.length)];
  return "ADY-" + iso.replace(/-/g,"").slice(2) + "-" + r;
}
