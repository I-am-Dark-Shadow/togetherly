import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie('token', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // Prevents XSS attacks (JS cannot access the cookie)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF protection
        secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
    });
};