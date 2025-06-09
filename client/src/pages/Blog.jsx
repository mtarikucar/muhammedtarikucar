import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from '../api/axios';
import {
  Typography,
  Button,
  Spinner,
  Select,
  Option,
  Input,
} from '@material-tailwind/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import BlogCard from '../components/Blog/BlogCard';
import BlogSidebar from '../components/Blog/BlogSidebar';

const Blog = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'publishedAt');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Fetch posts with filters
  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['posts', currentPage, sortBy, searchParams.get('category'), searchParams.get('tag'), searchParams.get('search')],
    () => {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      params.append('sort', sortBy);
      
      if (searchParams.get('category')) {
        params.append('category', searchParams.get('category'));
      }
      if (searchParams.get('tag')) {
        params.append('tag', searchParams.get('tag'));
      }
      if (searchParams.get('search')) {
        params.append('search', searchParams.get('search'));
      }

      return axios.get(`/posts?${params.toString()}`).then((res) => res.data.data);
    },
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  // Fetch popular posts for sidebar
  const { data: popularPosts } = useQuery(
    ['popularPosts'],
    () => axios.get('/posts/popular?limit=5').then((res) => res.data.data.posts),
    { refetchOnWindowFocus: false }
  );

  // Fetch recent posts for sidebar
  const { data: recentPosts } = useQuery(
    ['recentPosts'],
    () => axios.get('/posts/recent?limit=5').then((res) => res.data.data.posts),
    { refetchOnWindowFocus: false }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('search', searchTerm.trim());
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    newParams.set('page', '1');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('publishedAt');
    setCurrentPage(1);
    setSearchParams({});
  };

  const categories = [
    { name: t('home.categories.technology'), slug: 'technology' },
    { name: t('home.categories.programming'), slug: 'programming' },
    { name: t('home.categories.webDevelopment'), slug: 'web-development' },
    { name: t('home.categories.mobile'), slug: 'mobile' },
    { name: t('home.categories.ai'), slug: 'ai' },
    { name: t('home.categories.career'), slug: 'career' },
    { name: t('home.categories.personal'), slug: 'personal' },
    { name: t('home.categories.tutorial'), slug: 'tutorial' },
  ];

  const currentCategory = searchParams.get('category');
  const currentTag = searchParams.get('tag');
  const currentSearch = searchParams.get('search');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h1" color="blue-gray" className="mb-4">
            {t("nav.blog")}
          </Typography>
          <Typography variant="lead" color="gray" className="max-w-3xl mx-auto">
            {t("blog.description") || "Teknoloji, programlama ve kişisel deneyimlerim hakkında yazılar"}
          </Typography>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t("blog.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                />
                <Button type="submit" size="sm" color="blue">
                  {t("blog.searchButton")}
                </Button>
              </div>
            </form>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <Select
                value={sortBy}
                onChange={handleSortChange}
                className="min-w-[150px]"
              >
                <Option value="publishedAt">{t("blog.sortNewest")}</Option>
                <Option value="views">{t("blog.sortPopular")}</Option>
                <Option value="likes">{t("blog.sortLiked")}</Option>
                <Option value="title">{t("blog.sortAlphabetic")}</Option>
              </Select>
            </div>

            {/* Clear Filters */}
            {(currentCategory || currentTag || currentSearch) && (
              <Button
                variant="outlined"
                size="sm"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                {t("blog.clearFilters")}
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {(currentCategory || currentTag || currentSearch) && (
            <div className="flex flex-wrap gap-2 items-center">
              <Typography variant="small" color="gray">
                Aktif filtreler:
              </Typography>
              {currentCategory && (
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Kategori: {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                </div>
              )}
              {currentTag && (
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  Etiket: {currentTag}
                </div>
              )}
              {currentSearch && (
                <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                  Arama: "{currentSearch}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {postsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner className="h-12 w-12" />
              </div>
            ) : postsData?.posts?.length > 0 ? (
              <>
                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {postsData.posts.map((post) => (
                    <BlogCard key={post._id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {postsData.pagination && postsData.pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <Button
                      variant="outlined"
                      size="sm"
                      disabled={!postsData.pagination.hasPrev}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Önceki
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: postsData.pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === postsData.pagination.totalPages || 
                          Math.abs(page - currentPage) <= 2
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 py-1 text-gray-500">...</span>
                            )}
                            <Button
                              variant={page === currentPage ? "filled" : "outlined"}
                              size="sm"
                              color={page === currentPage ? "blue" : "blue-gray"}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}
                    </div>

                    <Button
                      variant="outlined"
                      size="sm"
                      disabled={!postsData.pagination.hasNext}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Sonraki
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Typography variant="h4" color="gray" className="mb-4">
                  Yazı bulunamadı
                </Typography>
                <Typography color="gray">
                  Arama kriterlerinize uygun blog yazısı bulunamadı.
                </Typography>
                <Button
                  variant="outlined"
                  color="blue"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Tüm Yazıları Görüntüle
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar
              popularPosts={popularPosts || []}
              recentPosts={recentPosts || []}
              categories={categories.map(cat => ({ _id: cat.slug, count: 0 }))}
              tags={[]}
              onSearch={(term) => {
                setSearchTerm(term);
                const newParams = new URLSearchParams(searchParams);
                newParams.set('search', term);
                newParams.set('page', '1');
                setSearchParams(newParams);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Blog;
