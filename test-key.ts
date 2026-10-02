import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const pk = process.env.GOOGLE_PRIVATE_KEY;
if (!pk) {
  console.log("No private key found.");
  process.exit(0);
}

let cleaned = pk.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

if (!cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
  cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}`;
}
if (!cleaned.includes('-----END PRIVATE KEY-----')) {
  cleaned = `${cleaned}\n-----END PRIVATE KEY-----\n`;
}

console.log("Key starts with:", cleaned.substring(0, 30));
console.log("Key ends with:", cleaned.substring(cleaned.length - 30));
console.log("Contains actual newlines?", cleaned.includes('\n'));
console.log("Contains literal \\n?", cleaned.includes('\\n'));

try {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "test@test.com",
    key: cleaned,
    scopes: ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'],
  });
  
  await auth.getAccessToken();
  console.log("Token retrieved successfully. Key parsed!");
} catch (error) {
  console.error("Failed to parse key:", error.message);
}
