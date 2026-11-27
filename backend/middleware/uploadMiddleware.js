import fs from 'fs';
import path from 'path';
import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const UPLOAD_DIR = path.resolve('uploads', 'dishes');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, `dish-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new ApiError(400, 'Seuls les fichiers image (JPG, PNG, WebP) sont autorisés.'), false);
  }
  cb(null, true);
};

export const uploadDishImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
