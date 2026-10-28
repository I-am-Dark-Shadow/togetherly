import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateTokenAndSetCookie } from '../utils/jwt.js';
import { registerSchema, loginSchema } from '../utils/validationSchemas.js';

export const register = async (req, res) => {
    try {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.errors[0].message });
        }

        const { username, password } = validation.data;

        // Case-insensitive username check
        const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Hash password with cost factor 12
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({ username, passwordHash });
        await newUser.save();

        generateTokenAndSetCookie(newUser._id, res);

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            avatarUrl: newUser.avatarUrl,
            favorites: newUser.favorites || [], // <--- NEW
        });
    } catch (error) {
        console.error(`[Auth] Register Error: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const login = async (req, res) => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.errors[0].message });
        }

        const { username, password } = validation.data;

        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            favorites: user.favorites || [], // <--- NEW
        });
    } catch (error) {
        console.error(`[Auth] Login Error: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie('token', '', { maxAge: 0 });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(`[Auth] Logout Error: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getMe = (req, res) => {
    // req.user is populated by the protectRoute middleware
    res.status(200).json(req.user);
};