import { Pool } from 'pg';

// Reuse a single Pool across hot-reloads (dev) and warm serverless invocations
// (prod). Without this, `next dev`'s module reloading recreates a Pool on every
// change and leaks Postgres connections until the server exhausts them.
const globalForPool = globalThis as unknown as { pgPool?: Pool };

const pool =
  globalForPool.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

globalForPool.pgPool = pool;

export default pool;
