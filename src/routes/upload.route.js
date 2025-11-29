import express from 'express';
import upload from '../configs/multer.config.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import validateUploadMiddleware from '../middlewares/upload.middleware.js';
import FileUploadController from '../controllers/upload.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: File Upload
 *     description: File upload and management operations
 */

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     summary: Upload a single file
 *     description: Upload a single file to the server
 *     tags:
 *       - File Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 50MB)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 data:
 *                   $ref: '#/components/schemas/File'
 *       400:
 *         description: No file uploaded or invalid file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File size exceeds limit
 *       415:
 *         description: Unsupported file type
 *       500:
 *         description: File upload failed
 */
router.post(
    '/upload',
    authenticate,
    upload.single('file'),
    validateUploadMiddleware,
    FileUploadController.uploadSingleFile
);

/**
 * @swagger
 * /api/v1/files/upload-multiple:
 *   post:
 *     summary: Upload multiple files
 *     description: Upload up to 10 files at once
 *     tags:
 *       - File Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 10 files, 50MB each)
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Files upload failed
 */
router.post(
    '/upload-multiple',
    authenticate,
    upload.array('files', 10),
    validateUploadMiddleware,
    FileUploadController.uploadMultipleFiles
);

/**
 * @swagger
 * /api/v1/files/files:
 *   get:
 *     summary: Get all files
 *     description: Retrieve all files uploaded by the authenticated user
 *     tags:
 *       - File Upload
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *                 count:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch files
 */
router.get(
    '/files',
    authenticate,
    FileUploadController.getFiles
);

/**
 * @swagger
 * /api/v1/files/files/type/{fileType}:
 *   get:
 *     summary: Get files by type
 *     description: Retrieve files of a specific type
 *     tags:
 *       - File Upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileType
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [image, video, document]
 *         description: File type to filter
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *                 count:
 *                   type: number
 *                 fileType:
 *                   type: string
 *       400:
 *         description: Invalid file type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch files
 */
router.get(
    '/files/type/:fileType',
    authenticate,
    FileUploadController.getFilesByType
);

/**
 * @swagger
 * /api/v1/files/delete/{fileId}:
 *   delete:
 *     summary: Delete a file
 *     description: Delete a specific file by ID
 *     tags:
 *       - File Upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 *       500:
 *         description: Failed to delete file
 */
router.delete(
    '/delete/:fileId',
    authenticate,
    FileUploadController.deleteFile
);

/**
 * @swagger
 * /api/v1/files/delete-multiple:
 *   post:
 *     summary: Delete multiple files
 *     description: Delete multiple files at once
 *     tags:
 *       - File Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileIds
 *             properties:
 *               fileIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d5ec49c1234567890abc12", "60d5ec49c1234567890abc13"]
 *     responses:
 *       200:
 *         description: Files deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Please provide file IDs
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No files found
 *       500:
 *         description: Failed to delete files
 */
router.post(
    '/delete-multiple',
    authenticate,
    FileUploadController.deleteMultipleFiles
);

/**
 * @swagger
 * /api/v1/files/stats:
 *   get:
 *     summary: Get file statistics
 *     description: Retrieve statistics about uploaded files
 *     tags:
 *       - File Upload
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFiles:
 *                       type: number
 *                     totalSize:
 *                       type: number
 *                     totalSizeFormatted:
 *                       type: string
 *                     byType:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get file statistics
 */
router.get(
    '/stats',
    authenticate,
    FileUploadController.getFileStats
);

export default router;