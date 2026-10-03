import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// All data lives in Cloud Firestore and is only ever touched by this server (firebase-admin),
// never directly by the browser. Row shapes match the old SQLite tables so the rest of the app
// is unchanged. Numeric ids for clients/bookings come from a counter document.

function firebaseConfig(): any {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
  } catch {
    return {};
  }
}

const cfg = firebaseConfig();
export const projectId: string = process.env.FIREBASE_PROJECT_ID || cfg.projectId || '';
export const databaseId: string = process.env.FIRESTORE_DATABASE_ID || cfg.firestoreDatabaseId || '(default)';

let firestore: Firestore | null = null;
export function getDb(): Firestore {
  if (!firestore) {
    const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId });
    firestore = getFirestore(app, databaseId);
  }
  return firestore;
}

const col = (name: string) => getDb().collection(name);
const nowIso = () => new Date().toISOString();

async function nextId(counter: string): Promise<number> {
  const ref = col('counters').doc(counter);
  return getDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = ((snap.exists ? snap.data()!.value : 0) as number) + 1;
    tx.set(ref, { value: next });
    return next;
  });
}

// ---- Seed data (only written when missing) ------------------------------------------------------
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

export async function init() {
  const db = getDb();
  const batch = db.batch();
  let writes = 0;

  const protoSnap = await col('breath_protocols').get();
  const haveProtos = new Set(protoSnap.docs.map((d) => d.id));
  for (const p of seedProtocols) {
    if (!haveProtos.has(p.id)) { batch.set(col('breath_protocols').doc(p.id), p); writes++; }
  }

  const settingsSnap = await col('site_settings').limit(1).get();
  if (settingsSnap.empty) {
    for (const [key, value] of Object.entries(defaultSettings)) {
      batch.set(col('site_settings').doc(key), { key, value, updated_at: nowIso() });
      writes++;
    }
  }

  const reelsSnap = await col('instagram_reels').limit(1).get();
  if (reelsSnap.empty) {
    for (const r of initialReels) {
      batch.set(col('instagram_reels').doc(r.id), { ...r, created_at: nowIso() });
      writes++;
    }
  }

  if (writes) await batch.commit();
}

// ---- Site content -----------------------------------------------------------------------------
export async function getAllSettings(): Promise<Record<string, string>> {
  const snap = await col('site_settings').get();
  const result: Record<string, string> = {};
  for (const d of snap.docs) result[d.id] = String(d.data().value ?? '');
  return result;
}

export async function updateSetting(key: string, value: string) {
  await col('site_settings').doc(key).set({ key, value, updated_at: nowIso() }, { merge: true });
}

const bySort = (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0);

export async function getBreathProtocols(): Promise<any[]> {
  const snap = await col('breath_protocols').get();
  return snap.docs.map((d) => d.data()).sort((a, b) => bySort(a, b) || String(a.name).localeCompare(String(b.name)));
}

export async function updateBreathProtocol(p: any) {
  await col('breath_protocols').doc(String(p.id)).set({
    id: String(p.id),
    name: p.name,
    desc: p.desc ?? '',
    inhale: Number(p.inhale) || 0,
    holdIn: Number(p.holdIn) || 0,
    exhale: Number(p.exhale) || 0,
    holdOut: Number(p.holdOut) || 0,
    emoji: p.emoji ?? '',
    animation_mode: p.animation_mode ?? 'fluid',
    video_url: p.video_url ?? '',
    instruction_audio: p.instruction_audio ?? '',
    clinical_notes: p.clinical_notes ?? '',
    sort_order: Number(p.sort_order) || 0,
  }, { merge: true });
}

export async function getInstagramReels(): Promise<any[]> {
  const snap = await col('instagram_reels').get();
  return snap.docs.map((d) => d.data()).sort((a, b) => bySort(a, b) || String(b.created_at).localeCompare(String(a.created_at)));
}

export async function addOrUpdateInstagramReel(r: any) {
  await col('instagram_reels').doc(String(r.id)).set({
    id: String(r.id),
    title: r.title,
    views: r.views ?? '10K',
    likes: r.likes ?? '1K',
    comments: Number(r.comments) || 0,
    thumbnail: r.thumbnail ?? '',
    video_url: r.video_url ?? '',
    duration: r.duration ?? '0:60',
    instagramUrl: r.instagramUrl ?? '',
    sort_order: Number(r.sort_order) || 0,
    created_at: r.created_at ?? nowIso(),
  }, { merge: true });
}

export async function deleteInstagramReel(id: string) {
  await col('instagram_reels').doc(String(id)).delete();
}

// ---- Clients & bookings -------------------------------------------------------------------------
export async function getClientByEmail(email: string): Promise<any> {
  const snap = await col('clients').where('email_lower', '==', String(email).trim().toLowerCase()).limit(1).get();
  return snap.empty ? undefined : snap.docs[0].data();
}

export async function getClientById(id: number): Promise<any> {
  const snap = await col('clients').doc(String(id)).get();
  return snap.exists ? snap.data() : undefined;
}

export async function createClient(email: string, name: string, passwordHash: string | null = null): Promise<any> {
  const id = await nextId('clients');
  const client = {
    id, email, email_lower: email.trim().toLowerCase(), name,
    history: null, password_hash: passwordHash, created_at: nowIso(),
  };
  await col('clients').doc(String(id)).set(client);
  return client;
}

export async function createBooking(clientId: number, date: string, time: string, notes: string | null, meetLink: string | null, eventId: string | null) {
  const id = await nextId('bookings');
  await col('bookings').doc(String(id)).set({
    id, client_id: clientId, date, time, notes, status: 'Upcoming',
    meet_link: meetLink, event_id: eventId, created_at: nowIso(),
  });
  return id;
}

const newestFirst = (a: any, b: any) => String(b.date).localeCompare(String(a.date)) || String(b.time).localeCompare(String(a.time));

export async function getClientBookings(clientId: number): Promise<any[]> {
  const snap = await col('bookings').where('client_id', '==', Number(clientId)).get();
  const rows = snap.docs.map((d) => d.data()).sort(newestFirst);
  const sessions = await Promise.all(rows.map((b) => col('sessions').doc(String(b.id)).get()));
  return rows.map((b, i) => ({ ...b, plan: sessions[i].exists ? sessions[i].data()!.plan ?? null : null }));
}

export async function getAdminBookings(): Promise<any[]> {
  const [bookings, clients, sessions] = await Promise.all([
    col('bookings').get(), col('clients').get(), col('sessions').get(),
  ]);
  const clientMap = new Map(clients.docs.map((d) => [d.id, d.data()]));
  const sessionMap = new Map(sessions.docs.map((d) => [d.id, d.data()]));
  return bookings.docs
    .map((d) => d.data())
    .filter((b) => clientMap.has(String(b.client_id)))
    .sort(newestFirst)
    .map((b) => {
      const c = clientMap.get(String(b.client_id))!;
      const s = sessionMap.get(String(b.id));
      return {
        ...b,
        clientName: c.name, clientEmail: c.email, clientHistory: c.history ?? null,
        transcription: s?.transcription ?? null, plan: s?.plan ?? null,
      };
    });
}

// Session notes are stored one document per booking (document id = booking id).
export async function saveSessionTransciption(bookingId: number, transcription: string) {
  await col('sessions').doc(String(bookingId)).set({ booking_id: Number(bookingId), transcription, updated_at: nowIso() }, { merge: true });
}

export async function saveSessionPlan(bookingId: number, plan: string) {
  await col('sessions').doc(String(bookingId)).set({ booking_id: Number(bookingId), plan, updated_at: nowIso() }, { merge: true });
}

export async function updateBookingStatus(bookingId: number, status: string) {
  await col('bookings').doc(String(bookingId)).update({ status });
}

// ---- Assessments --------------------------------------------------------------------------------
export async function saveAssessment(a: { id: string; overall: number; domains: Record<string, number>; answers?: number[]; clientEmail?: string }) {
  await col('assessments').doc(a.id).set({
    id: a.id, overall: a.overall, domains: a.domains, answers: a.answers || [],
    client_email: a.clientEmail || null, created_at: nowIso(),
  }, { merge: true });
}

export async function getAssessments(): Promise<any[]> {
  const snap = await col('assessments').get();
  return snap.docs.map((d) => d.data()).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

/** Quick connectivity check for the admin dashboard. */
export async function ping(): Promise<boolean> {
  try {
    await col('counters').limit(1).get();
    return true;
  } catch {
    return false;
  }
}
