import multer from 'multer';
import fs from 'fs';
import path from 'path';
import uploadConfig from './upload.config';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = uploadConfig.uploadFolder;

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const uniqueName = `${timestamp}-${random}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${uploadConfig.allowedExtensions.join(', ')}`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: uploadConfig.maxFileSize
    }
});

export default upload;