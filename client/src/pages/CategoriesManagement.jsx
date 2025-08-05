import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  IconButton,
  Chip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Alert,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  FolderIcon,
  DocumentTextIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
// import { format } from "date-fns";
// import { tr } from "date-fns/locale";

function CategoriesManagement() {
  const { t } = useTranslation();
  const { currentUser } = useSelector((state) => state.auth);
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'folder'
  });

  // Check if user is admin
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      toast.error('Bu sayfaya erişim yetkiniz yok!');
    }
  }, [currentUser, navigate]);

  // Fetch categories
  const { data: categoriesData, isLoading, error } = useQuery(
    ["categories", currentPage, searchTerm, sortBy],
    async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sort: sortBy
      });
      const response = await axios.get(`/categories?${params}`);
      return response.data.data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const categories = categoriesData?.categories || [];
  const totalPages = Math.ceil((categoriesData?.pagination?.total || 0) / itemsPerPage);

  // Create category mutation
  const createCategoryMutation = useMutation(
    async (categoryData) => {
      const response = await axiosPrivate.post("/categories", categoryData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        toast.success("Kategori başarıyla oluşturuldu!");
        setShowCreateDialog(false);
        resetForm();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || "Kategori oluşturulurken hata oluştu";
        toast.error(errorMessage);
      },
    }
  );

  // Update category mutation
  const updateCategoryMutation = useMutation(
    async ({ id, data }) => {
      const response = await axiosPrivate.put(`/categories/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        toast.success("Kategori başarıyla güncellendi!");
        setShowEditDialog(false);
        setSelectedCategory(null);
        resetForm();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || "Kategori güncellenirken hata oluştu";
        toast.error(errorMessage);
      },
    }
  );

  // Delete category mutation
  const deleteCategoryMutation = useMutation(
    async (id) => {
      const response = await axiosPrivate.delete(`/categories/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        toast.success("Kategori başarıyla silindi!");
        setShowDeleteDialog(false);
        setSelectedCategory(null);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || "Kategori silinirken hata oluştu";
        toast.error(errorMessage);
      },
    }
  );

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'folder'
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Kategori adı gerekli!");
      return;
    }
    createCategoryMutation.mutate(formData);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6',
      icon: category.icon || 'folder',
    });
    setShowEditDialog(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Kategori adı gerekli!");
      return;
    }
    updateCategoryMutation.mutate({
      id: selectedCategory.id,
      data: formData
    });
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory.id);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Icons list
  const iconOptions = [
    { value: 'folder', label: 'Klasör', icon: <FolderIcon className="w-4 h-4" /> },
    { value: 'tag', label: 'Etiket', icon: <TagIcon className="w-4 h-4" /> },
    { value: 'document', label: 'Belge', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { value: 'calendar', label: 'Takvim', icon: <CalendarIcon className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-12 w-12" />
        <Typography className="ml-4">Yükleniyor...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="red" className="max-w-2xl mx-auto mt-8">
        <Typography>
          Kategoriler yüklenirken hata oluştu: {error.message}
        </Typography>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <Card className="mb-8">
        <CardBody>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <Typography variant="h3" color="blue-gray" className="mb-2">
                Kategori Yönetimi
              </Typography>
              <Typography color="gray" className="font-normal">
                Tüm kategorileri buradan yönetebilirsiniz
              </Typography>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
              color="blue"
              size="lg"
            >
              <PlusIcon className="h-5 w-5" />
              Yeni Kategori
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Kategori Ara"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Menu>
                <MenuHandler>
                  <Button variant="outlined" className="flex items-center gap-2">
                    <FunnelIcon className="h-4 w-4" />
                    Sırala
                  </Button>
                </MenuHandler>
                <MenuList>
                  <MenuItem onClick={() => setSortBy("name")}>İsme Göre</MenuItem>
                  <MenuItem onClick={() => setSortBy("createdAt")}>Tarihe Göre</MenuItem>
                  <MenuItem onClick={() => setSortBy("postCount")}>Yazı Sayısına Göre</MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Typography color="blue-gray" className="font-medium">
                Toplam Kategori
              </Typography>
              <Typography variant="h4" color="blue">
                {categoriesData?.pagination?.total || 0}
              </Typography>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Typography color="blue-gray" className="font-medium">
                Aktif Kategoriler
              </Typography>
              <Typography variant="h4" color="green">
                {categories.filter(c => c.isActive).length}
              </Typography>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <Typography color="blue-gray" className="font-medium">
                Toplam Yazı
              </Typography>
              <Typography variant="h4" color="orange">
                {categories.reduce((sum, c) => sum + (c.postCount || 0), 0)}
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <Card 
            key={category.id} 
            className="hover:shadow-lg transition-all duration-300 border-t-4"
            style={{ borderTopColor: category.color || '#3B82F6' }}
          >
            <CardHeader 
              floated={false} 
              className="h-16 flex items-center justify-center"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            >
              <Typography variant="h1" color="white">
                {category.name.charAt(0).toUpperCase()}
              </Typography>
            </CardHeader>
            <CardBody>
              <div className="flex justify-between items-start mb-2">
                <Typography variant="h5" color="blue-gray" className="flex-1">
                  {category.name}
                </Typography>
                <Menu placement="bottom-end">
                  <MenuHandler>
                    <IconButton variant="text" size="sm">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </IconButton>
                  </MenuHandler>
                  <MenuList>
                    <MenuItem 
                      className="flex items-center gap-2"
                      onClick={() => handleEdit(category)}
                    >
                      <PencilIcon className="h-4 w-4" />
                      Düzenle
                    </MenuItem>
                    <MenuItem 
                      className="flex items-center gap-2 text-red-600"
                      onClick={() => handleDelete(category)}
                    >
                      <TrashIcon className="h-4 w-4" />
                      Sil
                    </MenuItem>
                  </MenuList>
                </Menu>
              </div>

              <Typography color="gray" className="font-normal mb-4 line-clamp-2 text-sm">
                {category.description || "Açıklama yok"}
              </Typography>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{category.postCount || 0} yazı</span>
                <span>ID: {category.id.slice(0, 8)}...</span>
              </div>

              {category.createdAt && (
                <Typography variant="small" color="gray" className="mt-2">
                  {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
              )}

              <div className="mt-3 flex items-center gap-2">
                <Chip
                  value={category.isActive ? "Aktif" : "Pasif"}
                  color={category.isActive ? "green" : "gray"}
                  size="sm"
                />
                {category.featured && (
                  <Chip value="Öne Çıkan" color="amber" size="sm" />
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <Card className="mt-8">
          <CardBody className="text-center py-12">
            <FolderIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <Typography variant="h5" color="blue-gray" className="mb-2">
              Kategori Bulunamadı
            </Typography>
            <Typography color="gray" className="font-normal mb-4">
              {searchTerm ? "Arama kriterlerine uygun kategori bulunamadı." : "Henüz kategori oluşturulmamış."}
            </Typography>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 mx-auto"
              color="blue"
            >
              <PlusIcon className="h-4 w-4" />
              İlk Kategoriyi Oluştur
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="text"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Önceki
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <IconButton
              key={i + 1}
              variant={currentPage === i + 1 ? "filled" : "text"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </IconButton>
          ))}
          <Button
            variant="text"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} handler={setShowCreateDialog} size="md">
        <DialogHeader>Yeni Kategori Oluştur</DialogHeader>
        <form onSubmit={handleCreate}>
          <DialogBody divider className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Kategori Adı *
              </Typography>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Teknoloji"
                required
              />
            </div>


            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Açıklama
              </Typography>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kategori açıklaması (isteğe bağlı)"
                rows={3}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Renk
              </Typography>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                İkon
              </Typography>
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: icon.value })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.icon === icon.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {icon.icon}
                  </button>
                ))}
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="space-x-2">
            <Button
              variant="text"
              color="gray"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
              disabled={createCategoryMutation.isLoading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={createCategoryMutation.isLoading || !formData.name.trim()}
            >
              {createCategoryMutation.isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Oluştur"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} handler={setShowEditDialog} size="md">
        <DialogHeader>Kategori Düzenle</DialogHeader>
        <form onSubmit={handleUpdate}>
          <DialogBody divider className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Kategori Adı *
              </Typography>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Teknoloji"
                required
              />
            </div>


            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Açıklama
              </Typography>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kategori açıklaması"
                rows={3}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Renk
              </Typography>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                İkon
              </Typography>
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: icon.value })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.icon === icon.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {icon.icon}
                  </button>
                ))}
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="space-x-2">
            <Button
              variant="text"
              color="gray"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedCategory(null);
                resetForm();
              }}
              disabled={updateCategoryMutation.isLoading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={updateCategoryMutation.isLoading || !formData.name.trim()}
            >
              {updateCategoryMutation.isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Güncelle"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} handler={setShowDeleteDialog} size="md">
        <DialogHeader className="flex items-center gap-2">
          <TrashIcon className="h-6 w-6 text-red-500" />
          <Typography variant="h5" color="red">
            Kategori Sil
          </Typography>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <Typography color="gray" className="text-center">
            <strong className="text-blue-gray-900">{selectedCategory?.name}</strong> kategorisini silmek istediğinizden emin misiniz?
          </Typography>
          
          {selectedCategory?.postCount > 0 ? (
            <Alert color="amber" className="border border-amber-200">
              <div className="flex items-start gap-3">
                <DocumentTextIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <Typography className="font-medium text-amber-800">
                    Dikkat: Bu kategoride {selectedCategory.postCount} yazı bulunmaktadır!
                  </Typography>
                  <Typography variant="small" className="text-amber-700 mt-1">
                    Kategori silindiğinde bu yazılar "Kategorisiz" olarak işaretlenecektir. Bu işlem geri alınamaz.
                  </Typography>
                </div>
              </div>
            </Alert>
          ) : (
            <Alert color="green" className="border border-green-200">
              <div className="flex items-center gap-3">
                <FolderIcon className="h-5 w-5 text-green-600" />
                <Typography variant="small" className="text-green-800">
                  Bu kategori boş olduğu için güvenle silinebilir.
                </Typography>
              </div>
            </Alert>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <Typography variant="small" color="gray" className="text-center">
              Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-2 justify-center">
          <Button
            variant="outlined"
            color="gray"
            onClick={() => {
              setShowDeleteDialog(false);
              setSelectedCategory(null);
            }}
            disabled={deleteCategoryMutation.isLoading}
            className="flex items-center gap-2"
          >
            İptal
          </Button>
          <Button
            color="red"
            onClick={confirmDelete}
            disabled={deleteCategoryMutation.isLoading}
            className="flex items-center gap-2"
          >
            {deleteCategoryMutation.isLoading ? (
              <>
                <Spinner className="h-4 w-4" />
                Siliniyor...
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                Kategoriyi Sil
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </motion.div>
  );
}

export default CategoriesManagement;