import crypto from 'crypto';
import Room from '../models/Room.js';
import Message from '../models/Message.js';

// Utility to generate a 32-byte secure random hex string
const generateToken = () => crypto.randomBytes(32).toString('hex');
// Utility to hash the token using SHA-256 for secure DB storage
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const createRoom = async (req, res) => {
    try {
        // Expire any existing active rooms hosted by this user to prevent clutter
        await Room.updateMany(
            { hostId: req.user._id, status: 'active' },
            { status: 'expired' }
        );

        const token = generateToken();
        const inviteTokenHash = hashToken(token);

        const room = new Room({
            hostId: req.user._id,
            inviteTokenHash
        });

        await room.save();

        // We return the plaintext token ONLY ONCE. It is never retrievable again.
        res.status(201).json({ roomId: room._id, token });
    } catch (error) {
        console.error(`[Room] Create Error: ${error.message}`);
        res.status(500).json({ message: 'Failed to create room' });
    }
};

export const getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id).populate('hostId guestId', 'username avatarUrl isOnline');

        if (!room) return res.status(404).json({ message: 'Room not found' });

        const isHost = room.hostId._id.toString() === req.user._id.toString();
        const isGuest = room.guestId && room.guestId._id.toString() === req.user._id.toString();

        if (!isHost && !isGuest) {
            return res.status(403).json({ message: 'Unauthorized to view this room' });
        }

        res.status(200).json(room);
    } catch (error) {
        console.error(`[Room] Get Error: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch room' });
    }
};

export const joinRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.body;

        if (!token) return res.status(400).json({ message: 'Invite token is required' });

        const room = await Room.findById(id);
        if (!room || room.status !== 'active') {
            return res.status(404).json({ message: 'Room not found or link expired' });
        }

        // Check if user is already the host
        const isHost = room.hostId.toString() === req.user._id.toString();
        if (isHost) return res.status(200).json({ message: 'You are the host', roomId: room._id });

        // Check if user is already the guest
        const isGuest = room.guestId && room.guestId.toString() === req.user._id.toString();
        if (isGuest) return res.status(200).json({ message: 'Already joined', roomId: room._id });

        // If there is already a different guest, the room is full (max 2)
        if (room.guestId) {
            return res.status(403).json({ message: 'This private room is full' });
        }

        // Validate the cryptographic token
        if (hashToken(token) !== room.inviteTokenHash) {
            return res.status(401).json({ message: 'Invalid or incorrect invitation link' });
        }

        // Success: Assign guest
        room.guestId = req.user._id;
        await room.save();

        res.status(200).json({ message: 'Joined successfully', roomId: room._id });
    } catch (error) {
        console.error(`[Room] Join Error: ${error.message}`);
        res.status(500).json({ message: 'Failed to join room' });
    }
};

export const getRoomMessages = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify room exists and user is a member
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        const isHost = room.hostId.toString() === req.user._id.toString();
        const isGuest = room.guestId && room.guestId.toString() === req.user._id.toString();

        if (!isHost && !isGuest) {
            return res.status(403).json({ message: 'Unauthorized to view these messages' });
        }

        // Fetch messages sorted chronologically (oldest first)
        const messages = await Message.find({ roomId: id })
            .populate('senderId', 'username avatarUrl')
            .sort({ createdAt: 1 })
            // Limit to last 100 messages to prevent massive payloads. Can add pagination later if needed.
            .limit(100);

        res.status(200).json(messages);
    } catch (error) {
        console.error(`[Room] Get Messages Error: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};