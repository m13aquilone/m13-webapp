/**
 * Receives Careers form submissions from the website and appends them to this
 * spreadsheet. Setup: README.md, "Careers form".
 */
const SHEET_NAME = "Applications";
const HEADERS = ["Submitted at", "Name", "Email", "Phone", "About"];

/** Opening the web app URL in a browser shows this, which confirms the deployment works. */
function doGet() {
  return ContentService.createTextOutput("M13 Aquilone careers endpoint is running.");
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Honeypot field: real visitors never fill it in.
  if (p.company) return json({ ok: true });
  if (!p.name || !p.email || !p.phone || !p.about) return json({ ok: false, error: "missing fields" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(), clean(p.name, 120), clean(p.email, 160), clean(p.phone, 20), clean(p.about, 3000)]);
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/** Trims length and stops values starting with = + - @ from running as formulas. */
function clean(value, max) {
  const text = String(value || "").trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
