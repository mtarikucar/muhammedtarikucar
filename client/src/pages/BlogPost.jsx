import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import {
  Typography,
  Button,
  Chip,
  Avatar,
  Card,
  CardBody,
  Spinner,
  Input,
  Textarea,
} from '@material-tailwind/react';
import {
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import BlogSidebar from '../components/Blog/BlogSidebar';

const BlogPost = () => {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    website: '',
    text: ''
  });

  // Fetch post data
  const { data: post, isLoading: postLoading } = useQuery(
    ['post', id],
    () => axios.get(`/posts/${id}`).then((res) => res.data.data.post),
    {
      refetchOnWindowFocus: false,
      enabled: !!id,
    }
  );

  // Fetch related posts for sidebar
  const { data: popularPosts } = useQuery(
    ['popularPosts'],
    () => axios.get('/posts/popular?limit=5').then((res) => res.data.data.posts),
    { refetchOnWindowFocus: false }
  );

  const { data: recentPosts } = useQuery(
    ['recentPosts'],
    () => axios.get('/posts/recent?limit=5').then((res) => res.data.data.posts),
    { refetchOnWindowFocus: false }
  );

  // Track page view
  useEffect(() => {
    if (post) {
      axios.post('/analytics/track', {
        path: `/blog/${id}`,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      }).catch(console.error);
    }
  }, [post, id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'technology': 'blue',
      'programming': 'green',
      'web-development': 'purple',
      'mobile': 'orange',
      'ai': 'red',
      'career': 'indigo',
      'personal': 'pink',
      'tutorial': 'teal'
    };
    return colors[category] || 'gray';
  };

  const handleLike = async () => {
    try {
      await axios.post(`/posts/${id}/like`);
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/posts/${id}/comments`, commentForm);
      setCommentForm({ name: '', email: '', website: '', text: '' });
      setShowCommentForm(false);
      // Show success message
      alert('Yorumunuz başarıyla gönderildi! Onaylandıktan sonra görünür olacak.');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Yorum gönderilirken bir hata oluştu.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Typography variant="h3" color="gray" className="mb-4">
          Yazı bulunamadı
        </Typography>
        <Link to="/blog">
          <Button color="blue" variant="outlined">
            Blog'a Dön
          </Button>
        </Link>
      </div>
    );
  }

  const approvedComments = post.comments?.filter(comment => comment.isApproved) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/blog">
            <Button variant="text" color="blue" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Blog'a Dön
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article>
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="mb-8">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Post Header */}
              <header className="mb-8">
                {/* Category */}
                <div className="mb-4">
                  <Chip
                    value={post.category?.name || post.category || 'Genel'}
                    color={getCategoryColor(post.category?.id || post.category)}
                    className="capitalize"
                  />
                </div>

                {/* Title */}
                <Typography variant="h1" color="blue-gray" className="mb-6">
                  {post.title}
                </Typography>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={post.author?.image || '/default-avatar.svg'}
                      alt={post.author?.name}
                      size="sm"
                    />
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        {post.author?.name}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <Typography variant="small">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <Typography variant="small">
                      {post.readingTime || 1} dakika okuma
                    </Typography>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    <Typography variant="small">
                      {post.views || 0} görüntülenme
                    </Typography>
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag, index) => (
                      <Link key={index} to={`/blog?tag=${tag}`}>
                        <Chip
                          value={tag}
                          size="sm"
                          variant="ghost"
                          color="blue-gray"
                          className="cursor-pointer hover:bg-blue-gray-50 transition-colors"
                        />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <Button
                    variant={liked ? "filled" : "outlined"}
                    color="red"
                    size="sm"
                    onClick={handleLike}
                    className="flex items-center gap-2"
                  >
                    {liked ? (
                      <HeartSolidIcon className="h-4 w-4" />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                    {post.likes || 0}
                  </Button>

                  <Button
                    variant="outlined"
                    color="blue"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <ShareIcon className="h-4 w-4" />
                    Paylaş
                  </Button>

                  <Button
                    variant="outlined"
                    color="green"
                    size="sm"
                    onClick={() => setShowCommentForm(!showCommentForm)}
                    className="flex items-center gap-2"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    Yorum Yap
                  </Button>
                </div>
              </header>

              {/* Post Content */}
              <div className="prose prose-lg max-w-none mb-12">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              {/* Comments Section */}
              <section className="border-t pt-8">
                <Typography variant="h4" color="blue-gray" className="mb-6">
                  Yorumlar ({approvedComments.length})
                </Typography>

                {/* Comment Form */}
                {showCommentForm && (
                  <Card className="mb-8">
                    <CardBody>
                      <Typography variant="h6" color="blue-gray" className="mb-4">
                        Yorum Yap
                      </Typography>
                      <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Adınız *"
                            value={commentForm.name}
                            onChange={(e) => setCommentForm({...commentForm, name: e.target.value})}
                            required
                          />
                          <Input
                            label="E-posta *"
                            type="email"
                            value={commentForm.email}
                            onChange={(e) => setCommentForm({...commentForm, email: e.target.value})}
                            required
                          />
                        </div>
                        <Input
                          label="Website (opsiyonel)"
                          value={commentForm.website}
                          onChange={(e) => setCommentForm({...commentForm, website: e.target.value})}
                        />
                        <Textarea
                          label="Yorumunuz *"
                          value={commentForm.text}
                          onChange={(e) => setCommentForm({...commentForm, text: e.target.value})}
                          required
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" color="blue">
                            Yorum Gönder
                          </Button>
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() => setShowCommentForm(false)}
                          >
                            İptal
                          </Button>
                        </div>
                      </form>
                    </CardBody>
                  </Card>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {approvedComments.map((comment) => (
                    <div key={comment._id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          {comment.name}
                        </Typography>
                        <Typography variant="small" color="gray">
                          {formatDate(comment.createdAt)}
                        </Typography>
                      </div>
                      <Typography color="gray">
                        {comment.text}
                      </Typography>
                    </div>
                  ))}
                  
                  {approvedComments.length === 0 && (
                    <Typography color="gray" className="text-center py-8">
                      Henüz yorum yapılmamış. İlk yorumu siz yapın!
                    </Typography>
                  )}
                </div>
              </section>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar
              popularPosts={popularPosts || []}
              recentPosts={recentPosts || []}
              categories={[]}
              tags={[]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogPost;
