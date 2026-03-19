import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

// Ensure the uploads directory exists (optional safety)
import fs from 'fs';
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Disk storage: save file to /uploads with a unique name
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);             // .pdf, .zip, etc.
    const base = path.basename(file.originalname, ext)       // original name without extension
      .toLowerCase()
      .replace(/[^a-z0-9\-_.]/g, '-')                        // sanitize
      .slice(0, 40);                                         // keep short
    cb(null, `${Date.now()}-${randomUUID()}-${base}${ext}`);
  }
});

// Allowed MIME types for assignment submissions
const ALLOWED = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

function fileFilter(_req, file, cb) {
  if (ALLOWED.has(file.mimetype)) return cb(null, true);
  cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file')); // triggers error handler
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
    files: 1
  },
  fileFilter
});