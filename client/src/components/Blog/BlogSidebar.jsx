import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Chip,
  Input,
  Button,
  Avatar,
} from '@material-tailwind/react';
import {
  MagnifyingGlassIcon,
  TagIcon,
  FireIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const BlogSidebar = ({ 
  popularPosts = [], 
  recentPosts = [], 
  categories = [], 
  tags = [],
  onSearch 
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
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
    <div className="space-y-6">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader floated={false} shadow={false} className="m-0 p-4 pb-0">
            <Typography variant="h6" color="blue-gray">
              Arama
            </Typography>
          </CardHeader>
          <CardBody className="pt-2">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Blog yazılarında ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                />
                <Button type="submit" size="sm" color="blue">
                  Ara
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader floated={false} shadow={false} className="m-0 p-4 pb-0">
              <div className="flex items-center gap-2">
                <FireIcon className="h-5 w-5 text-red-500" />
                <Typography variant="h6" color="blue-gray">
                  Popüler Yazılar
                </Typography>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <List className="p-0">
                {popularPosts.slice(0, 5).map((post, index) => (
                  <ListItem key={post._id} className="p-2 hover:bg-gray-50">
                    <Link to={`/blog/${post.slug}`} className="w-full">
                      <div className="flex gap-3">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <Typography 
                            variant="small" 
                            color="blue-gray" 
                            className="font-medium line-clamp-2 mb-1"
                          >
                            {post.title}
                          </Typography>
                          <div className="flex items-center gap-2 text-gray-500">
                            <EyeIcon className="h-3 w-3" />
                            <Typography variant="small">
                              {post.views || 0}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ListItem>
                ))}
              </List>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader floated={false} shadow={false} className="m-0 p-4 pb-0">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-500" />
                <Typography variant="h6" color="blue-gray">
                  Son Yazılar
                </Typography>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <List className="p-0">
                {recentPosts.slice(0, 5).map((post, index) => (
                  <ListItem key={post._id} className="p-2 hover:bg-gray-50">
                    <Link to={`/blog/${post.slug}`} className="w-full">
                      <div className="flex gap-3">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <Typography 
                            variant="small" 
                            color="blue-gray" 
                            className="font-medium line-clamp-2 mb-1"
                          >
                            {post.title}
                          </Typography>
                          <Typography variant="small" color="gray">
                            {formatDate(post.publishedAt)}
                          </Typography>
                        </div>
                      </div>
                    </Link>
                  </ListItem>
                ))}
              </List>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader floated={false} shadow={false} className="m-0 p-4 pb-0">
              <Typography variant="h6" color="blue-gray">
                Kategoriler
              </Typography>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <Link key={index} to={`/blog/category/${category._id}`}>
                    <Chip
                      value={`${category._id ? category._id.replace('-', ' ') : 'Genel'} (${category.count || 0})`}
                      color={getCategoryColor(category._id)}
                      className="capitalize cursor-pointer hover:shadow-md transition-shadow"
                    />
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader floated={false} shadow={false} className="m-0 p-4 pb-0">
              <div className="flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-green-500" />
                <Typography variant="h6" color="blue-gray">
                  Etiketler
                </Typography>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 20).map((tag, index) => (
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
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Newsletter Signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardBody>
            <Typography variant="h6" className="mb-2">
              Bültenime Abone Ol
            </Typography>
            <Typography variant="small" className="mb-4 opacity-90">
              Yeni yazılarımdan haberdar olmak için e-posta adresini bırak.
            </Typography>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="E-posta adresin"
                className="!border-white/20 !text-white placeholder:!text-white/70"
                labelProps={{
                  className: "!text-white/70",
                }}
              />
              <Button variant="filled" color="white" fullWidth>
                Abone Ol
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default BlogSidebar;
