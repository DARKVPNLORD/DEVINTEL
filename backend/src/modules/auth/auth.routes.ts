import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UsersRepository } from '../users/users.repository';
import { authenticate, authRateLimit } from '../../middleware';
import { validate, asyncHandler } from '../../utils';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.validation';

const router = Router();

const authRepo = new AuthRepository();
const usersRepo = new UsersRepository();
const authService = new AuthService(authRepo);
const authController = new AuthController(authService, usersRepo);

router.post('/register', authRateLimit, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authRateLimit, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
router.post('/logout', validate(logoutSchema), asyncHandler(authController.logout));
router.post('/logout-all', authenticate, asyncHandler(authController.logoutAll));
router.get('/me', authenticate, asyncHandler(authController.me));

// GitHub OAuth
router.get('/github', authController.githubAuth);
router.get('/github/callback', asyncHandler(authController.githubCallback));

export default router;
