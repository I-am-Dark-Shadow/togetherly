import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: [true, 'Message text is required'],
            trim: true,
            maxlength: [500, 'Message cannot exceed 500 characters'],
        },
    },
    { timestamps: true }
);

// Index for fast retrieval of room chat history
messageSchema.index({ roomId: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);