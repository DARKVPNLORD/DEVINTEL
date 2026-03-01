import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeRepository } from './resume.repository';
import { authenticate, uploadRateLimit } from '../../middleware';
import { asyncHandler } from '../../utils';
import { getEnv } from '../../config/env';

const router = Router();

const resumeRepo = new ResumeRepository();
const resumeService = new ResumeService(resumeRepo);
const resumeController = new ResumeController(resumeService);

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = getEnv().UPLOAD_DIR;
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: getEnv().MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

router.post('/upload', authenticate, uploadRateLimit, upload.single('resume'), asyncHandler(resumeController.upload));
router.post('/analyze', authenticate, uploadRateLimit, upload.single('resume'), asyncHandler(resumeController.uploadAndProcess));
router.post('/:id/process', authenticate, asyncHandler(resumeController.process));
router.get('/', authenticate, asyncHandler(resumeController.getAll));
router.get('/:id', authenticate, asyncHandler(resumeController.getOne));

export default router;
