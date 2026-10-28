import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        type: { type: String, enum: ['video', 'song'], required: true },
        mediaUrl: { type: String, required: true },
        thumbnailUrl: { type: String, required: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model('Media', mediaSchema);