const path = require('path');
const fs = require('fs');
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const { getFileUrl, deleteFile } = require('../middlewares/upload');

// Upload single file
const uploadSingleFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 'VALIDATION_ERROR', 400));
    }

    const file = req.file;
    const fileType = file.mimetype.split('/')[0]; // image, audio, video, application
    
    // Determine file category for URL generation
    let category = 'documents';
    if (fileType === 'image') category = 'images';
    else if (fileType === 'audio') category = 'audio';
    else if (fileType === 'video') category = 'video';

    const fileUrl = getFileUrl(req, file.filename, category);

    const fileData = {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: fileUrl,
      type: fileType,
      category: category,
      path: file.path
    };

    logger.info(`File uploaded successfully: ${file.originalname}`);

    res.json({
      status: 'success',
      message: 'File uploaded successfully',
      data: { file: fileData }
    });
  } catch (error) {
    logger.error('Single file upload error:', error);
    next(error);
  }
};

// Upload multiple files
const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 'VALIDATION_ERROR', 400));
    }

    const uploadedFiles = req.files.map(file => {
      const fileType = file.mimetype.split('/')[0];
      
      let category = 'documents';
      if (fileType === 'image') category = 'images';
      else if (fileType === 'audio') category = 'audio';
      else if (fileType === 'video') category = 'video';

      const fileUrl = getFileUrl(req, file.filename, category);

      return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        type: fileType,
        category: category,
        path: file.path
      };
    });

    logger.info(`${uploadedFiles.length} files uploaded successfully`);

    res.json({
      status: 'success',
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: { files: uploadedFiles }
    });
  } catch (error) {
    logger.error('Multiple files upload error:', error);
    next(error);
  }
};

// Upload files with different field names
const uploadFieldFiles = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new AppError('No files uploaded', 'VALIDATION_ERROR', 400));
    }

    const uploadedFiles = {};

    for (const fieldName in req.files) {
      uploadedFiles[fieldName] = req.files[fieldName].map(file => {
        const fileType = file.mimetype.split('/')[0];
        
        let category = 'documents';
        if (fileType === 'image') category = 'images';
        else if (fileType === 'audio') category = 'audio';
        else if (fileType === 'video') category = 'video';

        const fileUrl = getFileUrl(req, file.filename, category);

        return {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: fileUrl,
          type: fileType,
          category: category,
          path: file.path
        };
      });
    }

    logger.info(`Files uploaded successfully for fields: ${Object.keys(uploadedFiles).join(', ')}`);

    res.json({
      status: 'success',
      message: 'Files uploaded successfully',
      data: { files: uploadedFiles }
    });
  } catch (error) {
    logger.error('Field files upload error:', error);
    next(error);
  }
};

// Delete file
const deleteUploadedFile = async (req, res, next) => {
  try {
    const { filename, category = 'images' } = req.params;

    if (!filename) {
      return next(new AppError('Filename is required', 'VALIDATION_ERROR', 400));
    }

    // Construct file path
    const uploadDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadDir, category, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(new AppError('File not found', 'NOT_FOUND', 404));
    }

    // Delete file
    await deleteFile(filePath);

    logger.info(`File deleted successfully: ${filename}`);

    res.json({
      status: 'success',
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error('Delete file error:', error);
    next(error);
  }
};

// Get file info
const getFileInfo = async (req, res, next) => {
  try {
    const { filename, category = 'images' } = req.params;

    if (!filename) {
      return next(new AppError('Filename is required', 'VALIDATION_ERROR', 400));
    }

    // Construct file path
    const uploadDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadDir, category, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(new AppError('File not found', 'NOT_FOUND', 404));
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileUrl = getFileUrl(req, filename, category);

    const fileInfo = {
      filename: filename,
      size: stats.size,
      url: fileUrl,
      category: category,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };

    res.json({
      status: 'success',
      data: { file: fileInfo }
    });
  } catch (error) {
    logger.error('Get file info error:', error);
    next(error);
  }
};

// List files in a category
const listFiles = async (req, res, next) => {
  try {
    const { category = 'images' } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const uploadDir = path.join(__dirname, '../uploads');
    const categoryDir = path.join(uploadDir, category);

    // Check if category directory exists
    if (!fs.existsSync(categoryDir)) {
      return res.json({
        status: 'success',
        data: { files: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
      });
    }

    // Read directory
    const files = fs.readdirSync(categoryDir);
    
    // Get file info for each file
    const fileInfos = files.map(filename => {
      const filePath = path.join(categoryDir, filename);
      const stats = fs.statSync(filePath);
      const fileUrl = getFileUrl(req, filename, category);

      return {
        filename: filename,
        size: stats.size,
        url: fileUrl,
        category: category,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    });

    // Sort by creation date (newest first)
    fileInfos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFiles = fileInfos.slice(startIndex, endIndex);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: fileInfos.length,
      pages: Math.ceil(fileInfos.length / limit)
    };

    res.json({
      status: 'success',
      data: { 
        files: paginatedFiles,
        pagination: pagination
      }
    });
  } catch (error) {
    logger.error('List files error:', error);
    next(error);
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadFieldFiles,
  deleteUploadedFile,
  getFileInfo,
  listFiles
};
