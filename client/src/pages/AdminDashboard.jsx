import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Spinner,
} from '@material-tailwind/react';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  HeartIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { currentUser } = useSelector((state) => state.auth);
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [deletePostId, setDeletePostId] = useState(null);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    ['adminStats'],
    async () => {
      const response = await axiosPrivate.get('/analytics/dashboard');
      return response.data.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: currentUser?.role === 'admin',
    }
  );

  // Fetch recent posts
  const { data: recentPosts, isLoading: postsLoading } = useQuery(
    ['adminRecentPosts'],
    async () => {
      const response = await axiosPrivate.get('/posts?limit=5&sort=newest');
      return response.data.data.posts;
    },
    {
      refetchOnWindowFocus: false,
      enabled: currentUser?.role === 'admin',
    }
  );

  // Delete post mutation
  const deleteMutation = useMutation(
    async (postId) => {
      const response = await axiosPrivate.delete(`/posts/${postId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminRecentPosts']);
        queryClient.invalidateQueries(['adminStats']);
        toast.success('Post başarıyla silindi!');
        setDeletePostId(null);
      },
      onError: (error) => {
        console.error('Post delete error:', error);
        const errorMessage = error.response?.data?.message || 'Post silinirken hata oluştu';
        toast.error(errorMessage);
      },
    }
  );

  const handleDeletePost = (postId) => {
    if (window.confirm('Bu postu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      deleteMutation.mutate(postId);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardBody className="text-center">
            <Typography variant="h5" color="red" className="mb-2">
              {t('common.accessDenied')}
            </Typography>
            <Typography color="gray">
              {t('common.adminOnly')}
            </Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: t('admin.totalUsers'),
      value: stats?.totalUsers || 0,
      icon: UserGroupIcon,
      color: 'blue',
      change: '+12%',
    },
    {
      title: t('admin.totalPosts'),
      value: stats?.totalPosts || 0,
      icon: DocumentTextIcon,
      color: 'green',
      change: '+8%',
    },
    {
      title: t('admin.totalViews'),
      value: stats?.totalViews || 0,
      icon: EyeIcon,
      color: 'purple',
      change: '+25%',
    },
    {
      title: t('admin.totalLikes'),
      value: stats?.totalLikes || 0,
      icon: HeartIcon,
      color: 'red',
      change: '+15%',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h3" color="blue-gray">
            {t('admin.dashboard')}
          </Typography>
          <Typography color="gray" className="mt-1">
            {t('admin.welcomeBack')}, {currentUser?.name}
          </Typography>
        </div>
        <Link to="/upload">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            {t('admin.newPost')}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="gray" className="text-sm font-medium">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" color="blue-gray" className="mt-1">
                      {statsLoading ? (
                        <Spinner className="h-6 w-6" />
                      ) : (
                        stat.value.toLocaleString()
                      )}
                    </Typography>
                    <Chip
                      value={stat.change}
                      color="green"
                      size="sm"
                      className="mt-2 w-fit"
                    />
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="blue-gray">
              {t('admin.recentPosts')}
            </Typography>
            <Link to="/blog">
              <Button variant="text" size="sm">
                {t('common.viewAll')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody className="px-0">
          {postsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts?.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <Typography variant="h6" color="blue-gray" className="mb-1">
                      {post.title}
                    </Typography>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <HeartIcon className="h-4 w-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        {post.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      value={post.status}
                      color={post.status === 'published' ? 'green' : 'orange'}
                      size="sm"
                    />
                    <div className="flex items-center gap-1">
                      <Link to={`/post/${post.id}/edit`}>
                        <Button variant="text" size="sm" className="flex items-center gap-1">
                          <PencilSquareIcon className="h-4 w-4" />
                          Düzenle
                        </Button>
                      </Link>
                      <Link to={`/blog/${post.id}`}>
                        <Button variant="text" size="sm">
                          <EyeIcon className="h-4 w-4" />
                          Görüntüle
                        </Button>
                      </Link>
                      <Button 
                        variant="text" 
                        size="sm" 
                        color="red"
                        onClick={() => handleDeletePost(post.id)}
                        className="flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <Typography variant="h6" color="blue-gray">
             {t('admin.quickActions')}
          </Typography>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link to="/admin/categories">
              <Button
                size="lg"
                variant="outlined"
                className="w-full flex items-center justify-center gap-2"
                color="green"
              >
                <DocumentTextIcon className="h-5 w-5" />
                 {t('admin.manageCategories')}
              </Button>
            </Link>
           
            <Link to="/chat">
              <Button
                size="lg"
                variant="outlined"
                className="w-full flex items-center justify-center gap-2"
                color="orange"
                >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                {t('admin.moderateChat')}
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
     
    </motion.div>
  );
};

export default AdminDashboard;