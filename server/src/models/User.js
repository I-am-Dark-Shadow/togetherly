import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [20, 'Username cannot exceed 20 characters'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password hash is required'],
        },
        avatarUrl: {
            type: String,
            default: '',
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
        // NEW: User's favorite media list
        favorites: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Media'
        }],
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);