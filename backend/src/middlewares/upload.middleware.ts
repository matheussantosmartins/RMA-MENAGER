import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILES_PER_RMA = 5;

export const uploadsDir = path.resolve(process.cwd(), env.UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new ApiError(400, 'Formato de imagem não suportado. Use JPEG, PNG ou WEBP.'));
    return;
  }
  cb(null, true);
}

export const uploadRmaImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
    files: MAX_FILES_PER_RMA,
  },
}).array('images', MAX_FILES_PER_RMA);
