import fs from 'fs';
import Media from '../models/Media.js';
import User from '../models/User.js';
import { driveService } from '../config/googleDrive.js';

// তোমার গুগল ড্রাইভের ফোল্ডার ID এখানে দাও
const DRIVE_FOLDER_ID = '18pV7X_NcBZtnzSroxW7Hk9mk-qT9cabl';

const uploadToDrive = async (filePath, mimeType, fileName) => {
    try {
        const response = await driveService.files.create({
            requestBody: {
                name: fileName,
                parents: [DRIVE_FOLDER_ID],
            },
            media: {
                mimeType: mimeType,
                body: fs.createReadStream(filePath),
            },
            fields: 'id',
        });

        const fileId = response.data.id;

        // ফাইলটিকে Public করা যাতে ফ্রন্টএন্ডে স্ট্রিম করা যায়
        await driveService.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // ডিরেক্ট ডাউনলোড/স্ট্রিমিং URL তৈরি
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    } catch (error) {
        console.error('Drive Upload Error:', error);
        throw error;
    }
};

export const uploadMedia = async (req, res) => {
    try {
        if (req.user.username !== 'suvro') {
            return res.status(403).json({ message: 'Only Admin (suvro) can upload media' });
        }

        const { title, type } = req.body;

        if (!req.files || !req.files.mediaFile || !req.files.thumbnail) {
            return res.status(400).json({ message: 'Please upload both media file and thumbnail' });
        }

        // ড্রাইভে আপলোড করা হচ্ছে
        const mediaUrl = await uploadToDrive(
            req.files.mediaFile[0].path,
            req.files.mediaFile[0].mimetype,
            req.files.mediaFile[0].originalname
        );

        const thumbnailUrl = await uploadToDrive(
            req.files.thumbnail[0].path,
            req.files.thumbnail[0].mimetype,
            req.files.thumbnail[0].originalname
        );

        // আপলোড শেষ হলে লোকাল সার্ভার থেকে টেম্পোরারি ফাইলগুলো মুছে ফেলা
        fs.unlinkSync(req.files.mediaFile[0].path);
        fs.unlinkSync(req.files.thumbnail[0].path);

        const newMedia = await Media.create({
            title,
            type,
            mediaUrl, // এটি এখন Google Drive এর ডিরেক্ট লিংক
            thumbnailUrl, // এটিও Google Drive এর ডিরেক্ট লিংক
            uploadedBy: req.user._id
        });

        res.status(201).json({ message: 'Uploaded to Google Drive successfully!', media: newMedia });
    } catch (error) {
        console.error(`[Upload Error]: ${error.message}`);
        res.status(500).json({ message: 'Failed to upload media to Drive' });
    }
};

export const getAllMedia = async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.status(200).json(media);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch media' });
    }
};

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