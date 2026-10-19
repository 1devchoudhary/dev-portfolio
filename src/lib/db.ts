import "server-only";
import { MongoClient, type Db } from "mongodb";

// Reuse one client across hot reloads in dev and across invocations of a warm serverless instance
const globalForMongo = globalThis as unknown as { _mongoClient?: Promise<MongoClient> };

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  globalForMongo._mongoClient ??= new MongoClient(uri, { serverSelectionTimeoutMS: 5000 })
    .connect()
    .catch((err) => {
      // Don't cache a failed connection; the next call should retry
      globalForMongo._mongoClient = undefined;
      throw err;
    });

  const client = await globalForMongo._mongoClient;
  return client.db(process.env.MONGODB_DB || "portfolio");
}
