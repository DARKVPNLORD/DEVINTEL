import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

export interface ActivityLogData {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(data: ActivityLogData, req: Request): Promise<void> {
  try {
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.userId,
        data.action,
        data.entityType ?? null,
        data.entityId ?? null,
        JSON.stringify(data.metadata ?? {}),
        req.ip,
        req.get('user-agent') ?? null,
      ]
    );
  } catch {
    // Activity logging should never break the request
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    if (!originalUrl.includes('/health')) {
      const level = statusCode >= 400 ? 'warn' : 'info';
      const msg = `${method} ${originalUrl} ${statusCode} ${duration}ms`;
      // Using console here for request logging, winston handles everything else
      if (level === 'warn') {
        process.stderr.write(`[REQ] ${msg}\n`);
      }
    }
  });

  next();
}
