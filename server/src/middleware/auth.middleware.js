import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // Fetch user but exclude the password hash
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(`[Auth Middleware] Error: ${error.message}`);
        // If JWT expires or is malformed, it throws an error we catch here
        res.status(401).json({ message: 'Unauthorized: Token validation failed' });
    }
};