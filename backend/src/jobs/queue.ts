import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { getRedis } from '../config/redis';
import { logger } from '../config/logger';
import { query } from '../config/database';
import { GitHubService } from '../modules/github/github.service';
import { GitHubRepository } from '../modules/github/github.repository';
import { ResumeService } from '../modules/resume/resume.service';
import { ResumeRepository } from '../modules/resume/resume.repository';
import { AnalyticsService } from '../modules/analytics/analytics.service';
import { AnalyticsRepository } from '../modules/analytics/analytics.repository';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

// ============================================================
// QUEUE DEFINITIONS
// ============================================================

export const githubSyncQueue = new Queue('github-sync', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const resumeProcessQueue = new Queue('resume-process', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

export const scoreComputeQueue = new Queue('score-compute', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// ============================================================
// JOB LOG HELPER
// ============================================================

async function logJob(jobName: string, jobId: string, userId: string | null, status: string, attempt: number, payload: any, result?: any, errorMessage?: string): Promise<void> {
  try {
    await query(
      `INSERT INTO job_logs (job_name, job_id, user_id, status, attempt, payload, result, error_message, started_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        jobName, jobId, userId, status, attempt,
        JSON.stringify(payload), JSON.stringify(result ?? {}),
        errorMessage ?? null,
        status === 'active' ? new Date() : null,
        status === 'completed' || status === 'failed' ? new Date() : null,
      ]
    );
  } catch {
    // Job logging should never break the worker
  }
}

// ============================================================
// WORKERS
// ============================================================

export function startWorkers(): void {
  // GitHub Sync Worker
  const githubWorker = new Worker('github-sync', async (job: Job) => {
    const { userId, syncType } = job.data;
    logger.info(`[Job] GitHub sync started for user ${userId}, type: ${syncType}`);
    await logJob('github-sync', job.id!, userId, 'active', job.attemptsMade + 1, job.data);

    const ghService = new GitHubService(new GitHubRepository());

    let result: any;
    switch (syncType) {
      case 'repos':
        result = await ghService.syncRepositories(userId);
        break;
      case 'commits':
        result = await ghService.syncCommits(userId);
        break;
      case 'prs':
        result = await ghService.syncPullRequests(userId);
        break;
      case 'full':
      default:
        const repos = await ghService.syncRepositories(userId);
        const commits = await ghService.syncCommits(userId);
        const prs = await ghService.syncPullRequests(userId);
        result = { repos: repos.synced, commits: commits.synced, prs: prs.synced };
        break;
    }

    await logJob('github-sync', job.id!, userId, 'completed', job.attemptsMade + 1, job.data, result);
    logger.info(`[Job] GitHub sync completed for user ${userId}`, result);

    return result;
  }, { connection, concurrency: 3 });

  githubWorker.on('failed', async (job, err) => {
    if (job) {
      logger.error(`[Job] GitHub sync failed for job ${job.id}:`, err);
      await logJob('github-sync', job.id!, job.data.userId, 'failed', job.attemptsMade, job.data, undefined, err.message);
    }
  });

  // Resume Process Worker
  const resumeWorker = new Worker('resume-process', async (job: Job) => {
    const { resumeId, userId } = job.data;
    logger.info(`[Job] Resume processing started for ${resumeId}`);
    await logJob('resume-process', job.id!, userId, 'active', job.attemptsMade + 1, job.data);

    const resumeService = new ResumeService(new ResumeRepository());
    const result = await resumeService.processResume(resumeId);

    await logJob('resume-process', job.id!, userId, 'completed', job.attemptsMade + 1, job.data, result);
    logger.info(`[Job] Resume processing completed for ${resumeId}`);

    return result;
  }, { connection, concurrency: 2 });

  resumeWorker.on('failed', async (job, err) => {
    if (job) {
      logger.error(`[Job] Resume processing failed for job ${job.id}:`, err);
      await logJob('resume-process', job.id!, job.data.userId, 'failed', job.attemptsMade, job.data, undefined, err.message);
    }
  });

  // Score Compute Worker
  const scoreWorker = new Worker('score-compute', async (job: Job) => {
    const { userId } = job.data;
    logger.info(`[Job] Score computation started for user ${userId}`);
    await logJob('score-compute', job.id!, userId, 'active', job.attemptsMade + 1, job.data);

    const analyticsService = new AnalyticsService(new AnalyticsRepository(), new ResumeRepository());
    const result = await analyticsService.computeDevScore(userId);

    await logJob('score-compute', job.id!, userId, 'completed', job.attemptsMade + 1, job.data, result);
    logger.info(`[Job] Score computed for user ${userId}: ${result.composite_score}`);

    return result;
  }, { connection, concurrency: 5 });

  scoreWorker.on('failed', async (job, err) => {
    if (job) {
      logger.error(`[Job] Score computation failed for job ${job.id}:`, err);
      await logJob('score-compute', job.id!, job.data.userId, 'failed', job.attemptsMade, job.data, undefined, err.message);
    }
  });

  logger.info('All job workers started');
}

// ============================================================
// JOB SCHEDULERS
// ============================================================

export async function enqueueGitHubSync(userId: string, syncType: string = 'full'): Promise<string> {
  const job = await githubSyncQueue.add('sync', { userId, syncType }, {
    jobId: `github-sync-${userId}-${Date.now()}`,
  });
  return job.id!;
}

export async function enqueueResumeProcess(resumeId: string, userId: string): Promise<string> {
  const job = await resumeProcessQueue.add('process', { resumeId, userId }, {
    jobId: `resume-${resumeId}`,
  });
  return job.id!;
}

export async function enqueueScoreCompute(userId: string): Promise<string> {
  const job = await scoreComputeQueue.add('compute', { userId }, {
    jobId: `score-${userId}-${Date.now()}`,
  });
  return job.id!;
}
