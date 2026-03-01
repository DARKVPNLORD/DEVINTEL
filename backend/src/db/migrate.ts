import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getPool, closePool } from '../config/database';
import { logger } from '../config/logger';

async function migrate(): Promise<void> {
  const pool = getPool();

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    logger.info('Running database migration...');
    await pool.query(sql);
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

migrate().catch((err) => {
  logger.error('Migration error:', err);
  process.exit(1);
});
