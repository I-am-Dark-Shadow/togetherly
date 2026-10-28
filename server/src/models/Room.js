import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
    {
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        guestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // Null until the guest accepts the invite
        },
        inviteTokenHash: {
            type: String,
            required: true, // We store the hash of the token, never the plain token
        },
        status: {
            type: String,
            enum: ['active', 'expired'],
            default: 'active',
        },
        currentMedia: {
            url: { type: String, default: '' },
            time: { type: Number, default: 0 },
            state: {
                type: String,
                enum: ['PLAYING', 'PAUSED', 'BUFFERING', 'IDLE'],
                default: 'IDLE'
            },
            updatedAt: { type: Date, default: Date.now },
        },
    },
    { timestamps: true }
);

// Ensure a user can only be a host of one active room at a time
roomSchema.index({ hostId: 1, status: 1 });

export default mongoose.model('Room', roomSchema);