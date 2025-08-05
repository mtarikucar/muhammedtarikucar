import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

import axios from "../api/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import RichTextEditor from "../components/RichTextEditor";
import { Select, Option, Button, Chip, Input, Textarea, Card, CardBody, Typography, Spinner } from "@material-tailwind/react";

function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const titleRef = useRef();
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { currentUser } = useSelector((store) => store.auth);

  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState("draft");
  const [featured, setFeatured] = useState(false);

  // Fetch post data
  const { data: post, isLoading: postLoading, error } = useQuery(
    ['post', id],
    async () => {
      const response = await axiosPrivate.get(`/posts/id/${id}`);
      return response.data.data.post;
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        // Pre-populate form with existing data
        if (titleRef.current) titleRef.current.value = data.title;
        setContent(data.content || "");
        setCategory(data.category?.id || "");
        setTags(data.tags || []);
        setExcerpt(data.excerpt || "");
        setStatus(data.status || "draft");
        setFeatured(data.featured || false);
      }
    }
  );

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await axiosPrivate.post('/categories', {
        name: newCategory.trim(),
        description: `${newCategory} kategorisi`
      });

      setCategories([...categories, response.data.data.category]);
      setCategory(response.data.data.category.id);
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

  // Update post mutation
  const updateMutation = useMutation(
    async (postData) => {
      const response = await axiosPrivate.put(`/posts/${id}`, postData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
        queryClient.invalidateQueries(['post', id]);
        toast.success("Yazı başarıyla güncellendi!");
        navigate(`/admin/dashboard`);
      },
      onError: (error) => {
        console.error("Post update error:", error);
        const errorMessage = error.response?.data?.message || "Yazı güncellenirken hata oluştu";
        toast.error(errorMessage);
      },
    }
  );

  // Delete post mutation
  const deleteMutation = useMutation(
    async () => {
      const response = await axiosPrivate.delete(`/posts/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
        toast.success("Yazı başarıyla silindi!");
        navigate(`/admin/dashboard`);
      },
      onError: (error) => {
        console.error("Post delete error:", error);
        const errorMessage = error.response?.data?.message || "Yazı silinirken hata oluştu";
        toast.error(errorMessage);
      },
    }
  );

  const handleUpdate = async (e) => {
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
      // Prepare post data
      const postData = {
        title: titleRef.current.value,
        content: content,
        excerpt: excerpt || content?.replace(/<[^>]*>/g, '').substring(0, 200) + "...",
        categoryId: category,
        tags: tags,
        status: status,
        featured: featured
      };

      // Update post
      updateMutation.mutate(postData);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Yazı güncellenirken hata oluştu!');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bu yazıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      deleteMutation.mutate();
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        setCategories(response.data.data?.categories || response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  if (postLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h4" color="red" className="mb-2">
            Hata!
          </Typography>
          <Typography color="gray">
            {error.response?.data?.message || "Yazı yüklenirken hata oluştu"}
          </Typography>
          <Button 
            onClick={() => navigate('/admin/dashboard')} 
            className="mt-4"
            variant="outlined"
          >
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h4" color="gray" className="mb-2">
            Yazı Bulunamadı
          </Typography>
          <Button 
            onClick={() => navigate('/admin/dashboard')} 
            className="mt-4"
            variant="outlined"
          >
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Geri
              </Button>
              <div>
                <Typography variant="h5" color="blue-gray">
                  Yazıyı Düzenle
                </Typography>
                <Typography variant="small" color="gray">
                  {post.title}
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                color="red"
                variant="outlined"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
                className="flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                {deleteMutation.isLoading ? 'Siliniyor...' : 'Sil'}
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isLoading}
                size="sm"
                className="min-w-[100px]"
              >
                {updateMutation.isLoading ? 'Kaydediliyor...' : 'Güncelle'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Editor */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardBody className="p-6">
                {/* Title */}
                <div className="mb-6">
                  <Input
                    label="Başlık"
                    size="lg"
                    inputRef={titleRef}
                    className="text-xl"
                    defaultValue={post.title}
                  />
                </div>

                {/* Excerpt */}
                <div className="mb-6">
                  <Textarea
                    label="Özet (İsteğe bağlı)"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Content Editor */}
                <RichTextEditor 
                  content={content} 
                  setContent={setContent} 
                  placeholder="Hikayenizi anlatın..." 
                />
              </CardBody>
            </Card>
          </div>

          {/* Right: Settings */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardBody>
                <Typography variant="h6" className="mb-4">
                  Yayın Ayarları
                </Typography>
                
                <div className="space-y-4">
                  <Select
                    label="Durum"
                    value={status}
                    onChange={(value) => setStatus(value)}
                  >
                    <Option value="draft">Taslak</Option>
                    <Option value="published">Yayınlandı</Option>
                    <Option value="scheduled">Zamanlandı</Option>
                  </Select>

                  {currentUser?.role === 'admin' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="featured" className="text-sm text-gray-700">
                        Öne çıkan yazı
                      </label>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Category */}
            <Card>
              <CardBody>
                <Typography variant="h6" className="mb-4">
                  Kategori
                </Typography>
                
                <div className="space-y-4">
                  <Select
                    label="Kategori Seçin"
                    value={category}
                    onChange={(value) => setCategory(value)}
                    selected={(element) =>
                      element &&
                      React.cloneElement(element, {
                        disabled: true,
                        className:
                          "flex items-center opacity-100 px-0 gap-2 pointer-events-none",
                      })
                    }
                  >
                    {categories.map((cat) => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>

                  {/* Add New Category */}
                  <div className="flex gap-2">
                    <Input
                      label="Yeni kategori"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      size="sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim()}
                      className="shrink-0"
                    >
                      Ekle
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Tags */}
            <Card>
              <CardBody>
                <Typography variant="h6" className="mb-4">
                  Etiketler
                </Typography>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      label="Etiket ekle"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      size="sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      className="shrink-0"
                    >
                      Ekle
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Chip
                        key={index}
                        value={tag}
                        onClose={() => handleRemoveTag(tag)}
                        className="cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostEdit;