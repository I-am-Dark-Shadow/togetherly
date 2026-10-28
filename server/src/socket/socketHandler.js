import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerRoomEvents } from './room.events.js';
import { registerMediaEvents } from './media.events.js';
import { registerChatEvents } from './chat.events.js';
import { registerInviteEvents } from './invite.events.js'; // <--- NEW

const parseCookies = (cookieString) => {
    if (!cookieString) return {};
    return cookieString.split(';').reduce((res, c) => {
        const [key, val] = c.trim().split('=');
        res[key] = val;
        return res;
    }, {});
};

export const setupSockets = (io) => {
    io.use(async (socket, next) => {
        try {
            const cookies = parseCookies(socket.request.headers.cookie);
            const token = cookies.token;
            if (!token) return next(new Error('Authentication error: No token provided'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-passwordHash');
            if (!user) return next(new Error('Authentication error: User not found'));

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`[Socket] Connected: ${socket.user.username} (${socket.id})`);

        // IMPORTANT: Join a global private channel for this specific user
        // This allows us to send them targeted notifications anywhere in the app
        socket.join(`user:${socket.user._id.toString()}`);

        await User.findByIdAndUpdate(socket.user._id, { isOnline: true });

        // Register event modules
        registerRoomEvents(io, socket);
        registerMediaEvents(io, socket);
        registerChatEvents(io, socket);
        registerInviteEvents(io, socket); // <--- NEW

        socket.on('disconnect', async () => {
            console.log(`[Socket] Disconnected: ${socket.user.username}`);

            if (socket.currentRoom) {
                io.to(`room:${socket.currentRoom}`).emit('user-left', {
                    userId: socket.user._id.toString()
                });
            }

            await User.findByIdAndUpdate(socket.user._id, {
                isOnline: false,
                lastSeen: new Date()
            });
        });
    });
};