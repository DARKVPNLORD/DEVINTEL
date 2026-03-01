import 'dotenv/config';
import { getPool, closePool } from '../config/database';
import { logger } from '../config/logger';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

async function seed(): Promise<void> {
  const pool = getPool();

  try {
    logger.info('Seeding database...');

    const passwordHash = await bcrypt.hash('DevIntel2024!', 12);
    const userId = uuid();

    await pool.query(`
      INSERT INTO users (id, email, username, password_hash, display_name, is_active, is_email_verified)
      VALUES ($1, $2, $3, $4, $5, true, true)
      ON CONFLICT (email) DO NOTHING
    `, [userId, 'demo@devintel.dev', 'demo-user', passwordHash, 'Demo Developer']);

    await pool.query(`
      INSERT INTO career_targets (user_id, role_title, required_skills, preferred_skills, min_experience_years, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT DO NOTHING
    `, [
      userId,
      'Senior Full-Stack Engineer',
      ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
      ['Docker', 'Kubernetes', 'GraphQL', 'Redis'],
      3
    ]);

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

seed().catch((err) => {
  logger.error('Seed error:', err);
  process.exit(1);
});
