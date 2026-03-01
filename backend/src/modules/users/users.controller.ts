import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UsersService } from './users.service';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.usersService.getProfile(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: { profile } });
  };

  getByUsername = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.usersService.getProfileByUsername(req.params.username);
    res.status(StatusCodes.OK).json({ status: 'success', data: { profile } });
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.usersService.updateProfile(req.user!.userId, req.body);
    res.status(StatusCodes.OK).json({ status: 'success', data: { profile } });
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    const stats = await this.usersService.getUserStats(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', data: { stats } });
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    await this.usersService.deleteAccount(req.user!.userId);
    res.status(StatusCodes.OK).json({ status: 'success', message: 'Account deleted' });
  };
}
