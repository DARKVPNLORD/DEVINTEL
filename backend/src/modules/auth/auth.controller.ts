import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { getEnv } from '../../config/env';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepo: UsersRepository,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const { user, tokens } = await this.authService.register(req.body);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: { user, tokens },
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { user, tokens } = await this.authService.login(req.body);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { user, tokens },
    });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const tokens = await this.authService.refreshTokens(refreshToken);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { tokens },
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    await this.authService.logout(refreshToken);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  };

  logoutAll = async (req: Request, res: Response): Promise<void> => {
    await this.authService.logoutAll(req.user!.userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'All sessions revoked',
    });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.usersRepo.findById(req.user!.userId);
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { user },
    });
  };

  githubAuth = async (_req: Request, res: Response): Promise<void> => {
    const url = this.authService.getGitHubAuthUrl();
    res.redirect(url);
  };

  githubCallback = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing authorization code',
      });
      return;
    }

    const { user, tokens, isNewUser } = await this.authService.handleGitHubCallback(code);
    const env = getEnv();

    // Redirect to frontend with tokens
    const params = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isNewUser: String(isNewUser),
    });

    res.redirect(`${env.FRONTEND_URL}/auth/callback?${params}`);
  };
}
