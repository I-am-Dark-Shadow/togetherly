import User from '../models/User.js';

export const registerInviteEvents = (io, socket) => {

    socket.on('send-inapp-invite', async ({ targetUsername, roomId, inviteToken }, callback) => {
        try {
            // 1. Find the target user (case insensitive)
            const targetUser = await User.findOne({
                username: { $regex: new RegExp(`^${targetUsername}$`, 'i') }
            });

            if (!targetUser) return callback({ error: 'User not found' });

            if (targetUser._id.toString() === socket.user._id.toString()) {
                return callback({ error: "You can't invite yourself" });
            }

            // 2. Check if they are currently online
            if (!targetUser.isOnline) {
                return callback({ error: 'User is currently offline. Use the copy link method instead.' });
            }

            // 3. Emit directly to the target user's private global socket channel
            io.to(`user:${targetUser._id.toString()}`).emit('receive-invite', {
                roomId,
                inviteToken,
                hostName: socket.user.username,
                hostId: socket.user._id.toString()
            });

            callback({ success: true, message: 'Invite sent successfully!' });
        } catch (err) {
            console.error(`[Socket] Invite Error: ${err.message}`);
            callback({ error: 'Internal server error' });
        }
    });

    socket.on('decline-invite', ({ hostId, guestName }) => {
        // Bounce the decline message back to the host's private channel
        io.to(`user:${hostId}`).emit('invite-declined', { guestName });
    });

};