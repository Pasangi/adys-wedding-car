/* Owner page: read a booking message, add the fee, make the PDF invoice and send the confirmation. */
(function initIssued(){ const d = new Date(); $("a-issued").value = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); })();

function parseBooking(raw){
  const txt = raw.replace(/[*_~]/g, "").replace(/\r/g, "");
  const get = (label) => { const m = txt.match(new RegExp("^\\s*" + label + "\\s*:\\s*(.+)$", "mi")); return m ? m[1].trim() : ""; };
  const out = {
    ref: get("Ref"), name: get("Name"), phone: get("Contact"), wa: get("WhatsApp"),
    date: dmyToIso(get("Date")), vehicle: get("Vehicle"),
    deco: /without/i.test(get("Decoration")) ? "without" : "with"
  };
  const tm = txt.match(/^\s*Time\s*:\s*(\d{1,2}:\d{2})\D+(\d{1,2}:\d{2})/mi);
  if (tm) { out.from = tm[1].padStart(5,"0"); out.to = tm[2].padStart(5,"0"); }
  const lines = txt.split("\n"); const ri = lines.findIndex(l => /^\s*Route\s*:/i.test(l));
  out.route = [];
  if (ri >= 0) for (let i = ri + 1; i < lines.length; i++) {
    const m = lines[i].match(/^\s*\d+\.\s*(?:Start:|Finish:)?\s*(.+)$/i);
    if (!m) break; out.route.push(m[1].trim());
  }
  const nm = txt.match(/(?:^|\n)\s*Notes\s*:\s*([\s\S]*?)(?:\n\s*Terms\s*:|$)/i);
  out.notes = nm ? nm[1].trim() : "";
  if (/^none$/i.test(out.notes)) out.notes = "";
  return out;
}

$("a-fill").addEventListener("click", () => {
  const st = $("a-fillStatus");
  const p = parseBooking($("a-paste").value);
  if (!p.name && !p.ref) { st.className = "status bad"; st.textContent = "No booking found. Paste the whole message, starting from “Wedding car booking request”."; return; }
  $("a-ref").value = p.ref; $("a-name").value = p.name; $("a-phone").value = p.phone; $("a-wa").value = p.wa || p.phone;
  $("a-date").value = p.date; $("a-from").value = p.from || ""; $("a-to").value = p.to || "";
  $("a-route").value = p.route.join("\n"); $("a-vehicle").value = p.vehicle; $("a-deco").value = p.deco; $("a-notes").value = p.notes;
  st.className = "status"; st.textContent = "Details filled. Add the fee below.";
  updateAdmin(); $("a-total").focus();
});

function adminData(){
  const total = Number($("a-total").value) || 0, adv = Number($("a-adv").value) || 0;
  return {
    ref: $("a-ref").value.trim(), issued: $("a-issued").value, name: $("a-name").value.trim(),
    phone: $("a-phone").value.trim(), wa: $("a-wa").value.trim() || $("a-phone").value.trim(),
    date: $("a-date").value, from: $("a-from").value, to: $("a-to").value,
    route: $("a-route").value.split("\n").map(s => s.trim()).filter(Boolean),
    vehicle: $("a-vehicle").value.trim(), deco: $("a-deco").value, notes: $("a-notes").value.trim(),
    total, adv, balance: Math.max(total - adv, 0),
    hr: Number($("a-hr").value) || 0, km: Number($("a-km").value) || 0
  };
}

function confirmMessage(d){
  const lines = [
    `Hello ${d.name}, your wedding car booking is confirmed.`,
    "",
    `Ref: ${d.ref}`,
    `Date: ${isoToDMY(d.date)}`,
    `Time: ${pretty12(d.from)} to ${pretty12(d.to)}`,
    "Route:"
  ];
  d.route.forEach((s,i) => lines.push(`${i+1}. ${s}`));
  lines.push(`Vehicle: ${d.vehicle} ${d.deco === "with" ? "with deco" : "without deco"}`);
  lines.push("");
  lines.push(`Total: ${rs(d.total)}`);
  if (d.adv) lines.push(`Advance paid: ${rs(d.adv)}`);
  lines.push(`Balance: ${rs(d.balance)} (paid at the end of the hire)`);
  lines.push(`Extra: ${rs(d.hr)} per extra hour and ${rs(d.km)} per extra km.`);
  lines.push("");
  lines.push("Your invoice is attached as a PDF. Changes or cancellations need our approval.");
  lines.push(`Thank you for choosing ${BUSINESS.name}!`);
  return lines.join("\n");
}

function updateAdmin(){
  const d = adminData();
  $("a-balance").textContent = rs(d.balance);
  $("a-send").href = `https://wa.me/${waNumber(d.wa)}?text=${encodeURIComponent(confirmMessage(d))}`;
}
document.querySelectorAll("main input, main select, main textarea").forEach(el => {
  if (el.id !== "a-paste") el.addEventListener("input", updateAdmin);
});
$("a-send").addEventListener("click", (e) => {
  const d = adminData(); const st = $("a-status");
  if (!d.name || !digits(d.wa) || !d.total) { e.preventDefault(); st.className = "status bad"; st.textContent = "Add the customer’s name, WhatsApp number and the total fee first."; }
});

/* ---------- Logo for the PDF ---------- */
let LOGO = null;
(function loadLogo(){
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    LOGO = { data: c.toDataURL("image/png"), w: img.naturalWidth, h: img.naturalHeight };
  };
  img.src = "images/logo.png";
})();

function makeInvoice(d){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const L = 20, R = 190, W = 170;
  let y = 32;
  const need = (h) => { if (y + h > 282) { doc.addPage(); y = 22; } };
  const lv = (label, value, x, yy, size) => {
    doc.setFontSize(size || 12); doc.setFont("times","bold"); doc.text(label, x, yy);
    const w = doc.getTextWidth(label); doc.setFont("times","normal"); doc.text(value, x + w + 1.5, yy);
  };
  const bar = (left, mid, right) => {
    need(10); doc.setFillColor(255, 240, 0); doc.rect(L, y - 5.2, W, 7.4, "F");
    doc.setFont("times","bold"); doc.setFontSize(13); doc.setTextColor(0);
    doc.text(left, L + 1, y);
    if (mid) doc.text(mid, 105, y, { align: "center" });
    doc.text(right, R - 1, y, { align: "right" });
  };

  // Header
  doc.setTextColor(0);
  doc.setFont("times","bold"); doc.setFontSize(24); doc.text("ADY’S WEDDING CAR", L, y);
    if (LOGO) {
    // Logo in the top right corner, max 48 mm wide and 36 mm tall
    let w = 48, h = w * LOGO.h / LOGO.w;
    if (h > 36) { h = 36; w = h * LOGO.w / LOGO.h; }
    doc.addImage(LOGO.data, "PNG", R - w, 10, w, h);
  }

  y = 50; doc.setFont("times","normal"); doc.setFontSize(11);
  doc.text(`Billed to: ${d.name}.`, L, y); y += 7;
  if (d.issued) { const [Y,M,D] = d.issued.split("-").map(Number); doc.text(new Date(Y, M-1, D).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}), L, y); y += 7; }
  doc.text(d.phone || d.wa, L, y); y += 6;
  if (d.ref) { doc.text(`Ref: ${d.ref}`, L, y); }
  y += 9;

  bar("Details", "Vehicle", "Total"); y += 10;
  lv("Date:", `${isoToDMY(d.date)}.`, L, y, 13);
  doc.setFont("times","bold"); doc.setFontSize(13);
  const vehLines = doc.splitTextToSize(d.vehicle || "", 62);
  doc.text(vehLines, 115, y, { align: "center" });
  doc.text(rs(d.total), R, y, { align: "right" });
  y += Math.max(8, vehLines.length * 6);
  lv("Time:", `${pretty12(d.from)} to ${pretty12(d.to)}.`, L, y, 12); y += 9;
  doc.setFont("times","bold"); doc.setFontSize(13); doc.text("Locations:", L, y); y += 7;
  doc.setFont("times","normal"); doc.setFontSize(11);
  d.route.forEach((s, i) => {
    const tag = i === 0 ? "START" : i === d.route.length - 1 ? "FINALLY" : "THEN";
    const lines = doc.splitTextToSize(`${tag} - ${s}${/[.!?]$/.test(s) ? "" : "."}`, W);
    need(lines.length * 6); doc.text(lines, L, y); y += lines.length * 6 + 0.8;
  });
  y += 2; need(8);
  lv("Preferred Vehicle:", `${d.vehicle} ${d.deco === "with" ? "with Deco" : "without Deco"}.`, L, y, 11); y += 7;
  need(14); doc.setFont("times","normal"); doc.setFontSize(11);
  doc.text(`Additional Charges - Rs.${d.hr.toLocaleString("en-US")} per extra hour`, L, y); y += 6;
  doc.text(`& Rs.${d.km.toLocaleString("en-US")} per extra km (over included km).`, L, y); y += 7;
  if (d.notes) {
    const nl = doc.splitTextToSize(`Notes: ${d.notes}`, W); need(nl.length * 6 + 2);
    doc.text(nl, L, y); y += nl.length * 6 + 1;
  }
  y += 4;
  bar("Advanced", "", "-" + rs(d.adv)); y += 10;
  bar("Balance", "", rs(d.balance)); y += 12;

  need(48);
  const top = y;
  doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.text("Make Payments to:", L, y); y += 8;
  doc.setFont("times","normal"); doc.setFontSize(11);
  [`${BUSINESS.bank.account},`, `${BUSINESS.bank.holder},`, `${BUSINESS.bank.bank},`, `${BUSINESS.bank.branch}.`, "Purpose: Wedding Car."].forEach(s => { doc.text(s, L, y); y += 6.4; });
  let ry = top;
  const right = doc.splitTextToSize("The balance payment needs to be paid at the end of the hire.", 52);
  doc.text(right, 138, ry); ry += right.length * 6.4;
  doc.text(BUSINESS.address + ".", 138, ry); ry += 6.4;
  doc.text(BUSINESS.phone + ".", 138, ry);
  y = Math.max(y, ry) + 18;

  need(10);
  doc.setFont("times","bold"); doc.setFontSize(14);
  doc.text("THANK YOU FOR CONTACTING US ON YOUR BEAUTIFUL DAY.", 105, Math.max(y, 262), { align: "center" });
  return doc;
}

async function deliverPdf(blob, filename){
  // 1. Phone share sheet (works when the site is hosted on its own address)
  try {
    const file = new File([blob], filename, { type: "application/pdf" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      return "shared";
    }
  } catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
  // 2. Plain download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "saved";
}

$("a-pdf").addEventListener("click", async () => {
  const st = $("a-status"); const d = adminData();
  if (!d.name || !d.date || !d.route.length || !d.total) { st.className = "status bad"; st.textContent = "Fill in the name, wedding date, route and total fee first."; return; }
  if (!window.jspdf) { st.className = "status bad"; st.textContent = "The PDF tool didn’t load. Check the internet connection and reload the page."; return; }
  const doc = makeInvoice(d);
  const safe = (d.ref || "Invoice") + "_" + d.name.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_");
  const result = await deliverPdf(doc.output("blob"), `${safe}.pdf`);
  st.className = "status";
  st.textContent = result === "shared" ? "Invoice shared." : result === "saved" ? "Invoice saved. Now send the confirmation and attach the PDF." : "Not saved.";
});

/* ---------- Calendar reminders ---------- */
// Reminders: 2 days before and 1 day before the pick-up time
function bookingDetails(d){
  const lines = [
    `Ref: ${d.ref}`,
    `Customer: ${d.name}`,
    `Phone: ${d.phone}`,
    `WhatsApp: ${d.wa}`,
    `Time: ${pretty12(d.from)} to ${pretty12(d.to)}`,
    "Route:"
  ];
  d.route.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push(`Vehicle: ${d.vehicle} ${d.deco === "with" ? "with deco" : "without deco"}`);
  lines.push(`Total: ${rs(d.total)}`);
  lines.push(`Advance: ${rs(d.adv)}`);
  lines.push(`Balance: ${rs(d.balance)}`);
  if (d.notes) lines.push(`Notes: ${d.notes}`);
  return lines.join("\n");
}
function icsText(s){ return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
function icsFold(line){ const out = []; while (line.length > 70) { out.push(line.slice(0, 70)); line = " " + line.slice(70); } out.push(line); return out.join("\r\n"); }
function icsDate(iso, hhmm){ return iso.replace(/-/g, "") + "T" + hhmm.replace(":", "") + "00"; }

function makeIcs(d){
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = "Wedding hire: " + d.name + (d.ref ? " (" + d.ref + ")" : "");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Adys Wedding Car//Bookings//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${d.ref || Date.now()}@adys-wedding-car`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsDate(d.date, d.from)}`,
    `DTEND:${icsDate(d.date, d.to || d.from)}`,
    `SUMMARY:${icsText(title)}`,
    `LOCATION:${icsText(d.route[0] || "")}`,
    `DESCRIPTION:${icsText(bookingDetails(d))}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsText("Wedding hire in 2 days: " + d.name)}`, "TRIGGER:-P2D", "END:VALARM",
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsText("Wedding hire tomorrow: " + d.name)}`, "TRIGGER:-P1D", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ];
  return lines.map(icsFold).join("\r\n") + "\r\n";
}

function calendarReady(d){
  const st = $("a-status");
  if (!d.name || !d.date || !d.from) { st.className = "status bad"; st.textContent = "Fill in the name, wedding date and pick-up time first."; return false; }
  return true;
}

$("a-save").addEventListener("click", async () => {
  const st = $("a-status"); const btn = $("a-save"); const d = adminData();
  if (!d.name || !d.date || !d.from) { st.className = "status bad"; st.textContent = "Fill in the name, wedding date and pick-up time first."; return; }
  if (!d.ref) { d.ref = makeRef(d.date); $("a-ref").value = d.ref; }
  btn.disabled = true; st.className = "status"; st.textContent = "Saving…";
  try {
    const res = await fetch(BOOKINGS_URL, { method: "POST", body: JSON.stringify({ ...d, details: bookingDetails(d) }) });
    const out = await res.json();
    if (!out.ok) throw new Error(out.error || "Unknown error");
    st.textContent = out.updated ? "Booking updated in the sheet and calendar." : "Booking saved to the sheet and added to the calendar with reminders.";
  } catch (err) {
    st.className = "status bad"; st.textContent = "Couldn’t save. Check the internet and try again. (" + err.message + ")";
  } finally {
    btn.disabled = false;
  }
});

/* ---------- start ---------- */
updateAdmin();
