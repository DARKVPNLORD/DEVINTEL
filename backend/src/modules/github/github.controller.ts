import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GitHubService } from './github.service';

export class GitHubController {
  constructor(private readonly ghService: GitHubService) {}

  syncRepos = async (req: Request, res: Response): Promise<void> => {
    const result = await this.ghService.syncRepositories(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };

  syncCommits = async (req: Request, res: Response): Promise<void> => {
    const { repoId } = req.query;
    const result = await this.ghService.syncCommits(req.user!.userId, repoId as string | undefined);
    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };

  syncPRs = async (req: Request, res: Response): Promise<void> => {
    const result = await this.ghService.syncPullRequests(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };

  getRepos = async (req: Request, res: Response): Promise<void> => {
    const repos = await this.ghService.getRepositories(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: { repositories: repos } });
  };

  getMetrics = async (req: Request, res: Response): Promise<void> => {
    const metrics = await this.ghService.computeIntelligenceMetrics(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: { metrics } });
  };

  fullSync = async (req: Request, res: Response): Promise<void> => {
    const repoResult = await this.ghService.syncRepositories(req.user!.userId);
    const commitResult = await this.ghService.syncCommits(req.user!.userId);
    const prResult = await this.ghService.syncPullRequests(req.user!.userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        repositories: repoResult.synced,
        commits: commitResult.synced,
        pullRequests: prResult.synced,
      },
    });
  };
}
