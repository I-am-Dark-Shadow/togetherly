import Room from '../models/Room.js';

export const registerMediaEvents = (io, socket) => {

    socket.on('set-media-url', async ({ roomId, url }, callback) => {
        try {
            const room = await Room.findById(roomId);
            if (!room) return callback({ error: 'Room not found' });

            if (room.hostId.toString() !== socket.user._id.toString()) {
                return callback({ error: 'Only the host can change the media' });
            }

            room.currentMedia.url = url;
            room.currentMedia.state = 'IDLE';
            room.currentMedia.time = 0;
            room.currentMedia.updatedAt = new Date();
            await room.save();

            io.to(`room:${roomId}`).emit('media-url-changed', { url });
            callback({ success: true });
        } catch (err) {
            console.error(`[Socket] Set Media URL Error: ${err.message}`);
            callback({ error: 'Internal server error' });
        }
    });

    // NEW: Handle Play, Pause, Seek, and Buffering
    socket.on('media-action', async ({ roomId, action, time }) => {
        try {
            const room = await Room.findById(roomId);
            if (!room) return;

            const userId = socket.user._id.toString();
            if (room.hostId.toString() !== userId && room.guestId?.toString() !== userId) {
                return; // Unauthorized
            }

            // Map incoming action to state
            let newState = room.currentMedia.state;
            if (action === 'PLAY') newState = 'PLAYING';
            if (action === 'PAUSE' || action === 'BUFFERING') newState = 'PAUSED';

            room.currentMedia.state = newState;
            room.currentMedia.time = time;
            room.currentMedia.updatedAt = new Date();
            await room.save();

            // Broadcast the exact timeline state to the OTHER user in the room
            socket.to(`room:${roomId}`).emit('sync-state', {
                state: newState,
                time,
                updatedAt: room.currentMedia.updatedAt,
                actionBy: socket.user.username,
                action
            });
        } catch (err) {
            console.error(`[Socket] Media Action Error: ${err.message}`);
        }
    });

};