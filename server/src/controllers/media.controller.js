import Media from '../models/Media.js';
import User from '../models/User.js';

// Admin Upload
export const uploadMedia = async (req, res) => {
    try {
        // Security check: Only 'suvro' is Admin
        if (req.user.username !== 'suvro') {
            return res.status(403).json({ message: 'Only Admin (suvro) can upload media' });
        }

        const { title, type } = req.body;

        if (!req.files || !req.files.mediaFile || !req.files.thumbnail) {
            return res.status(400).json({ message: 'Please upload both media file and thumbnail' });
        }

        // Convert local file paths to server URLs
        const mediaUrl = `/${req.files.mediaFile[0].path.replace(/\\/g, '/')}`;
        const thumbnailUrl = `/${req.files.thumbnail[0].path.replace(/\\/g, '/')}`;

        const newMedia = await Media.create({
            title,
            type,
            mediaUrl,
            thumbnailUrl,
            uploadedBy: req.user._id
        });

        res.status(201).json({ message: 'Upload successful!', media: newMedia });
    } catch (error) {
        console.error(`[Upload Error]: ${error.message}`);
        res.status(500).json({ message: 'Failed to upload media' });
    }
};

// Fetch All Media
export const getAllMedia = async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.status(200).json(media);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch media' });
    }
};

// Toggle Favorites
export const toggleFavorite = async (req, res) => {
    try {
        const { mediaId } = req.body;
        const user = await User.findById(req.user._id);

        const index = user.favorites.indexOf(mediaId);
        if (index === -1) {
            user.favorites.push(mediaId);
        } else {
            user.favorites.splice(index, 1);
        }

        await user.save();
        res.status(200).json({ favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update favorites' });
    }
};