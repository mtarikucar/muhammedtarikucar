import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import axios from "../api/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PlusIcon } from "@heroicons/react/24/outline";

function Categories() {
  const { t } = useTranslation();
  const { currentUser } = useSelector((state) => state.auth);
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const { data: categoriesData, isLoading } = useQuery(
    ["categories"],
    () => {
      return axios.get("/categories").then((res) => res.data.data);
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const categories = categoriesData?.categories || [];

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
        setNewCategory({ name: '', description: '', color: '#3B82F6' });
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || "Kategori oluşturulurken hata oluştu";
        toast.error(errorMessage);
      },
    }
  );

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error("Kategori adı gerekli!");
      return;
    }
    createCategoryMutation.mutate(newCategory);
  };

  const isAdmin = currentUser?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-12 w-12" />
        <Typography className="ml-4">{t("common.loading")}</Typography>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="h2" color="blue-gray" className="mb-2">
              {t("categories.title")}
            </Typography>
            <Typography color="gray" className="font-normal">
              {t("categories.manageCategoriesDesc")}
            </Typography>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
              color="blue"
            >
              <PlusIcon className="h-4 w-4" />
              Kategori Oluştur
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && categories.map((category) => (
          <Card 
            key={category.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow"
            style={{ borderTop: `4px solid ${category.color || '#3B82F6'}` }}
          >
            <CardBody>
              <div className="flex items-center justify-between mb-2">
                <Typography variant="h5" color="blue-gray">
                  {category.name || category.title}
                </Typography>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: category.color || '#3B82F6' }}
                >
                  <span className="text-white text-sm font-bold">
                    {category.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <Typography color="gray" className="font-normal mb-6 line-clamp-3">
                {category.description || category.content || t("categories.noDescription")}
              </Typography>
              <div className="flex justify-between items-center">
                <Typography variant="small" color="gray">
                  {category.postCount || 0} yazı
                </Typography>
                <Button
                  variant="text"
                  color="blue"
                  className="flex items-center gap-2"
                  onClick={() => navigate(`/blog?category=${category.id}`)}
                >
                  {t("blog.viewAllPosts")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                    />
                  </svg>
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {(!categories || categories.length === 0) && (
        <div className="text-center py-12">
          <Typography variant="h5" color="blue-gray" className="mb-2">
            {t("categories.noCategoriesFound")}
          </Typography>
          <Typography color="gray" className="font-normal">
            {t("categories.createFirstCategory")}
          </Typography>
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} handler={setShowCreateDialog} size="md">
        <DialogHeader>Yeni Kategori Oluştur</DialogHeader>
        <form onSubmit={handleCreateCategory}>
          <DialogBody className="space-y-4">
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Kategori Adı *
              </Typography>
              <Input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Kategori adını girin"
                required
              />
            </div>

            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Açıklama
              </Typography>
              <Textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Kategori açıklaması (isteğe bağlı)"
                rows={3}
              />
            </div>

            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Renk
              </Typography>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-12 h-12 rounded border border-gray-300"
                />
                <Input
                  type="text"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="space-x-2">
            <Button
              variant="text"
              color="red"
              onClick={() => setShowCreateDialog(false)}
              disabled={createCategoryMutation.isLoading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={createCategoryMutation.isLoading || !newCategory.name.trim()}
            >
              {createCategoryMutation.isLoading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </motion.div>
  );
}

export default Categories;
