import express from 'express';
import { getPublicStats } from '../controllers/stats.controller.js';

const router = express.Router();

// This route is PUBLIC. Do NOT add protectRoute middleware here.
router.get('/public', getPublicStats);

export default router;