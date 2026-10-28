export const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        // Only reveal the stack trace if we are in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};