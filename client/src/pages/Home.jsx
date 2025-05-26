import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import {
  Typography,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Spinner,
  Chip,
  Avatar,
} from "@material-tailwind/react";
import BlogHero from "../components/Blog/BlogHero";
import BlogCard from "../components/Blog/BlogCard";
import BlogSidebar from "../components/Blog/BlogSidebar";
import {
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HeartIcon,
  BookOpenIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

function Home() {
  // Fetch featured posts
  const { data: featuredPosts, isLoading: featuredLoading } = useQuery(
    ["featuredPosts"],
    () => {
      return axios.get("/posts/featured?limit=1").then((res) => res.data.data.posts);
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch recent posts
  const { data: recentPosts, isLoading: recentLoading } = useQuery(
    ["recentPosts"],
    () => {
      return axios.get("/posts/recent?limit=6").then((res) => res.data.data.posts);
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch popular posts
  const { data: popularPosts, isLoading: popularLoading } = useQuery(
    ["popularPosts"],
    () => {
      return axios.get("/posts/popular?limit=5").then((res) => res.data.data.posts);
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const categories = [
    { name: 'Teknoloji', icon: CpuChipIcon, slug: 'technology', color: 'blue' },
    { name: 'Programlama', icon: CodeBracketIcon, slug: 'programming', color: 'green' },
    { name: 'Web Geliştirme', icon: WrenchScrewdriverIcon, slug: 'web-development', color: 'purple' },
    { name: 'Mobil', icon: DevicePhoneMobileIcon, slug: 'mobile', color: 'orange' },
    { name: 'Yapay Zeka', icon: CpuChipIcon, slug: 'ai', color: 'red' },
    { name: 'Kariyer', icon: BriefcaseIcon, slug: 'career', color: 'indigo' },
    { name: 'Kişisel', icon: HeartIcon, slug: 'personal', color: 'pink' },
    { name: 'Eğitim', icon: AcademicCapIcon, slug: 'tutorial', color: 'teal' },
  ];

  const isLoading = featuredLoading || recentLoading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero Section with Featured Post */}
      {featuredPosts && featuredPosts.length > 0 && (
        <BlogHero featuredPost={featuredPosts[0]} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <div className="flex justify-center mb-6">
                <Avatar
                  src="/profile-photo.jpg"
                  alt="Muhammed Tarik Ucar"
                  size="xxl"
                  className="border-4 border-white shadow-xl"
                />
              </div>
              <Typography variant="h2" color="blue-gray" className="mb-4">
                Merhaba, Ben Muhammed Tarik Ucar
              </Typography>
              <Typography variant="lead" color="gray" className="max-w-3xl mx-auto mb-6">
                Yazılım geliştirici, teknoloji tutkunu ve sürekli öğrenen biriyim.
                Bu blogda teknoloji, programlama ve kişisel deneyimlerimi paylaşıyorum.
              </Typography>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/blog">
                  <Button color="blue" variant="gradient" size="lg">
                    Blog Yazılarını Keşfet
                  </Button>
                </Link>
                <Link to="/about">
                  <Button color="blue" variant="outlined" size="lg">
                    Hakkımda
                  </Button>
                </Link>
              </div>
            </motion.section>

            {/* Recent Posts Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-8">
                <Typography variant="h3" color="blue-gray">
                  Son Yazılar
                </Typography>
                <Link to="/blog">
                  <Button variant="text" color="blue" className="flex items-center gap-2">
                    Tümünü Gör
                    <BookOpenIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner className="h-12 w-12" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentPosts && recentPosts.slice(0, 4).map((post) => (
                    <BlogCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </motion.section>

            {/* Categories Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-8">
                <Typography variant="h3" color="blue-gray">
                  Kategoriler
                </Typography>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <motion.div
                      key={category.slug}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Link to={`/blog/category/${category.slug}`}>
                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                          <CardBody className="text-center p-6">
                            <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${category.color}-100 flex items-center justify-center`}>
                              <IconComponent className={`h-6 w-6 text-${category.color}-600`} />
                            </div>
                            <Typography variant="h6" color="blue-gray">
                              {category.name}
                            </Typography>
                          </CardBody>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar
              popularPosts={popularPosts || []}
              recentPosts={recentPosts || []}
              categories={categories.map(cat => ({ _id: cat.slug, count: 0 }))}
              tags={[]}
            />
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white"
        >
          <div className="max-w-3xl mx-auto text-center">
            <Typography variant="h3" className="mb-4">
              Bültenime Abone Ol
            </Typography>
            <Typography variant="lead" className="mb-8 opacity-90">
              Yeni yazılarımdan, projelerimden ve duyurularımdan haberdar olmak için
              e-posta adresini bırak.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresin"
                className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
              <Button color="white" variant="filled" size="lg" className="text-blue-600">
                Abone Ol
              </Button>
            </div>
            <Typography variant="small" className="mt-4 opacity-75">
              Spam yapmıyoruz. İstediğin zaman abonelikten çıkabilirsin.
            </Typography>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

export default Home;
