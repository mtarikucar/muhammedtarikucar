const express = require('express');
const router = express.Router();
const {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadFieldFiles,
  deleteUploadedFile,
  getFileInfo,
  listFiles
} = require('../controllers/upload');
const { uploadSingle, uploadMultiple, uploadFields } = require('../middlewares/upload');
const { authenticate, verifyTokenAndAuth } = require('../middlewares/verifyToken');

// Upload single file
router.post('/single', authenticate, uploadSingle('file'), uploadSingleFile);

// Upload multiple files (same field name)
router.post('/multiple', authenticate, uploadMultiple('files', 10), uploadMultipleFiles);

// Upload files with different field names
router.post('/fields', authenticate, uploadFields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 },
  { name: 'audio', maxCount: 3 },
  { name: 'video', maxCount: 2 }
]), uploadFieldFiles);

// Upload for posts (featured image + multiple images)
router.post('/post', authenticate, uploadFields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), uploadFieldFiles);

// Upload for profile (single image)
router.post('/profile', authenticate, uploadSingle('avatar'), uploadSingleFile);

// Upload for chat (images, documents, audio)
router.post('/chat', authenticate, uploadFields([
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 3 },
  { name: 'audio', maxCount: 2 }
]), uploadFieldFiles);

// Get file info
router.get('/info/:category/:filename', getFileInfo);

// List files in category
router.get('/list/:category', authenticate, listFiles);

// Delete file (only file owner or admin)
router.delete('/:category/:filename', verifyTokenAndAuth, deleteUploadedFile);

module.exports = router;
