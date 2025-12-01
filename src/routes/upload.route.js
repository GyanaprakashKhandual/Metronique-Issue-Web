import express from 'express';
import upload from '../configs/multer.config.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import validateUploadMiddleware from '../middlewares/upload.middleware.js';
import FileUploadController from '../controllers/upload.controller.js';

const router = express.Router();

// Upload single file
router.post('/upload', authenticate, upload.single('file'), validateUploadMiddleware, FileUploadController.uploadSingleFile);

// Upload multiple files (max 10)
router.post('/upload-multiple', authenticate, upload.array('files', 10), validateUploadMiddleware, FileUploadController.uploadMultipleFiles);

// Get all files
router.get('/files', authenticate, FileUploadController.getFiles);

// Get files by type (image, video, document)
router.get('/files/type/:fileType', authenticate, FileUploadController.getFilesByType);

// Delete single file
router.delete('/delete/:fileId', authenticate, FileUploadController.deleteFile);

// Delete multiple files
router.post('/delete-multiple', authenticate, FileUploadController.deleteMultipleFiles);

// Get file statistics
router.get('/stats', authenticate, FileUploadController.getFileStats);

export default router;