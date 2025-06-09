import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { ArrowUpIcon } from "@heroicons/react/20/solid";

import axios from "../api/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useFileUpload from "../hooks/useFileUpload";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { toast } from "react-toastify";

import RichTextEditor from "../components/RichTextEditor";

import { Select, Option } from "@material-tailwind/react";

function Upload() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const {
    uploadForPost,
    isUploading,
    uploadProgress,
    resetUpload
  } = useFileUpload();

  const titleRef = useRef();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [categories, setCategories] = useState([]);

  const { currentUser } = useSelector((store) => store.auth);

  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [excerpt, setExcerpt] = useState("");


  // Handle file upload for images
  const handleFileUpload = (event) => {
    const newFiles = [...event.target.files].map((file) => {
      const url = URL.createObjectURL(file);
      return { id: uuidv4(), url, file };
    });
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Handle featured image upload
  const handleFeaturedImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFeaturedImageFile(file);
    }
  };

  // Remove file from list
  const removeFile = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await axiosPrivate.post('/categories', {
        name: newCategory.trim(),
        description: `${newCategory} kategorisi`
      });

      setCategories([...categories, response.data.data.category]);
      setCategory(response.data.data.category._id);
      setNewCategory("");
      toast.success("Kategori başarıyla eklendi!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Kategori eklenirken hata oluştu";
      toast.error(errorMessage);
      console.error('Category creation error:', error);
    }
  };

  // Add new tag
  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;

    setTags([...tags, newTag.trim()]);
    setNewTag("");
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (postData) => {
      const response = await axiosPrivate.post("/posts", postData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
        toast.success("Yazı başarıyla yayınlandı!");
        resetUpload(); // Reset upload state
        navigate(`/`);
      },
      onError: (error) => {
        console.error("Post creation error:", error);
        const errorMessage = error.response?.data?.message || "Yazı yayınlanırken hata oluştu";
        toast.error(errorMessage);
      },
    }
  );



  const handleClick = async (e) => {
    e.preventDefault();

    // Validation
    if (!titleRef.current.value.trim()) {
      toast.error("Başlık gerekli!");
      return;
    }
    if (!content) {
      toast.error("İçerik gerekli!");
      return;
    }
    if (!category) {
      toast.error("Kategori seçimi gerekli!");
      return;
    }

    try {
      let uploadedFileData = null;

      // Upload files if any
      if (featuredImageFile || files.length > 0) {
        const imageFiles = files.map(f => f.file);
        uploadedFileData = await uploadForPost(featuredImageFile, imageFiles);
      }

      // Prepare post data
      const postData = {
        title: titleRef.current.value,
        content: content,
        excerpt: excerpt || content?.substring(0, 200) + "...",
        category: category,
        tags: tags,
        status: 'published'
      };

      // Add uploaded file URLs if available
      if (uploadedFileData) {
        if (uploadedFileData.featuredImage && uploadedFileData.featuredImage[0]) {
          postData.featuredImage = uploadedFileData.featuredImage[0].url;
        }
        if (uploadedFileData.images && uploadedFileData.images.length > 0) {
          postData.images = uploadedFileData.images;
        }
      }

      // Create post
      mutation.mutate(postData);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Dosya yükleme hatası!');
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        setCategories(response.data.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);


  return (
    <>
      <div className="container p-4 w-3/4 flex justify-center items-center md:w-full ">
        <div className="container mx-auto mt-8 ">
          <div className="grid grid-cols-1 gap-4  ">
            <div className="col-span-1 border-2 rounded-lg p-4 ">
              {/* Featured Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öne Çıkan Görsel
                </label>
                <label className="flex flex-col items-center px-4 py-6 bg-white rounded-md shadow-md tracking-wide border border-blue cursor-pointer hover:bg-gray-200">
                  <ArrowUpIcon className="w-8 h-8 mb-2" />
                  <span className="text-base leading-normal">
                    Öne çıkan görsel seç
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFeaturedImageUpload}
                    accept="image/*"
                  />
                </label>
                {featuredImageFile && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(featuredImageFile)}
                      alt="Featured"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                    <p className="text-sm text-gray-600 mt-1">{featuredImageFile.name}</p>
                  </div>
                )}
              </div>

              {/* Multiple Images Upload */}
              <div className="flex justify-center mb-4">
                <label className="flex flex-col items-center px-4 py-6 bg-white rounded-md shadow-md tracking-wide border border-blue cursor-pointer hover:bg-gray-200">
                  {isUploading ? (
                    <div className="text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{uploadProgress}% Yükleniyor...</span>
                    </div>
                  ) : (
                    <>
                      <ArrowUpIcon className="w-8 h-8 mb-2" />
                      <span className="text-base leading-normal">
                        Ek görseller seç
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        multiple
                        accept="image/*"
                      />
                    </>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-transparent">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="relative rounded-xl bg-transparent"
                  >
                    <img
                      src={file.url}
                      alt={file.file.name}
                      className="w-full h-auto rounded-xl bg-transparent"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 rounded-xl">
                      <span className="text-white text-sm text-center px-2">{file.file.name}</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 border-2 rounded-lg p-4">
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlık
                </label>
                <input
                  className="w-full border-2 p-3 rounded-md border-gray-300 focus:border-blue-500 focus:outline-none"
                  type="text"
                  name="title"
                  id="title"
                  ref={titleRef}
                  placeholder="Yazı başlığını buraya yazın..."
                />
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Seç
                </label>
                <Select
                  label="Kategori Seçin"
                  value={category}
                  onChange={(value) => setCategory(value)}
                  variant="outlined"
                >
                  {categories.map((cat, index) => (
                    <Option key={index} value={cat._id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Add New Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Kategori Ekle
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Kategori adı"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ekle
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiketler
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Etiket ekle"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ekle
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özet (İsteğe bağlı)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Yazının kısa özeti..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <RichTextEditor setContent={setContent} />
              <div className="flex flex-row justify-end md:justify-center">
                <button
                  className="border-4 rounded-md px-6 py-2 border-gray-500 hover:bg-gray-500 hover:text-white ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleClick}
                  disabled={isUploading || mutation.isLoading}
                >
                  {isUploading || mutation.isLoading ? 'Yayınlanıyor...' : 'Yayınla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Upload;
