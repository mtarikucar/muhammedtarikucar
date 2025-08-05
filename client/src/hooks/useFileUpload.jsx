import { useState } from 'react';
import useAxiosPrivate from './useAxiosPrivate';
import { toast } from 'react-toastify';

const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  // Upload single file
  const uploadSingle = async (file, endpoint = '/upload/single') => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosPrivate.post(`${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.status === 'success') {
        const uploadedFile = response.data.data.file;
        setUploadedFiles(prev => [...prev, uploadedFile]);
        toast.success('File uploaded successfully');
        return uploadedFile;
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Upload failed';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload multiple files
  const uploadMultiple = async (files, endpoint = '/upload/multiple') => {
    if (!files || files.length === 0) {
      toast.error('No files selected');
      return [];
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axiosPrivate.post(`/api${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.status === 'success') {
        const uploadedFilesList = response.data.data.files;
        setUploadedFiles(prev => [...prev, ...uploadedFilesList]);
        toast.success(`${uploadedFilesList.length} files uploaded successfully`);
        return uploadedFilesList;
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Upload failed';
      toast.error(errorMessage);
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload files with different field names
  const uploadFields = async (fileFields, endpoint = '/upload/fields') => {
    if (!fileFields || Object.keys(fileFields).length === 0) {
      toast.error('No files selected');
      return {};
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    
    // Add files to form data with their field names
    Object.entries(fileFields).forEach(([fieldName, files]) => {
      if (Array.isArray(files)) {
        files.forEach(file => {
          formData.append(fieldName, file);
        });
      } else if (files) {
        formData.append(fieldName, files);
      }
    });

    try {
      const response = await axiosPrivate.post(`/api${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.status === 'success') {
        const uploadedFileFields = response.data.data.files;
        
        // Flatten uploaded files for state management
        const allFiles = [];
        Object.values(uploadedFileFields).forEach(fieldFiles => {
          if (Array.isArray(fieldFiles)) {
            allFiles.push(...fieldFiles);
          }
        });
        
        setUploadedFiles(prev => [...prev, ...allFiles]);
        toast.success('Files uploaded successfully');
        return uploadedFileFields;
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Upload failed';
      toast.error(errorMessage);
      return {};
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload for posts (featured image + multiple images)
  const uploadForPost = async (featuredImage, images) => {
    const fileFields = {};
    
    if (featuredImage) {
      fileFields.featuredImage = featuredImage;
    }
    
    if (images && images.length > 0) {
      fileFields.images = Array.from(images);
    }

    return await uploadFields(fileFields, '/upload/post');
  };

  // Upload for profile
  const uploadForProfile = async (avatarFile) => {
    return await uploadSingle(avatarFile, '/upload/profile');
  };

  // Upload for chat
  const uploadForChat = async (fileFields) => {
    return await uploadFields(fileFields, '/upload/chat');
  };

  // Delete file
  const deleteFile = async (filename, category = 'images') => {
    try {
      const response = await axiosPrivate.delete(`/api/upload/${category}/${filename}`);
      
      if (response.data.status === 'success') {
        // Remove from uploaded files state
        setUploadedFiles(prev => 
          prev.filter(file => file.filename !== filename)
        );
        toast.success('File deleted successfully');
        return true;
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 'Delete failed';
      toast.error(errorMessage);
      return false;
    }
  };

  // Reset upload state
  const resetUpload = () => {
    setUploadProgress(0);
    setIsUploading(false);
    setUploadedFiles([]);
  };

  // Get file info
  const getFileInfo = async (filename, category = 'images') => {
    try {
      const response = await axiosPrivate.get(`/api/upload/info/${category}/${filename}`);
      return response.data.data.file;
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  };

  // List files
  const listFiles = async (category = 'images', page = 1, limit = 20) => {
    try {
      const response = await axiosPrivate.get(`/api/upload/list/${category}?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('List files error:', error);
      return { files: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  };

  return {
    uploadProgress,
    isUploading,
    uploadedFiles,
    uploadSingle,
    uploadMultiple,
    uploadFields,
    uploadForPost,
    uploadForProfile,
    uploadForChat,
    deleteFile,
    resetUpload,
    getFileInfo,
    listFiles,
    setUploadedFiles
  };
};

export default useFileUpload;
