import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Original getNeonClient export to avoid breaking existing stuff if any
export function getNeonClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  return neon(connectionString);
}

export default getNeonClient;

// Drizzle Client
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
