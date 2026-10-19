// Add the "poison pill" from 'server-only'
// to prevent using this file in a Client
// Component
import 'server-only';
import postgres, { type Sql } from 'postgres';
import { postgresJsConfig, setEnvironmentVariables } from '../util/config';

// Read in values from .env file to process.env
setEnvironmentVariables();

declare namespace globalThis {
  let postgresSqlClient: Sql;
}

// Connect only once to the database
// https://github.com/vercel/next.js/issues/7811#issuecomment-715259370
function connectOneTimeToDatabase() {
  if (!('postgresSqlClient' in globalThis)) {
    globalThis.postgresSqlClient = postgres(postgresJsConfig);
  }
  return globalThis.postgresSqlClient;
}

export const sql = connectOneTimeToDatabase();
