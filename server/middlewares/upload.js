const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./errorHandler');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
    }
  } catch (error) {
    console.warn(`Warning: Could not create directory ${dirPath}:`, error.message);
  }
};

// Create upload directories
const uploadDir = path.join(__dirname, '../uploads');
const imageDir = path.join(uploadDir, 'images');
const documentDir = path.join(uploadDir, 'documents');
const audioDir = path.join(uploadDir, 'audio');
const videoDir = path.join(uploadDir, 'video');

// Try to create directories, but don't fail if they already exist
ensureDirectoryExists(uploadDir);
ensureDirectoryExists(imageDir);
ensureDirectoryExists(documentDir);
ensureDirectoryExists(audioDir);
ensureDirectoryExists(videoDir);

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath = imageDir;
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath = audioDir;
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = videoDir;
    } else {
      uploadPath = documentDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    // Video
    'video/mp4',
    'video/mpeg',
    'video/quicktime'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images, documents, audio and video files are allowed.', 'VALIDATION_ERROR', 400), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File too large. Maximum size is 10MB.', 'VALIDATION_ERROR', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError('Too many files. Maximum is 10 files.', 'VALIDATION_ERROR', 400));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new AppError('Unexpected field name.', 'VALIDATION_ERROR', 400));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File too large. Maximum size is 10MB.', 'VALIDATION_ERROR', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError('Too many files. Maximum is 10 files.', 'VALIDATION_ERROR', 400));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new AppError('Unexpected field name.', 'VALIDATION_ERROR', 400));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

// Middleware for mixed file upload (different field names)
const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File too large. Maximum size is 10MB.', 'VALIDATION_ERROR', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError('Too many files. Maximum is 10 files.', 'VALIDATION_ERROR', 400));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new AppError('Unexpected field name.', 'VALIDATION_ERROR', 400));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

// Helper function to get file URL
const getFileUrl = (req, filename, type = 'images') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Helper function to delete file
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  getFileUrl,
  deleteFile,
  uploadDir,
  imageDir,
  documentDir,
  audioDir,
  videoDir
};
