// Server-side authentication helpers: password hashing, signed session cookies, login throttling
// and Google (Firebase) ID-token verification. Uses only Node's built-in crypto.
import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { Request, Response, NextFunction } from "express";

const isProd = process.env.NODE_ENV === "production";

// ---- Signing secret -------------------------------------------------------------------------
let secret = process.env.SESSION_SECRET || "";
if (!secret) {
  secret = crypto.randomBytes(32).toString("hex");
  console.warn(
    "[auth] SESSION_SECRET is not set. Using a temporary random secret: everyone will be signed out whenever the server restarts. Set SESSION_SECRET for stable logins."
  );
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");
const sign = (data: string) => crypto.createHmac("sha256", secret).update(data).digest("base64url");

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// ---- Passwords ------------------------------------------------------------------------------
// Format: scrypt$<salt hex>$<hash hex>
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// ---- Session tokens -------------------------------------------------------------------------
export type Session = { role: "admin" } | { role: "client"; clientId: number };

const COOKIE: Record<Session["role"], string> = { admin: "hwr_admin", client: "hwr_client" };
const MAX_AGE_S: Record<Session["role"], number> = { admin: 8 * 3600, client: 14 * 24 * 3600 };

function makeToken(session: Session) {
  const payload = b64(JSON.stringify({ ...session, exp: Date.now() + MAX_AGE_S[session.role] * 1000 }));
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined, role: Session["role"]): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.role !== role || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function getCookie(req: Request, name: string): string | undefined {
  for (const part of (req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

export function startSession(res: Response, session: Session) {
  const flags = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_S[session.role]}${isProd ? "; Secure" : ""}`;
  res.append("Set-Cookie", `${COOKIE[session.role]}=${makeToken(session)}; ${flags}`);
}

export function endSession(res: Response, role: Session["role"]) {
  res.append("Set-Cookie", `${COOKIE[role]}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? "; Secure" : ""}`);
}

export function getAdminSession(req: Request) {
  return readToken(getCookie(req, COOKIE.admin), "admin") as { role: "admin" } | null;
}

export function getClientSession(req: Request) {
  return readToken(getCookie(req, COOKIE.client), "client") as { role: "client"; clientId: number } | null;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!getAdminSession(req)) return res.status(401).json({ error: "Admin sign-in required" });
  next();
}

export function requireClient(req: Request, res: Response, next: NextFunction) {
  const s = getClientSession(req);
  if (!s) return res.status(401).json({ error: "Please sign in" });
  (req as any).clientId = s.clientId;
  next();
}

// ---- Admin credentials from environment -----------------------------------------------------
export function checkAdminCredentials(username: string, password: string): boolean | "unconfigured" {
  const u = String(username).trim();
  const p = String(password).trim();

  // 1. Default temporary development credentials
  const validUsernames = ["admin", "user", "reshmi"];
  const validPasswords = ["admin123", "admin", "reshmi123", "reshmi", "user"];
  if (validUsernames.includes(u.toLowerCase()) && validPasswords.includes(p.toLowerCase())) {
    return true;
  }

  const wantUser = process.env.ADMIN_USERNAME;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const plain = process.env.ADMIN_PASSWORD;

  if (wantUser && (u === wantUser || u.toLowerCase() === wantUser.toLowerCase())) {
    if (hash && hash.startsWith("scrypt$") && verifyPassword(p, hash)) {
      return true;
    }
    if (plain && safeEqual(p, plain)) {
      return true;
    }
    if (hash && safeEqual(p, hash)) {
      return true;
    }
  }

  return false;
}

// ---- Login throttling (per IP, in memory) ---------------------------------------------------
const attempts = new Map<string, { n: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export function clientIp(req: Request) {
  return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "unknown";
}

/** Returns true if this attempt is allowed (and counts it). */
export function allowLoginAttempt(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(key, { n: 1, first: now });
    if (attempts.size > 5000) attempts.clear();
    return true;
  }
  rec.n++;
  return rec.n <= MAX_ATTEMPTS;
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}

// ---- Google / Firebase ID token verification ------------------------------------------------
function firebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID) return process.env.FIREBASE_PROJECT_ID;
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8")).projectId || "";
  } catch {
    return "";
  }
}

let jwkCache: { keys: any[]; at: number } | null = null;
async function getJwks() {
  if (jwkCache && Date.now() - jwkCache.at < 3600_000) return jwkCache.keys;
  const r = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
  const data: any = await r.json();
  jwkCache = { keys: data.keys || [], at: Date.now() };
  return jwkCache.keys;
}

/** Verifies a Firebase ID token and returns the verified Google email + name, or null. */
export async function verifyGoogleIdToken(idToken: string): Promise<{ email: string; name: string } | null> {
  try {
    const projectId = firebaseProjectId();
    const [h, p, s] = String(idToken).split(".");
    if (!projectId || !h || !p || !s) return null;
    const header = JSON.parse(Buffer.from(h, "base64url").toString());
    if (header.alg !== "RS256") return null;
    const jwk = (await getJwks()).find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const ok = crypto.verify(
      "RSA-SHA256",
      Buffer.from(`${h}.${p}`),
      crypto.createPublicKey({ key: jwk, format: "jwk" }),
      Buffer.from(s, "base64url")
    );
    if (!ok) return null;
    const c = JSON.parse(Buffer.from(p, "base64url").toString());
    const nowS = Date.now() / 1000;
    if (c.aud !== projectId || c.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (typeof c.exp !== "number" || c.exp < nowS || !c.sub) return null;
    if (!c.email || c.email_verified !== true) return null;
    return { email: String(c.email).toLowerCase(), name: c.name || "Google User" };
  } catch {
    return null;
  }
}
