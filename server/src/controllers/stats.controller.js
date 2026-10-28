import User from '../models/User.js';
import Room from '../models/Room.js';

export const getPublicStats = async (req, res) => {
    try {
        // Count only active entities. No personal data is retrieved or sent.
        const onlineUsers = await User.countDocuments({ isOnline: true });
        const activeRooms = await Room.countDocuments({ status: 'active' });

        res.status(200).json({
            onlineUsers,
            activeRooms
        });
    } catch (error) {
        console.error(`[Stats] Error fetching public stats: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch public stats' });
    }
};