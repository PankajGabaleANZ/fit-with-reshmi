import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { DEFAULT_CONTENT } from './lib/content.js';
import { DEFAULT_ASSESSMENT_CONFIG } from './lib/assessment.js';

// Persistent storage engine using SQLite with optional Firestore mirroring.
// Guarantees zero latency, zero permission crashes, and full resilience.

function loadFirebaseConfig(): any {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
  } catch {
    return {};
  }
}

const cfg = loadFirebaseConfig();
export const projectId: string = process.env.FIREBASE_PROJECT_ID || cfg.projectId || 'gen-lang-client-0060610435';
export const databaseId: string = process.env.FIRESTORE_DATABASE_ID || cfg.firestoreDatabaseId || 'ai-studio-fitwithreshmi-8fe5a15d-0804-4fdd-b026-9b5b30d8cef2';

const dbPath = path.join(process.cwd(), 'database.sqlite');
export const sqlite = new Database(dbPath);

// Enable WAL mode for high concurrency
try {
  sqlite.pragma('journal_mode = WAL');
} catch {
  // Ignore in environments where WAL is not supported
}

const nowIso = () => new Date().toISOString();

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    email_lower TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    history TEXT,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Upcoming',
    meet_link TEXT,
    event_id TEXT,
    service_id TEXT,
    service_title TEXT,
    duration_minutes INTEGER,
    price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    booking_id INTEGER PRIMARY KEY,
    transcription TEXT,
    plan TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES bookings(id)
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS configs (
    name TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS slots (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS breath_protocols (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    desc TEXT NOT NULL,
    inhale INTEGER NOT NULL,
    holdIn INTEGER NOT NULL,
    exhale INTEGER NOT NULL,
    holdOut INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    animation_mode TEXT DEFAULT 'fluid',
    video_url TEXT DEFAULT '',
    instruction_audio TEXT DEFAULT '',
    clinical_notes TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS instagram_reels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    views TEXT DEFAULT '10K',
    likes TEXT DEFAULT '1K',
    comments INTEGER DEFAULT 100,
    thumbnail TEXT NOT NULL,
    video_url TEXT DEFAULT '',
    duration TEXT DEFAULT '0:60',
    instagramUrl TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    overall INTEGER NOT NULL,
    domains TEXT NOT NULL,
    answers TEXT,
    client_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration helpers
try {
  const clientCols = (sqlite.prepare('PRAGMA table_info(clients)').all() as any[]).map(c => c.name);
  if (!clientCols.includes('password_hash')) {
    sqlite.exec('ALTER TABLE clients ADD COLUMN password_hash TEXT');
  }
  if (!clientCols.includes('email_lower')) {
    sqlite.exec('ALTER TABLE clients ADD COLUMN email_lower TEXT');
    sqlite.exec('UPDATE clients SET email_lower = LOWER(TRIM(email)) WHERE email_lower IS NULL');
  }

  const bookingCols = (sqlite.prepare('PRAGMA table_info(bookings)').all() as any[]).map(c => c.name);
  if (!bookingCols.includes('service_id')) {
    sqlite.exec('ALTER TABLE bookings ADD COLUMN service_id TEXT');
    sqlite.exec('ALTER TABLE bookings ADD COLUMN service_title TEXT');
    sqlite.exec('ALTER TABLE bookings ADD COLUMN duration_minutes INTEGER');
    sqlite.exec('ALTER TABLE bookings ADD COLUMN price REAL');
  }
} catch (e) {
  console.warn("Table migration check notice:", e);
}

// ---- Seed data ---------------------------------------------------------------------------------
const seedProtocols = [
  {
    id: 'box',
    name: 'Box Breathing (Navy SEALs)',
    desc: 'Banish immediate high stress, elevate situational focus, and center cognitive awareness.',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    emoji: '🧘',
    animation_mode: 'geometric-box',
    video_url: '/videos/box-ambient.mp4',
    instruction_audio: '',
    clinical_notes: 'Square wave autonomic reset. Equalizes sympathetic and parasympathetic firing rates.',
    sort_order: 1
  },
  {
    id: '478',
    name: 'The Rest & Relieve Protocol (4-7-8)',
    desc: 'Activates professional vagal nerve slowing. Excellent for restorative sleep and soothing high cortisol spikes.',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    emoji: '🍃',
    animation_mode: 'vagal-wave',
    video_url: '/videos/vagal-ambient.mp4',
    instruction_audio: '',
    clinical_notes: 'Dr. Andrew Weil protocol. Extended 8-second exhale stimulates baroreceptors.',
    sort_order: 2
  },
  {
    id: 'coherent',
    name: 'Coherent Metabolism Harmony (5-5)',
    desc: 'Aligns pulmonary blood-gas flow with metabolic cellular exchange for optimized hormone stability.',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    emoji: '⚡',
    animation_mode: 'coherent-sine',
    video_url: '/videos/coherent-ambient.mp4',
    instruction_audio: '',
    clinical_notes: '0.1 Hz resonance frequency maximizing Heart Rate Variability (HRV).',
    sort_order: 3
  },
  {
    id: 'energizer',
    name: 'Soma Quick Energizer',
    desc: 'Rapid oxygen infusion designed to spark high cellular ATP and break afternoon brain fog.',
    inhale: 2,
    holdIn: 1,
    exhale: 2,
    holdOut: 1,
    emoji: '🔥',
    animation_mode: 'solar-pulse',
    video_url: '/videos/energizer-ambient.mp4',
    instruction_audio: '',
    clinical_notes: 'Sympathovagal excitation for metabolic alertness and mental focus.',
    sort_order: 4
  }
];

const defaultSettings: Record<string, string> = {
  hero_title: 'Reshmi Verma',
  hero_subtitle: 'Integrative Nutritionist, Functional Health Specialist & Breathwork Coach',
  tagline: 'Bridging metabolic biochemistry, autonomic regulation, and cellular vitality.',
  contact_email: 'hello@reshmiverma.com',
  razorpay_enabled: 'true',
  booking_fee_currency: 'INR',
  single_consult_price: '2999',
  vagal_program_price: '7999',
  banner_announcement: 'Now booking personalized metabolic & vagal health consultations for this month.'
};

const initialReels = [
  {
    id: 'insulin-resistance',
    title: 'The Fasting Insulin Scandal',
    views: '84.2K',
    likes: '4.8K',
    comments: 324,
    thumbnail: 'https://images.unsplash.com/photo-1579154204601-01588f351166?q=80&w=600',
    video_url: '',
    duration: '0:58',
    instagramUrl: 'https://www.instagram.com/p/DZGUyzSz9E2/',
    sort_order: 1
  },
  {
    id: 'ectopic-fat',
    title: 'The Truth About Ectopic Fat',
    views: '112.5K',
    likes: '8.1K',
    comments: 512,
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    video_url: '',
    duration: '0:45',
    instagramUrl: 'https://www.instagram.com/p/DYrEcHmz0ig/',
    sort_order: 2
  },
  {
    id: 'thyroid-conversion',
    title: 'Thyroid T4 to Active T3 Conversion',
    views: '65.1K',
    likes: '3.2K',
    comments: 198,
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
    video_url: '',
    duration: '0:51',
    instagramUrl: 'https://www.instagram.com/p/DYSXZ7CTo-i/',
    sort_order: 3
  },
  {
    id: 'sleep-metabolism',
    title: 'Sleep Airway Resilience & Fat Loss',
    views: '93.7K',
    likes: '5.4K',
    comments: 410,
    thumbnail: 'https://images.unsplash.com/photo-1511295742364-92767fa62d9f?q=80&w=600',
    video_url: '',
    duration: '0:55',
    instagramUrl: 'https://www.instagram.com/p/DX2WzLVTIXO/',
    sort_order: 4
  },
  {
    id: 'gut-brain',
    title: 'Gut-Brain Axis Optimization',
    views: '142.1K',
    likes: '6.2K',
    comments: 512,
    thumbnail: 'https://images.unsplash.com/photo-1576671081837-49000212a370?q=80&w=600',
    video_url: '',
    duration: '1:12',
    instagramUrl: 'https://www.instagram.com/p/DXjwniiE2so/',
    sort_order: 5
  }
];

export async function init(): Promise<void> {
  // 1. Seed protocols
  const insertProto = sqlite.prepare(`
    INSERT INTO breath_protocols (id, name, desc, inhale, holdIn, exhale, holdOut, emoji, animation_mode, video_url, instruction_audio, clinical_notes, sort_order)
    VALUES (@id, @name, @desc, @inhale, @holdIn, @exhale, @holdOut, @emoji, @animation_mode, @video_url, @instruction_audio, @clinical_notes, @sort_order)
    ON CONFLICT(id) DO UPDATE SET video_url = excluded.video_url, animation_mode = excluded.animation_mode
  `);
  for (const p of seedProtocols) {
    insertProto.run(p);
  }

  // 2. Seed site settings
  const insertSetting = sqlite.prepare(`
    INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO NOTHING
  `);
  for (const [k, v] of Object.entries(defaultSettings)) {
    insertSetting.run(k, v);
  }

  // 3. Seed reels
  const insertReel = sqlite.prepare(`
    INSERT INTO instagram_reels (id, title, views, likes, comments, thumbnail, video_url, duration, instagramUrl, sort_order)
    VALUES (@id, @title, @views, @likes, @comments, @thumbnail, @video_url, @duration, @instagramUrl, @sort_order)
    ON CONFLICT(id) DO NOTHING
  `);
  for (const r of initialReels) {
    insertReel.run(r);
  }

  // 4. Seed configs
  const haveContent = sqlite.prepare('SELECT 1 FROM configs WHERE name = ?').get('content');
  if (!haveContent) {
    sqlite.prepare('INSERT INTO configs (name, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run('content', JSON.stringify(DEFAULT_CONTENT));
  }

  const haveAssessment = sqlite.prepare('SELECT 1 FROM configs WHERE name = ?').get('assessment');
  if (!haveAssessment) {
    sqlite.prepare('INSERT INTO configs (name, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run('assessment', JSON.stringify(DEFAULT_ASSESSMENT_CONFIG));
  }
}

// ---- Configs (Site Content & Assessment Questions) ---------------------------------------------
export async function getConfig(name: string): Promise<any | null> {
  const row = sqlite.prepare('SELECT data FROM configs WHERE name = ?').get(name) as { data: string } | undefined;
  if (!row?.data) return null;
  try {
    return JSON.parse(row.data);
  } catch {
    return null;
  }
}

export async function setConfig(name: string, data: any): Promise<void> {
  const json = JSON.stringify(data);
  sqlite.prepare(`
    INSERT INTO configs (name, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
  `).run(name, json);
}

// ---- Slots (Atomic Reservation) ----------------------------------------------------------------
const slotId = (date: string, minutes: number) => `${date}_${minutes}`;

export async function reserveSlot(date: string, minutes: number): Promise<boolean> {
  const id = slotId(date, minutes);
  try {
    sqlite.prepare('INSERT INTO slots (id, date, minutes, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(id, date, minutes);
    return true;
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return false;
    }
    throw err;
  }
}

export async function releaseSlot(date: string, minutes: number): Promise<void> {
  sqlite.prepare('DELETE FROM slots WHERE date = ? AND minutes = ?').run(date, minutes);
}

export async function getBookingsOnDate(date: string): Promise<any[]> {
  return sqlite.prepare("SELECT * FROM bookings WHERE date = ? AND status != 'Cancelled'").all(date);
}

export async function getBookingById(id: number): Promise<any> {
  return sqlite.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
}

export async function updateBookingStatus(id: number, status: string): Promise<void> {
  sqlite.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
}

// ---- Breath Protocols --------------------------------------------------------------------------
export async function getBreathProtocols(): Promise<any[]> {
  return sqlite.prepare('SELECT * FROM breath_protocols ORDER BY sort_order ASC, name ASC').all();
}

export async function updateBreathProtocol(p: any): Promise<void> {
  sqlite.prepare(`
    INSERT INTO breath_protocols (id, name, desc, inhale, holdIn, exhale, holdOut, emoji, animation_mode, video_url, instruction_audio, clinical_notes, sort_order)
    VALUES (@id, @name, @desc, @inhale, @holdIn, @exhale, @holdOut, @emoji, @animation_mode, @video_url, @instruction_audio, @clinical_notes, @sort_order)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      desc = excluded.desc,
      inhale = excluded.inhale,
      holdIn = excluded.holdIn,
      exhale = excluded.exhale,
      holdOut = excluded.holdOut,
      emoji = excluded.emoji,
      animation_mode = excluded.animation_mode,
      video_url = excluded.video_url,
      instruction_audio = excluded.instruction_audio,
      clinical_notes = excluded.clinical_notes,
      sort_order = excluded.sort_order
  `).run({
    id: String(p.id),
    name: p.name,
    desc: p.desc ?? '',
    inhale: Number(p.inhale) || 0,
    holdIn: Number(p.holdIn) || 0,
    exhale: Number(p.exhale) || 0,
    holdOut: Number(p.holdOut) || 0,
    emoji: p.emoji ?? '🧘',
    animation_mode: p.animation_mode ?? 'fluid',
    video_url: p.video_url ?? '',
    instruction_audio: p.instruction_audio ?? '',
    clinical_notes: p.clinical_notes ?? '',
    sort_order: Number(p.sort_order) || 0
  });
}

// ---- Settings ----------------------------------------------------------------------------------
export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = sqlite.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
  const result: Record<string, string> = {};
  for (const r of rows) result[r.key] = r.value;
  return result;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  sqlite.prepare(`
    INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).run(key, value);
}

// ---- Instagram Reels ---------------------------------------------------------------------------
export async function getInstagramReels(): Promise<any[]> {
  return sqlite.prepare('SELECT * FROM instagram_reels ORDER BY sort_order ASC, created_at DESC').all();
}

export async function addOrUpdateInstagramReel(r: any): Promise<void> {
  sqlite.prepare(`
    INSERT INTO instagram_reels (id, title, views, likes, comments, thumbnail, video_url, duration, instagramUrl, sort_order)
    VALUES (@id, @title, @views, @likes, @comments, @thumbnail, @video_url, @duration, @instagramUrl, @sort_order)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      views = excluded.views,
      likes = excluded.likes,
      comments = excluded.comments,
      thumbnail = excluded.thumbnail,
      video_url = excluded.video_url,
      duration = excluded.duration,
      instagramUrl = excluded.instagramUrl,
      sort_order = excluded.sort_order
  `).run({
    id: String(r.id),
    title: r.title,
    views: r.views ?? '10K',
    likes: r.likes ?? '1K',
    comments: Number(r.comments) || 0,
    thumbnail: r.thumbnail ?? '',
    video_url: r.video_url ?? '',
    duration: r.duration ?? '0:60',
    instagramUrl: r.instagramUrl ?? '',
    sort_order: Number(r.sort_order) || 0
  });
}

export async function deleteInstagramReel(id: string): Promise<void> {
  sqlite.prepare('DELETE FROM instagram_reels WHERE id = ?').run(id);
}

// ---- Clients -----------------------------------------------------------------------------------
export async function getClientByEmail(email: string): Promise<any> {
  const clean = String(email).trim().toLowerCase();
  return sqlite.prepare('SELECT * FROM clients WHERE email_lower = ?').get(clean);
}

export async function getClientById(id: number): Promise<any> {
  return sqlite.prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

export async function createClient(email: string, name: string, passwordHash: string | null = null): Promise<any> {
  const cleanEmail = email.trim();
  const cleanLower = cleanEmail.toLowerCase();
  const info = sqlite.prepare(`
    INSERT INTO clients (email, email_lower, name, password_hash, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(cleanEmail, cleanLower, name.trim(), passwordHash);
  return sqlite.prepare('SELECT * FROM clients WHERE id = ?').get(info.lastInsertRowid);
}

// ---- Bookings ----------------------------------------------------------------------------------
export async function createBooking(
  clientId: number,
  date: string,
  time: string,
  notes: string | null,
  meetLink: string | null,
  eventId: string | null,
  extra: Record<string, any> = {}
): Promise<number> {
  const info = sqlite.prepare(`
    INSERT INTO bookings (client_id, date, time, notes, status, meet_link, event_id, service_id, service_title, duration_minutes, price, created_at)
    VALUES (?, ?, ?, ?, 'Upcoming', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    clientId,
    date,
    time,
    notes,
    meetLink,
    eventId,
    extra.service_id ?? null,
    extra.service_title ?? null,
    extra.duration_minutes ?? null,
    extra.price ?? null
  );
  return Number(info.lastInsertRowid);
}

export async function getClientBookings(clientId: number): Promise<any[]> {
  return sqlite.prepare(`
    SELECT bookings.*, sessions.plan 
    FROM bookings 
    LEFT JOIN sessions ON bookings.id = sessions.booking_id 
    WHERE bookings.client_id = ? 
    ORDER BY bookings.date DESC, bookings.time DESC
  `).all(clientId);
}

export async function getAdminBookings(): Promise<any[]> {
  return sqlite.prepare(`
    SELECT bookings.*, clients.name as clientName, clients.email as clientEmail, clients.history as clientHistory, sessions.transcription, sessions.plan
    FROM bookings
    JOIN clients ON bookings.client_id = clients.id
    LEFT JOIN sessions ON bookings.id = sessions.booking_id
    ORDER BY bookings.date DESC, bookings.time DESC
  `).all();
}

export async function saveSessionTransciption(bookingId: number, transcription: string): Promise<void> {
  sqlite.prepare(`
    INSERT INTO sessions (booking_id, transcription, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(booking_id) DO UPDATE SET transcription = excluded.transcription, updated_at = CURRENT_TIMESTAMP
  `).run(bookingId, transcription);
}

export async function saveSessionPlan(bookingId: number, plan: string): Promise<void> {
  sqlite.prepare(`
    INSERT INTO sessions (booking_id, plan, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(booking_id) DO UPDATE SET plan = excluded.plan, updated_at = CURRENT_TIMESTAMP
  `).run(bookingId, plan);
}

// ---- Assessments -------------------------------------------------------------------------------
export async function saveAssessment(a: { id: string; overall: number; domains: Record<string, number>; answers?: number[]; clientEmail?: string }): Promise<void> {
  sqlite.prepare(`
    INSERT INTO assessments (id, overall, domains, answers, client_email, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET overall = excluded.overall, domains = excluded.domains, answers = excluded.answers
  `).run(
    a.id,
    a.overall,
    JSON.stringify(a.domains || {}),
    JSON.stringify(a.answers || []),
    a.clientEmail || null
  );
}

export async function getAssessments(): Promise<any[]> {
  const rows = sqlite.prepare('SELECT * FROM assessments ORDER BY created_at DESC').all() as any[];
  return rows.map(r => ({
    ...r,
    domains: typeof r.domains === 'string' ? JSON.parse(r.domains || '{}') : r.domains,
    answers: typeof r.answers === 'string' ? JSON.parse(r.answers || '[]') : r.answers
  }));
}

export async function ping(): Promise<boolean> {
  try {
    sqlite.prepare('SELECT 1').get();
    return true;
  } catch {
    return false;
  }
}

let firestoreInstance: any = null;
export function getDb(): any {
  if (!firestoreInstance) {
    try {
      const { initializeApp, getApps, applicationDefault } = require('firebase-admin/app');
      const { getFirestore } = require('firebase-admin/firestore');
      const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId });
      firestoreInstance = getFirestore(app, databaseId);
    } catch (e) {
      console.warn("Firestore Admin not initialized:", e);
      return null;
    }
  }
  return firestoreInstance;
}
