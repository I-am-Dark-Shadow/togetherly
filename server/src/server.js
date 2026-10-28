import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path'; // <--- NEW: Path module
import { fileURLToPath } from 'url'; // <--- FIXED: URL module needed for ES modules

import { corsOptions } from './config/cors.js';
import { errorHandler } from './middleware/error.middleware.js';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import roomRoutes from './routes/room.routes.js';
import statsRoutes from './routes/stats.routes.js';
import mediaRoutes from './routes/media.routes.js'; // <--- NEW
import { setupSockets } from './socket/socketHandler.js';

dotenv.config();
connectDB();

// ES Module setup for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: corsOptions });

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/media', mediaRoutes); // <--- NEW

// NEW: Expose the uploads folder so the frontend can load images/videos
// Since __dirname is 'server/src', '../uploads' points to 'server/uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Togetherly API is running securely' });
});

setupSockets(io);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
}

export { app, server };