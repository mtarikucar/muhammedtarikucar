import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Typography,
  Button,
  Card,
  CardBody,
  Chip,
} from '@material-tailwind/react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  EyeIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const BlogHero = ({ featuredPost }) => {
  if (!featuredPost) return null;

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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative mb-16"
    >
      <Card className="relative overflow-hidden h-96 md:h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={featuredPost.featuredImage || '/default-blog-hero.jpg'}
            alt={featuredPost.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        {/* Content Overlay */}
        <CardBody className="relative z-10 flex flex-col justify-end h-full text-white p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Category Badge */}
            <div className="mb-4">
              <Chip
                value={featuredPost.category.replace('-', ' ')}
                color={getCategoryColor(featuredPost.category)}
                className="capitalize mb-2"
              />
              <Chip
                value="Öne Çıkan Yazı"
                color="red"
                className="ml-2"
              />
            </div>

            {/* Title */}
            <Typography 
              variant="h2" 
              className="mb-4 text-white font-bold leading-tight"
            >
              {featuredPost.title}
            </Typography>

            {/* Excerpt */}
            <Typography 
              variant="lead" 
              className="mb-6 text-gray-200 max-w-3xl"
            >
              {featuredPost.excerpt}
            </Typography>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-300">
              <div className="flex items-center gap-2">
                <img
                  src={featuredPost.author?.image || '/default-avatar.png'}
                  alt={featuredPost.author?.name}
                  className="w-8 h-8 rounded-full"
                />
                <Typography variant="small" className="font-medium">
                  {featuredPost.author?.name}
                </Typography>
              </div>
              
              <div className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4" />
                <Typography variant="small">
                  {formatDate(featuredPost.publishedAt)}
                </Typography>
              </div>
              
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <Typography variant="small">
                  {featuredPost.readingTime} dakika okuma
                </Typography>
              </div>
              
              <div className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4" />
                <Typography variant="small">
                  {featuredPost.views || 0} görüntülenme
                </Typography>
              </div>
            </div>

            {/* Tags */}
            {featuredPost.tags && featuredPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {featuredPost.tags.slice(0, 4).map((tag, index) => (
                  <Chip
                    key={index}
                    value={tag}
                    size="sm"
                    variant="ghost"
                    className="text-white border-white/30"
                  />
                ))}
              </div>
            )}

            {/* Read More Button */}
            <Link to={`/blog/${featuredPost.slug}`}>
              <Button 
                color="white" 
                variant="filled"
                size="lg"
                className="flex items-center gap-2 hover:shadow-lg transition-shadow"
              >
                Yazıyı Oku
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default BlogHero;
