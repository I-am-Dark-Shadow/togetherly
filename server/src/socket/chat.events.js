import Message from '../models/Message.js';
import Room from '../models/Room.js';

export const registerChatEvents = (io, socket) => {
    socket.on('send-message', async ({ roomId, text }, callback) => {
        try {
            if (!text || text.trim().length === 0) {
                return callback({ error: 'Message cannot be empty' });
            }

            if (text.length > 500) {
                return callback({ error: 'Message exceeds 500 characters' });
            }

            const room = await Room.findById(roomId);
            if (!room) return callback({ error: 'Room not found' });

            const userId = socket.user._id.toString();
            if (room.hostId.toString() !== userId && room.guestId?.toString() !== userId) {
                return callback({ error: 'Unauthorized to chat in this room' });
            }

            // Save to MongoDB for persistence
            const newMessage = await Message.create({
                roomId,
                senderId: socket.user._id,
                text: text.trim()
            });

            // Populate sender details before broadcasting
            await newMessage.populate('senderId', 'username avatarUrl');

            // Broadcast to everyone in the room (including the sender)
            io.to(`room:${roomId}`).emit('new-message', newMessage);

            callback({ success: true });
        } catch (err) {
            console.error(`[Socket] Chat Error: ${err.message}`);
            callback({ error: 'Internal server error' });
        }
    });
};