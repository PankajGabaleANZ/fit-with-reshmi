// One-time copy of an existing local SQLite file into Firestore.
// Usage: npm run migrate-sqlite -- [path/to/database.sqlite]
// Safe to re-run: documents are written under the same ids (existing ones are overwritten).
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import * as store from "./src/db.js";

dotenv.config();
const file = path.resolve(process.argv[2] || "database.sqlite");
if (!fs.existsSync(file)) {
  console.error(`No SQLite file found at ${file}`);
  process.exit(1);
}
const sqlite = new Database(file, { readonly: true, fileMustExist: true });
const db = store.getDb();
const has = (t: string) => !!sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t);

async function copy(table: string, coll: string, idOf: (r: any) => string, map: (r: any) => any) {
  if (!has(table)) return console.log(`- ${table}: not in file, skipped`);
  const rows = sqlite.prepare(`SELECT * FROM ${table}`).all() as any[];
  for (let i = 0; i < rows.length; i += 400) {
    const batch = db.batch();
    for (const r of rows.slice(i, i + 400)) batch.set(db.collection(coll).doc(idOf(r)), map(r));
    await batch.commit();
  }
  console.log(`- ${table}: ${rows.length} copied`);
}

const maxId = (t: string) => (has(t) ? (sqlite.prepare(`SELECT MAX(id) m FROM ${t}`).get() as any).m || 0 : 0);

(async () => {
  await copy("clients", "clients", (r) => String(r.id), (r) => ({ ...r, email_lower: String(r.email).trim().toLowerCase(), password_hash: r.password_hash ?? null }));
  await copy("bookings", "bookings", (r) => String(r.id), (r) => r);
  await copy("sessions", "sessions", (r) => String(r.booking_id), (r) => ({ booking_id: r.booking_id, transcription: r.transcription, plan: r.plan, updated_at: r.created_at }));
  await copy("site_settings", "site_settings", (r) => r.key, (r) => r);
  await copy("breath_protocols", "breath_protocols", (r) => String(r.id), (r) => r);
  await copy("instagram_reels", "instagram_reels", (r) => String(r.id), (r) => r);
  await copy("assessments", "assessments", (r) => String(r.id), (r) => ({ ...r, domains: JSON.parse(r.domains || "{}"), answers: JSON.parse(r.answers || "[]") }));
  // Keep new ids from colliding with copied ones.
  await db.collection("counters").doc("clients").set({ value: maxId("clients") });
  await db.collection("counters").doc("bookings").set({ value: maxId("bookings") });
  console.log("Done.");
})().catch((e) => { console.error(e); process.exit(1); });
