import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import dotenv from "dotenv";
import { addDays, startOfDay, endOfDay, setHours, setMinutes, parseISO, isBefore, isAfter, addMinutes, format } from "date-fns";
import * as db from "./src/db.js";
import Razorpay from "razorpay";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

let razorpayClient: Razorpay | null = null;
function getRazorpay() {
  if (!razorpayClient) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (key_id && key_secret) {
      razorpayClient = new Razorpay({ key_id, key_secret });
    }
  }
  return razorpayClient;
}

// Helper to initialize Google Calendar client
function getCalendarId() {
  let calId = process.env.GOOGLE_CALENDAR_ID || '';
  return calId.trim().replace(/\.+$/, '');
}

function getCalendarClient() {
  if (process.env.GOOGLE_OAUTH_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN
    });
    return google.calendar({ version: 'v3', auth: oAuth2Client });
  }

  let privateKey = process.env.GOOGLE_PRIVATE_KEY || "";
  
  // Clean up any literal backslash-n, quotes, or accidental extra spaces
  privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  
  if (privateKey) {
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}`;
    }
    if (!privateKey.includes('-----END PRIVATE KEY-----')) {
      privateKey = `${privateKey}\n-----END PRIVATE KEY-----\n`;
    }
  }
  
  // Clean up any double newlines or spaces at start/end of lines
  privateKey = privateKey.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');

  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: privateKey,
  };

  if (!credentials.client_email || !credentials.private_key || !process.env.GOOGLE_CALENDAR_ID) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'],
  });

  return google.calendar({ version: 'v3', auth });
}

// Generate all possible slots for a day
// Configurable: 9 AM to 5 PM, 60 min slots
function generateSlotsForDay(dateStr: string) {
  const slots: Date[] = [];
  const startD = startOfDay(new Date(dateStr));
  let current = setHours(setMinutes(startD, 0), 9); // 9:00 AM
  const endLimit = setHours(setMinutes(startD, 0), 17); // 5:00 PM

  while (isBefore(current, endLimit)) {
    slots.push(current);
    current = addMinutes(current, 60); // 60 min increments
  }
  return slots;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Razorpay Diagnostics and Verification Endpoint
  app.get("/api/admin/razorpay/status", (req, res) => {
    try {
      const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "";
      const secret = process.env.RAZORPAY_KEY_SECRET || "";
      const isConfigured = Boolean(keyId && secret);
      const isTestMode = keyId.startsWith("rzp_test_");
      const client = getRazorpay();

      res.json({
        configured: isConfigured,
        hasKeyId: Boolean(keyId),
        hasSecret: Boolean(secret),
        keyPrefix: keyId ? keyId.substring(0, 8) + "..." : "not set",
        mode: isTestMode ? "TEST MODE" : keyId ? "LIVE MODE" : "UNCONFIGURED",
        instanceReady: Boolean(client),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Breath Protocols API (Loaded on runtime for Breathe with Reshmi)
  app.get("/api/breath/protocols", (req, res) => {
    try {
      const protocols = db.getBreathProtocols();
      res.json({ protocols });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/breath/protocols", (req, res) => {
    try {
      const protocol = req.body;
      if (!protocol || !protocol.id || !protocol.name) {
        return res.status(400).json({ error: "Missing required protocol fields" });
      }
      db.updateBreathProtocol(protocol);
      res.json({ success: true, protocol });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Website Customization Settings API
  app.get("/api/settings", (req, res) => {
    try {
      const settings = db.getAllSettings();
      res.json({ settings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dynamic Instagram Reels API
  app.get("/api/reels", (req, res) => {
    try {
      const reels = db.getInstagramReels();
      res.json({ reels });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/reels", (req, res) => {
    try {
      const reel = req.body;
      if (!reel || !reel.id || !reel.title) {
        return res.status(400).json({ error: "Missing required fields: id and title are mandatory." });
      }
      db.addOrUpdateInstagramReel(reel);
      res.json({ success: true, reels: db.getInstagramReels() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/reels/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.deleteInstagramReel(id);
      res.json({ success: true, reels: db.getInstagramReels() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/settings", (req, res) => {
    try {
      const { settings } = req.body;
      if (!settings || typeof settings !== "object") {
        return res.status(400).json({ error: "Invalid settings object" });
      }
      for (const [key, val] of Object.entries(settings)) {
        db.updateSetting(key, String(val));
      }
      res.json({ success: true, settings: db.getAllSettings() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Routes
  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { amount, currency = "INR" } = req.body;
      const razorpay = getRazorpay();
      if (!razorpay) {
        return res.status(503).json({ error: "Razorpay is not configured" });
      }
      const options = {
        amount: Math.round(amount * 100), // convert to smallest currency unit (paise)
        currency,
        receipt: `receipt_${Date.now()}`
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (err: any) {
      console.error("Razorpay order error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/calendar/availability", async (req, res) => {
    try {
      const { date } = req.query; // date string like '2023-10-05'
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Missing 'date' query parameter" });
      }

      const calendarId = getCalendarId();
      const calendar = getCalendarClient();
      if (!calendar || !calendarId) {
        // Fallback for UI if environment not set up yet
        return res.status(503).json({ 
          error: "Calendar integration restricted",
          message: "Please configure GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_CALENDAR_ID"
        });
      }

      const timeMin = startOfDay(new Date(date)).toISOString();
      const timeMax = endOfDay(new Date(date)).toISOString();

      // Get free/busy from Google Calendar
      const freeBusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          items: [{ id: calendarId }]
        }
      });

      const busyIntervals = freeBusyResponse.data.calendars?.[calendarId]?.busy || [];

      // Generate base working hours
      const allSlots = generateSlotsForDay(date);

      // Filter out slots that overlap with busy intervals or are in the past
      const now = new Date();
      const availableSlots = allSlots.filter(slot => {
        const slotEnd = addMinutes(slot, 60);
        
        if (isBefore(slot, now)) return false; // don't show past slots

        const isBusy = busyIntervals.some(busy => {
          if (!busy.start || !busy.end) return false;
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          // Overlap check
          return (slot < busyEnd && slotEnd > busyStart);
        });

        return !isBusy;
      });

      // Map to formatted string times (e.g. "09:00 AM")
      const formattedSlots = availableSlots.map(slot => format(slot, 'hh:mm a'));

      res.json({ slots: formattedSlots });
    } catch (err: any) {
      console.error("Calendar Availability Error:", err);
      res.status(500).json({ error: "Failed to fetch availability: " + (err.message || String(err)) });
    }
  });

  app.get("/api/calendar/test", async (req, res) => {
    try {
      const calendarId = getCalendarId();
      const calendar = getCalendarClient();
      if (!calendar || !calendarId) {
        return res.status(503).json({ success: false, error: "Calendar integration restricted. Missing GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY or GOOGLE_CALENDAR_ID" });
      }

      // Check if we can get the calendar settings
      const response = await calendar.calendars.get({ calendarId });
      res.json({ success: true, message: `Successfully connected to calendar: ${response.data.summary}` });
    } catch (err: any) {
      console.error("Calendar Test Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/calendar/book", async (req, res) => {
    try {
      const { date, time, patientName, patientEmail, notes } = req.body;
      
      const calendarId = getCalendarId();
      const calendar = getCalendarClient();
      // We no longer abort if calendar is missing, we'll just save to DB.

      // Parse date and time to actual Date object
      // 'date': '2023-10-05', 'time': '09:00 AM'
      const baseDate = startOfDay(new Date(date));
      const [timeVal, modifier] = time.split(' ');
      let [hours, minutes] = timeVal.split(':').map(Number);
      if (hours === 12) hours = 0;
      if (modifier === 'PM') hours += 12;
      
      const startDateTime = setMinutes(setHours(baseDate, hours), minutes);
      const endDateTime = addMinutes(startDateTime, 60);

      const event = {
        summary: `Consultation: ${patientName}`,
        description: `Patient Email: ${patientEmail}\n\nNotes/Answers: \n${notes}`,
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() },
        attendees: [{ email: patientEmail }],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      };

      let meetLink = null;
      let eventId = null;
      let eventLink = null;

      if (calendar && calendarId) {
        try {
          const response = await calendar.events.insert({
            calendarId: calendarId,
            conferenceDataVersion: 1,
            requestBody: event,
            sendUpdates: 'all'
          });
          meetLink = response.data.hangoutLink || null;
          eventId = response.data.id || null;
          eventLink = response.data.htmlLink || null;
        } catch (calendarErr: any) {
          console.error("Calendar API Error during booking with ID " + calendarId + ":", calendarErr.message);
          // Fallback to primary if the explicit calendar ID fails (often a 404 from bad config)
          if (calendarErr.status === 404 || calendarErr.message.includes('Not Found')) {
            try {
              const fallbackResponse = await calendar.events.insert({
                calendarId: 'primary',
                conferenceDataVersion: 1,
                requestBody: event,
                sendUpdates: 'all'
              });
              meetLink = fallbackResponse.data.hangoutLink || null;
              eventId = fallbackResponse.data.id || null;
              eventLink = fallbackResponse.data.htmlLink || null;
            } catch (fallbackErr: any) {
              console.error("Calendar API Fallback Error:", fallbackErr.message);
            }
          }
        }
      }

      // DB Persistence
      let client = db.getClientByEmail(patientEmail);
      if (!client) {
        client = db.createClient(patientEmail, patientName);
      }
      
      db.createBooking(client.id, date, time, notes, meetLink, eventId);

      res.json({ success: true, eventLink: eventLink });
    } catch (err: any) {
      console.error("Calendar Booking Error:", err);
      res.status(500).json({ error: "Failed to book event" });
    }
  });

  app.get('/api/admin/bookings', (req, res) => {
    try {
      const bookings = db.getAdminBookings();
      res.json({ bookings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/sessions', (req, res) => {
    try {
      const { bookingId, transcription, plan } = req.body;
      if (transcription) db.saveSessionTransciption(bookingId, transcription);
      if (plan) db.saveSessionPlan(bookingId, plan);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/client/login', (req, res) => {
    try {
      const { email, password } = req.body;
      const client = db.getClientByEmail(email);
      if (!client) return res.status(404).json({ error: "Client not found" });
      // In a real app we would check password here. For now we just return client if it exists.
      res.json({ client });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/client/signup', (req, res) => {
    try {
      const { email, name, password } = req.body;
      const existing = db.getClientByEmail(email);
      if (existing) return res.status(400).json({ error: "Client already exists" });
      const client = db.createClient(email, name);
      res.json({ client });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/login', (req, res) => {
    try {
      const { username, password } = req.body;
      if (username === 'admin' && password === 'admin') {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/client/:clientId/bookings', (req, res) => {
    try {
      const bookings = db.getClientBookings(Number(req.params.clientId));
      res.json({ bookings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt in request body" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured in settings. Please add your Gemini API Key in Settings to enable AI features."
        });
      }

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      res.json({ text: response.text || '' });
    } catch (err: any) {
      console.error("AI Generation error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
