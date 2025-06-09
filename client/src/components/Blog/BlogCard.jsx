import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Chip,
  Avatar,
} from '@material-tailwind/react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  EyeIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

const BlogCard = ({ post, featured = false }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={`h-full ${featured ? 'md:col-span-2' : ''}`}
    >
      <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
        {post.featuredImage && (
          <CardHeader 
            floated={false} 
            className={`relative ${featured ? 'h-64' : 'h-48'} m-0 rounded-b-none`}
          >
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {featured && (
              <div className="absolute top-4 left-4">
                <Chip
                  value="Öne Çıkan"
                  color="red"
                  className="text-white font-bold"
                />
              </div>
            )}
            <div className="absolute top-4 right-4">
              <Chip
                value={post.category ? post.category.replace('-', ' ') : 'Genel'}
                color={getCategoryColor(post.category)}
                className="capitalize"
              />
            </div>
          </CardHeader>
        )}
        
        <CardBody className="flex-1 p-6">
          <div className="mb-4">
            <Typography 
              variant={featured ? "h4" : "h5"} 
              color="blue-gray" 
              className="mb-2 line-clamp-2 hover:text-blue-600 transition-colors"
            >
              <Link to={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </Typography>
            
            <Typography 
              color="gray" 
              className={`line-clamp-3 ${featured ? 'text-base' : 'text-sm'}`}
            >
              {post.excerpt}
            </Typography>
          </div>

          {/* Author and Meta Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Avatar
                src={post.author?.image || '/default-avatar.svg'}
                alt={post.author?.name}
                size="sm"
              />
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  {post.author?.name}
                </Typography>
                <div className="flex items-center space-x-1 text-gray-500">
                  <CalendarDaysIcon className="h-3 w-3" />
                  <Typography variant="small">
                    {formatDate(post.publishedAt)}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  value={tag}
                  size="sm"
                  variant="ghost"
                  color="blue-gray"
                  className="text-xs"
                />
              ))}
              {post.tags.length > 3 && (
                <Chip
                  value={`+${post.tags.length - 3}`}
                  size="sm"
                  variant="ghost"
                  color="gray"
                  className="text-xs"
                />
              )}
            </div>
          )}
        </CardBody>

        <CardFooter className="pt-0 px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <Typography variant="small">
                  {post.readingTime} dk
                </Typography>
              </div>
              <div className="flex items-center space-x-1">
                <EyeIcon className="h-4 w-4" />
                <Typography variant="small">
                  {post.views || 0}
                </Typography>
              </div>
              <div className="flex items-center space-x-1">
                <HeartIcon className="h-4 w-4" />
                <Typography variant="small">
                  {post.likes || 0}
                </Typography>
              </div>
            </div>
          </div>

          <Link to={`/blog/${post.slug}`}>
            <Button 
              color="blue" 
              variant="gradient" 
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              Devamını Oku
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
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default BlogCard;
