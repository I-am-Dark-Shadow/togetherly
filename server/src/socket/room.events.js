import Room from '../models/Room.js';

export const registerRoomEvents = (io, socket) => {

    socket.on('join-room-stream', async ({ roomId }, callback) => {
        try {
            const room = await Room.findById(roomId).populate('hostId guestId', 'username avatarUrl isOnline');
            if (!room) return callback({ error: 'Room not found' });

            const userId = socket.user._id.toString();
            const isHost = room.hostId?._id.toString() === userId;
            const isGuest = room.guestId?._id.toString() === userId;

            if (!isHost && !isGuest) {
                return callback({ error: 'Unauthorized to join this room stream' });
            }

            // Join the socket.io channel specific to this room
            const roomName = `room:${roomId}`;
            socket.join(roomName);

            // Track which room this socket is in (useful for disconnects)
            socket.currentRoom = roomId;

            // Determine who is currently active in this socket room
            const clients = io.sockets.adapter.rooms.get(roomName) || new Set();
            const activeUserIds = Array.from(clients).map(clientId => {
                const clientSocket = io.sockets.sockets.get(clientId);
                return clientSocket?.user?._id.toString();
            }).filter(Boolean);

            // Notify others in the room that this user joined
            socket.to(roomName).emit('user-joined', { userId });

            // Send the successful room state and active user list back to the joiner
            callback({ success: true, room, activeUserIds });
        } catch (err) {
            console.error(`[Socket] Join Room Error: ${err.message}`);
            callback({ error: 'Internal server error' });
        }
    });

    socket.on('leave-room-stream', ({ roomId }) => {
        const roomName = `room:${roomId}`;
        socket.leave(roomName);
        socket.currentRoom = null;
        socket.to(roomName).emit('user-left', { userId: socket.user._id.toString() });
    });

};