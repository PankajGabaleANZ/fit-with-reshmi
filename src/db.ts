import Database from 'better-sqlite3';
import path from 'path';
import { 
  saveClientToFirestore, 
  saveBookingToFirestore, 
  saveSessionToFirestore, 
  saveBreathProtocolToFirestore, 
  saveReelToFirestore, 
  saveSiteSettingToFirestore,
  saveAssessmentToFirestore,
  testConnection 
} from './lib/firestoreService.js';

const dbPath = path.join(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    history TEXT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER UNIQUE,
    transcription TEXT,
    plan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES bookings(id)
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// Seed or update breath protocols with dedicated locally stored ambient video loops
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

const insertStmt = db.prepare(`
  INSERT INTO breath_protocols (id, name, desc, inhale, holdIn, exhale, holdOut, emoji, animation_mode, video_url, instruction_audio, clinical_notes, sort_order)
  VALUES (@id, @name, @desc, @inhale, @holdIn, @exhale, @holdOut, @emoji, @animation_mode, @video_url, @instruction_audio, @clinical_notes, @sort_order)
  ON CONFLICT(id) DO UPDATE SET
    video_url = excluded.video_url,
    animation_mode = excluded.animation_mode
`);

for (const proto of seedProtocols) {
  insertStmt.run(proto);
}

// Seed default site settings if empty
const settingsCount = (db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as any)?.count || 0;
if (settingsCount === 0) {
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

  const insertSetting = db.prepare(`
    INSERT INTO site_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);

  for (const [k, v] of Object.entries(defaultSettings)) {
    insertSetting.run(k, v);
  }
}

// Seed default Instagram reels if empty
const reelsCount = (db.prepare('SELECT COUNT(*) as count FROM instagram_reels').get() as any)?.count || 0;
if (reelsCount === 0) {
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

  const insertReelStmt = db.prepare(`
    INSERT INTO instagram_reels (id, title, views, likes, comments, thumbnail, video_url, duration, instagramUrl, sort_order)
    VALUES (@id, @title, @views, @likes, @comments, @thumbnail, @video_url, @duration, @instagramUrl, @sort_order)
  `);

  for (const r of initialReels) {
    insertReelStmt.run(r);
  }
}

export function getAllSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export function updateSetting(key: string, value: string) {
  db.prepare(`
    INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).run(key, value);
  saveSiteSettingToFirestore(key, value).catch(e => console.error("Firestore setting sync:", e));
}

export function getBreathProtocols(): any[] {
  return db.prepare('SELECT * FROM breath_protocols ORDER BY sort_order ASC, name ASC').all();
}

export function getInstagramReels(): any[] {
  return db.prepare('SELECT * FROM instagram_reels ORDER BY sort_order ASC, created_at DESC').all();
}

export function addOrUpdateInstagramReel(reel: any) {
  db.prepare(`
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
  `).run(reel);

  saveReelToFirestore({
    id: String(reel.id),
    title: reel.title,
    views: reel.views || '10K',
    likes: reel.likes || '1K',
    comments: Number(reel.comments || 0),
    thumbnail: reel.thumbnail || '',
    videoUrl: reel.video_url || '',
    duration: reel.duration || '0:60',
    instagramUrl: reel.instagramUrl || '',
    sortOrder: Number(reel.sort_order || 0),
    createdAt: reel.created_at || new Date().toISOString()
  }).catch(e => console.error("Firestore reel sync:", e));
}

export function deleteInstagramReel(id: string) {
  db.prepare('DELETE FROM instagram_reels WHERE id = ?').run(id);
}

export function updateBreathProtocol(protocol: any) {
  db.prepare(`
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
  `).run(protocol);

  saveBreathProtocolToFirestore({
    id: String(protocol.id),
    name: protocol.name,
    desc: protocol.desc,
    inhale: Number(protocol.inhale),
    holdIn: Number(protocol.holdIn),
    exhale: Number(protocol.exhale),
    holdOut: Number(protocol.holdOut),
    emoji: protocol.emoji || '🧘',
    animationMode: protocol.animation_mode || 'fluid',
    videoUrl: protocol.video_url || '',
    instructionAudio: protocol.instruction_audio || '',
    clinicalNotes: protocol.clinical_notes || '',
    sortOrder: Number(protocol.sort_order || 0)
  }).catch(e => console.error("Firestore protocol sync:", e));
}

// Migration: add password storage to clients created before client logins were secured.
if (!(db.prepare('PRAGMA table_info(clients)').all() as any[]).some((c) => c.name === 'password_hash')) {
  db.exec('ALTER TABLE clients ADD COLUMN password_hash TEXT');
}

export function getClientByEmail(email: string): any {
  return db.prepare('SELECT * FROM clients WHERE email = ? COLLATE NOCASE').get(email);
}

export function createClient(email: string, name: string, passwordHash: string | null = null): any {
  const result = db.prepare('INSERT INTO clients (email, name, password_hash) VALUES (?, ?, ?)').run(email, name, passwordHash);
  const client: any = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
  if (client) {
    saveClientToFirestore({
      id: String(client.id),
      email: client.email,
      name: client.name,
      history: client.history || '',
      createdAt: client.created_at || new Date().toISOString()
    }).catch(e => console.error("Firestore client sync:", e));
  }
  return client;
}

export function getClientById(id: number): any {
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

export function createBooking(clientId: number, date: string, time: string, notes: string | null, meetLink: string | null, eventId: string | null) {
  const result = db.prepare(`
    INSERT INTO bookings (client_id, date, time, notes, meet_link, event_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(clientId, date, time, notes, meetLink, eventId);
  const bookingId = Number(result.lastInsertRowid);
  const client: any = getClientById(clientId);
  saveBookingToFirestore({
    id: String(bookingId),
    clientId: String(clientId),
    clientEmail: client?.email || '',
    clientName: client?.name || '',
    date,
    time,
    notes: notes || '',
    status: 'Upcoming',
    meetLink: meetLink || '',
    eventId: eventId || '',
    createdAt: new Date().toISOString()
  }).catch(e => console.error("Firestore booking sync:", e));
  return bookingId;
}

export function getClientBookings(clientId: number) {
  return db.prepare(`
    SELECT bookings.*, sessions.plan 
    FROM bookings 
    LEFT JOIN sessions ON bookings.id = sessions.booking_id 
    WHERE bookings.client_id = ? 
    ORDER BY bookings.date DESC
  `).all(clientId);
}

export function getAdminBookings() {
  return db.prepare(`
    SELECT bookings.*, clients.name as clientName, clients.email as clientEmail, clients.history as clientHistory, sessions.transcription, sessions.plan
    FROM bookings
    JOIN clients ON bookings.client_id = clients.id
    LEFT JOIN sessions ON bookings.id = sessions.booking_id
    ORDER BY bookings.date DESC, bookings.time DESC
  `).all();
}

export function saveSessionTransciption(bookingId: number, transcription: string) {
  db.prepare(`
    INSERT INTO sessions (booking_id, transcription) VALUES (?, ?)
    ON CONFLICT(booking_id) DO UPDATE SET transcription = excluded.transcription
  `).run(bookingId, transcription);
  saveSessionToFirestore({
    id: String(bookingId),
    bookingId: String(bookingId),
    transcription,
    createdAt: new Date().toISOString()
  }).catch(e => console.error("Firestore session transcription sync:", e));
}

export function saveSessionPlan(bookingId: number, plan: string) {
  db.prepare(`
    INSERT INTO sessions (booking_id, plan) VALUES (?, ?)
    ON CONFLICT(booking_id) DO UPDATE SET plan = excluded.plan;
  `).run(bookingId, plan);
  saveSessionToFirestore({
    id: String(bookingId),
    bookingId: String(bookingId),
    plan,
    createdAt: new Date().toISOString()
  }).catch(e => console.error("Firestore session plan sync:", e));
}

export function updateBookingStatus(bookingId: number, status: string) {
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, bookingId);
}

export function saveAssessment(assessment: { id: string; overall: number; domains: Record<string, number>; answers?: number[]; clientEmail?: string }) {
  const domainsJson = JSON.stringify(assessment.domains);
  const answersJson = JSON.stringify(assessment.answers || []);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO assessments (id, overall, domains, answers, client_email, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET overall = excluded.overall, domains = excluded.domains, answers = excluded.answers
  `).run(assessment.id, assessment.overall, domainsJson, answersJson, assessment.clientEmail || null, now);

  saveAssessmentToFirestore({
    id: assessment.id,
    overall: assessment.overall,
    domains: assessment.domains,
    answers: assessment.answers,
    clientEmail: assessment.clientEmail,
    createdAt: now
  }).catch(e => console.error("Firestore assessment sync error:", e));
}

export function getAssessments(): any[] {
  return db.prepare('SELECT * FROM assessments ORDER BY created_at DESC').all();
}

// Batch synchronizer to populate Cloud Firestore
export async function syncAllToFirestore() {
  try {
    const isOnline = await testConnection();
    if (!isOnline) {
      console.log("Firestore connection test completed (offline/mock)");
      return;
    }
    console.log("Synchronizing data to Cloud Firestore...");

    // 1. Sync breath protocols
    const protocols = getBreathProtocols();
    for (const p of protocols) {
      await saveBreathProtocolToFirestore({
        id: String(p.id),
        name: p.name,
        desc: p.desc,
        inhale: p.inhale,
        holdIn: p.holdIn,
        exhale: p.exhale,
        holdOut: p.holdOut,
        emoji: p.emoji,
        animationMode: p.animation_mode,
        videoUrl: p.video_url,
        instructionAudio: p.instruction_audio,
        clinicalNotes: p.clinical_notes,
        sortOrder: p.sort_order
      });
    }

    // 2. Sync reels
    const reels = getInstagramReels();
    for (const r of reels) {
      await saveReelToFirestore({
        id: String(r.id),
        title: r.title,
        views: r.views,
        likes: r.likes,
        comments: r.comments,
        thumbnail: r.thumbnail,
        videoUrl: r.video_url,
        duration: r.duration,
        instagramUrl: r.instagramUrl,
        sortOrder: r.sort_order,
        createdAt: r.created_at
      });
    }

    // 3. Sync clients
    const clients: any[] = db.prepare('SELECT * FROM clients').all();
    for (const c of clients) {
      await saveClientToFirestore({
        id: String(c.id),
        email: c.email,
        name: c.name,
        history: c.history || '',
        createdAt: c.created_at || new Date().toISOString()
      });
    }

    // 4. Sync bookings
    const bookings: any[] = db.prepare(`
      SELECT bookings.*, clients.email as clientEmail, clients.name as clientName 
      FROM bookings 
      LEFT JOIN clients ON bookings.client_id = clients.id
    `).all();
    for (const b of bookings) {
      await saveBookingToFirestore({
        id: String(b.id),
        clientId: String(b.client_id),
        clientEmail: b.clientEmail || '',
        clientName: b.clientName || '',
        date: b.date,
        time: b.time,
        notes: b.notes || '',
        status: b.status || 'Upcoming',
        meetLink: b.meet_link || '',
        eventId: b.event_id || '',
        createdAt: b.created_at || new Date().toISOString()
      });
    }

    // 5. Sync assessments
    const assessments: any[] = db.prepare('SELECT * FROM assessments').all();
    for (const a of assessments) {
      try {
        await saveAssessmentToFirestore({
          id: String(a.id),
          overall: Number(a.overall),
          domains: typeof a.domains === 'string' ? JSON.parse(a.domains) : a.domains,
          answers: typeof a.answers === 'string' ? JSON.parse(a.answers) : [],
          clientEmail: a.client_email || '',
          createdAt: a.created_at || new Date().toISOString()
        });
      } catch (err) {
        console.error("Sync single assessment error:", err);
      }
    }

    console.log("Cloud Firestore data sync successfully completed.");
  } catch (err) {
    console.error("Cloud Firestore initial sync error:", err);
  }
}
