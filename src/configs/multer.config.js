import multer from 'multer';
import fs from 'fs';
import path from 'path';
import uploadConfig from './upload.config.js';  // 👈 Add .js here

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = uploadConfig.uploadFolder;
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed.`), false);
    }
};

export default multer({
    storage,
    fileFilter,
    limits: { fileSize: uploadConfig.maxFileSize }
});
