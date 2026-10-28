import express from 'express';
import { createRoom, getRoom, joinRoom, getRoomMessages } from '../controllers/room.controller.js'; // <--- NEW IMPORT
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/', createRoom);
router.get('/:id', getRoom);
router.post('/:id/join', joinRoom);
router.get('/:id/messages', getRoomMessages); // <--- NEW ROUTE

export default router;