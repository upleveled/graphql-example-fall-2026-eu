import { config } from 'dotenv-safe';
import postgres from 'postgres';

// Centralized configuration will be
// applied to both the Next.js app
// and the Ley migrations
export const postgresJsConfig = {
  // Enable SSL for Vercel
  ssl: Boolean(process.env.POSTGRES_URL),
  transform: {
    ...postgres.camel,
    undefined: null,
  },
};

export function setEnvironmentVariables() {
  // Skip dotenv-safe usage in:
  // - Production (eg. Fly.io or Vercel)
  // - CI (eg. GitHub Actions)
  if (process.env.NODE_ENV === 'production' || process.env.CI) {
    // Set standard environment variables for Postgres.js from
    // Vercel environment variables
    if (process.env.POSTGRES_URL) {
      process.env.PGHOST = process.env.POSTGRES_HOST;
      process.env.PGDATABASE = process.env.POSTGRES_DATABASE;
      process.env.PGUSERNAME = process.env.POSTGRES_USER;
      process.env.PGPASSWORD = process.env.POSTGRES_PASSWORD;
    }

    return;
  }

  // Read in values from .env file to process.env
  config();
}
