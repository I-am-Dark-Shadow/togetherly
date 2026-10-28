import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure directories exist
const dirs = ['uploads/videos', 'uploads/songs', 'uploads/thumbnails'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'thumbnail') {
            cb(null, 'uploads/thumbnails/');
        } else if (file.mimetype.startsWith('video/')) {
            cb(null, 'uploads/videos/');
        } else if (file.mimetype.startsWith('audio/')) {
            cb(null, 'uploads/songs/');
        } else {
            cb(new Error('Invalid file type'), 'uploads/');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ storage });