// Usage: npm run hash-password -- "your-admin-password"
// Prints the two env vars the admin panel needs. Uses the same scrypt params as src/lib/password.ts.
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: npm run hash-password -- "your-admin-password"   (at least 10 characters)');
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");

console.log("\nAdd these to .env.local and to Vercel → Settings → Environment Variables:\n");
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
console.log(`SESSION_SECRET=${randomBytes(32).toString("hex")}\n`);
