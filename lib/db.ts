import { neon } from '@neondatabase/serverless';

// Create a reusable database connection
export function getNeonClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  return neon(connectionString);
}

export default getNeonClient;
