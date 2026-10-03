import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocFromServer 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if configured
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId.length > 0
    ? firebaseConfig.firestoreDatabaseId 
    : undefined
);

// Connection test as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore connection check: client is offline or network restricted.");
      return false;
    }
    // Any other error (like permission-denied on /test/connection) means network connected to Firestore!
    return true;
  }
}

// --------------------------------------------------------------------------
// CLIENTS
// --------------------------------------------------------------------------
export interface FirestoreClient {
  id: string;
  email: string;
  name: string;
  history?: string;
  createdAt: string;
}

export async function saveClientToFirestore(client: FirestoreClient) {
  try {
    const ref = doc(db, "clients", String(client.id));
    await setDoc(ref, {
      id: String(client.id),
      email: client.email.toLowerCase(),
      name: client.name,
      history: client.history || "",
      createdAt: client.createdAt || new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Firestore saveClient error:", err);
    return false;
  }
}

export async function getClientFromFirestore(clientId: string): Promise<FirestoreClient | null> {
  try {
    const snap = await getDoc(doc(db, "clients", String(clientId)));
    if (snap.exists()) {
      return snap.data() as FirestoreClient;
    }
    return null;
  } catch (err) {
    console.error("Firestore getClient error:", err);
    return null;
  }
}

// --------------------------------------------------------------------------
// BOOKINGS
// --------------------------------------------------------------------------
export interface FirestoreBooking {
  id: string;
  clientId: string;
  clientEmail?: string;
  clientName?: string;
  date: string;
  time: string;
  notes?: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  meetLink?: string;
  eventId?: string;
  createdAt: string;
}

export async function saveBookingToFirestore(booking: FirestoreBooking) {
  try {
    const ref = doc(db, "bookings", String(booking.id));
    await setDoc(ref, {
      id: String(booking.id),
      clientId: String(booking.clientId),
      clientEmail: booking.clientEmail || "",
      clientName: booking.clientName || "",
      date: booking.date,
      time: booking.time,
      notes: booking.notes || "",
      status: booking.status || "Upcoming",
      meetLink: booking.meetLink || "",
      eventId: booking.eventId || "",
      createdAt: booking.createdAt || new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Firestore saveBooking error:", err);
    return false;
  }
}

export async function getBookingsFromFirestore(clientId?: string): Promise<FirestoreBooking[]> {
  try {
    let q = query(collection(db, "bookings"));
    if (clientId) {
      q = query(collection(db, "bookings"), where("clientId", "==", String(clientId)));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as FirestoreBooking);
  } catch (err) {
    console.error("Firestore getBookings error:", err);
    return [];
  }
}

// --------------------------------------------------------------------------
// CLINICAL SESSIONS
// --------------------------------------------------------------------------
export interface FirestoreSession {
  id: string;
  bookingId: string;
  transcription?: string;
  plan?: string;
  createdAt: string;
}

export async function saveSessionToFirestore(session: FirestoreSession) {
  try {
    const ref = doc(db, "sessions", String(session.id || session.bookingId));
    await setDoc(ref, {
      id: String(session.id || session.bookingId),
      bookingId: String(session.bookingId),
      transcription: session.transcription || "",
      plan: session.plan || "",
      createdAt: session.createdAt || new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Firestore saveSession error:", err);
    return false;
  }
}

// --------------------------------------------------------------------------
// BREATH PROTOCOLS
// --------------------------------------------------------------------------
export interface FirestoreBreathProtocol {
  id: string;
  name: string;
  desc: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  emoji: string;
  animationMode: string;
  videoUrl?: string;
  instructionAudio?: string;
  clinicalNotes?: string;
  sortOrder: number;
}

export async function saveBreathProtocolToFirestore(p: FirestoreBreathProtocol) {
  try {
    const ref = doc(db, "breath_protocols", String(p.id));
    await setDoc(ref, {
      id: String(p.id),
      name: p.name,
      desc: p.desc,
      inhale: Number(p.inhale),
      holdIn: Number(p.holdIn),
      exhale: Number(p.exhale),
      holdOut: Number(p.holdOut),
      emoji: p.emoji || "🧘",
      animationMode: p.animationMode || "fluid",
      videoUrl: p.videoUrl || "",
      instructionAudio: p.instructionAudio || "",
      clinicalNotes: p.clinicalNotes || "",
      sortOrder: Number(p.sortOrder || 0)
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Firestore saveBreathProtocol error:", err);
    return false;
  }
}

export async function getBreathProtocolsFromFirestore(): Promise<FirestoreBreathProtocol[]> {
  try {
    const snap = await getDocs(collection(db, "breath_protocols"));
    const protocols = snap.docs.map(d => d.data() as FirestoreBreathProtocol);
    return protocols.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (err) {
    console.error("Firestore getBreathProtocols error:", err);
    return [];
  }
}

// --------------------------------------------------------------------------
// INSTAGRAM REELS
// --------------------------------------------------------------------------
export interface FirestoreReel {
  id: string;
  title: string;
  views: string;
  likes: string;
  comments: number;
  thumbnail: string;
  videoUrl?: string;
  duration?: string;
  instagramUrl: string;
  sortOrder: number;
  createdAt?: string;
}

export async function saveReelToFirestore(reel: FirestoreReel) {
  try {
    const ref = doc(db, "instagram_reels", String(reel.id));
    await setDoc(ref, {
      id: String(reel.id),
      title: reel.title,
      views: reel.views || "10K",
      likes: reel.likes || "1K",
      comments: Number(reel.comments || 0),
      thumbnail: reel.thumbnail || "",
      videoUrl: reel.videoUrl || "",
      duration: reel.duration || "0:60",
      instagramUrl: reel.instagramUrl || "",
      sortOrder: Number(reel.sortOrder || 0),
      createdAt: reel.createdAt || new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Firestore saveReel error:", err);
    return false;
  }
}

export async function getReelsFromFirestore(): Promise<FirestoreReel[]> {
  try {
    const snap = await getDocs(collection(db, "instagram_reels"));
    const reels = snap.docs.map(d => d.data() as FirestoreReel);
    return reels.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (err) {
    console.error("Firestore getReels error:", err);
    return [];
  }
}

// --------------------------------------------------------------------------
// SITE SETTINGS
// --------------------------------------------------------------------------
export async function saveSiteSettingToFirestore(key: string, value: string) {
  try {
    const ref = doc(db, "site_settings", String(key));
    await setDoc(ref, {
      key: String(key),
      value: String(value),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Firestore saveSiteSetting error:", err);
    return false;
  }
}

export async function getSiteSettingFromFirestore(key: string): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, "site_settings", String(key)));
    if (snap.exists()) {
      return snap.data().value || null;
    }
    return null;
  } catch (err) {
    console.error("Firestore getSiteSetting error:", err);
    return null;
  }
}

// --------------------------------------------------------------------------
// HEALTH ASSESSMENTS
// --------------------------------------------------------------------------
export interface FirestoreAssessment {
  id: string;
  overall: number;
  domains: Record<string, number>;
  answers?: number[];
  clientEmail?: string;
  clientName?: string;
  createdAt: string;
}

export async function saveAssessmentToFirestore(assessment: FirestoreAssessment) {
  try {
    const ref = doc(db, "assessments", String(assessment.id));
    await setDoc(ref, {
      id: String(assessment.id),
      overall: Number(assessment.overall),
      domains: assessment.domains || {},
      answers: assessment.answers || [],
      clientEmail: assessment.clientEmail || "",
      clientName: assessment.clientName || "",
      createdAt: assessment.createdAt || new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Firestore saveAssessment error:", err);
    return false;
  }
}

export async function getAssessmentsFromFirestore(): Promise<FirestoreAssessment[]> {
  try {
    const snap = await getDocs(collection(db, "assessments"));
    return snap.docs.map(d => d.data() as FirestoreAssessment);
  } catch (err) {
    console.error("Firestore getAssessments error:", err);
    return [];
  }
}
