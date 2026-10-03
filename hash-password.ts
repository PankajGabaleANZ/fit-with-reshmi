// Usage: npm run hash-password -- "your password here"
// Prints a value to use as ADMIN_PASSWORD_HASH on the server (never store the plain password).
import { hashPassword } from "./src/serverAuth.js";

const pw = process.argv[2];
if (!pw || pw.length < 10) {
  console.error('Give a password of at least 10 characters: npm run hash-password -- "your password"');
  process.exit(1);
}
console.log(hashPassword(pw));
