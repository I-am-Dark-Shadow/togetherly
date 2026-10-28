import express from 'express';
import { uploadMedia, getAllMedia, toggleFavorite } from '../controllers/media.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/upload', upload.fields([{ name: 'mediaFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), uploadMedia);
router.get('/', getAllMedia);
router.post('/favorite', toggleFavorite);

export default router;