const fileUpload = require('express-fileupload');

// File upload middleware configuration
const fileUploadMiddleware = fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
    useTempFiles: true,
    tempFileDir: '/tmp/',
    debug: process.env.NODE_ENV === 'development',
    safeFileNames: true,
    preserveExtension: true,
});

module.exports = fileUploadMiddleware;
