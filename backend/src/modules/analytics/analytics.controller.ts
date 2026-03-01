import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  computeScore = async (req: Request, res: Response): Promise<void> => {
    const score = await this.analyticsService.computeDevScore(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: { score } });
  };

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    const dashboard = await this.analyticsService.getDashboard(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: { dashboard } });
  };

  getScoreTrend = async (req: Request, res: Response): Promise<void> => {
    const days = parseInt(req.query.days as string) || 90;
    const trend = await this.analyticsService.getScoreTrend(req.user!.userId, days);
    res.status(StatusCodes.OK).json({ status: 'success', data: { trend } });
  };

  getSkills = async (req: Request, res: Response): Promise<void> => {
    const skills = await this.analyticsService.getSkills(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: { skills } });
  };

  createTarget = async (req: Request, res: Response): Promise<void> => {
    const target = await this.analyticsService.createTarget(req.user!.userId, req.body);
    res.status(StatusCodes.CREATED).json({ status: 'success', data: { target } });
  };

  getTargets = async (req: Request, res: Response): Promise<void> => {
    const targets = await this.analyticsService.getTargets(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: { targets } });
  };

  updateTarget = async (req: Request, res: Response): Promise<void> => {
    const target = await this.analyticsService.updateTarget(req.params.id, req.body);
    res.status(StatusCodes.OK).json({ status: 'success', data: { target } });
  };

  deleteTarget = async (req: Request, res: Response): Promise<void> => {
    await this.analyticsService.deleteTarget(req.params.id);
    res.status(StatusCodes.OK).json({ status: 'success', message: 'Career target deleted' });
  };
}
