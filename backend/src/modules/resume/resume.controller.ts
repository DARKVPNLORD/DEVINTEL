import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResumeService } from './resume.service';
import { BadRequestError } from '../../utils/errors';

export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  upload = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const { targetRole } = req.body;
    const result = await this.resumeService.uploadResume(req.user!.userId, req.file, targetRole);

    res.status(StatusCodes.CREATED).json({ status: 'success', data: result });
  };

  process = async (req: Request, res: Response): Promise<void> => {
    const result = await this.resumeService.processResume(req.params.id);
    res.status(StatusCodes.OK).json({ status: 'success', data: result });
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    const analyses = await this.resumeService.getAnalyses(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: { analyses } });
  };

  getOne = async (req: Request, res: Response): Promise<void> => {
    const analysis = await this.resumeService.getAnalysis(req.params.id);
    res.status(StatusCodes.OK).json({ status: 'success', data: { analysis } });
  };

  uploadAndProcess = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const { targetRole } = req.body;
    const { id } = await this.resumeService.uploadResume(req.user!.userId, req.file, targetRole);
    const result = await this.resumeService.processResume(id);

    res.status(StatusCodes.OK).json({ status: 'success', data: { id, ...result } });
  };
}
