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
} from "@material-tailwind/react";
import { CardWithLink } from "../components/CardWithLink";

function Home() {
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    ["categories"],
    () => {
      return axios.get("/event").then((res) => res.data);
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: featuredPosts, isLoading: postsLoading } = useQuery(
    ["featuredPosts"],
    () => {
      return axios.get("/posts").then((res) => res.data.slice(0, 3));
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const isLoading = categoriesLoading || postsLoading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-16"
    >
      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <Typography variant="h1" color="white" className="mb-6">
            Welcome to My Blog
          </Typography>
          <Typography variant="lead" color="white" className="mb-8 opacity-80">
            Explore my thoughts, projects, and experiences in technology, development, and more.
          </Typography>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" color="white" variant="filled" as={Link} to="/categories">
              Explore Categories
            </Button>
            <Button size="lg" color="white" variant="outlined" as={Link} to="/about">
              About Me
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <Typography variant="h3" color="blue-gray">
            Featured Posts
          </Typography>
          <Button variant="text" color="blue" as={Link} to="/blog">
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="h-12 w-12" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts && featuredPosts.map((post) => (
              <Card key={post._id} className="overflow-hidden">
                <CardHeader
                  floated={false}
                  shadow={false}
                  color="transparent"
                  className="m-0 h-40 bg-gray-200"
                >
                  {post.materials && post.materials[0] && (
                    <img
                      src={post.materials[0].url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </CardHeader>
                <CardBody>
                  <Typography variant="h5" color="blue-gray" className="mb-2 line-clamp-1">
                    {post.title}
                  </Typography>
                  <Typography color="gray" className="font-normal mb-4 line-clamp-3">
                    {post.content}
                  </Typography>
                </CardBody>
                <CardFooter className="pt-0">
                  <Button
                    variant="text"
                    color="blue"
                    className="flex items-center gap-2"
                    as={Link}
                    to={`/post/${post._id}`}
                  >
                    Read More
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
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <Typography variant="h3" color="blue-gray">
            Categories
          </Typography>
          <Button variant="text" color="blue" as={Link} to="/categories">
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="h-12 w-12" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories && categories.map((category) => (
              <CardWithLink key={category._id} post={category} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-100 rounded-xl p-8">
        <div className="max-w-3xl mx-auto text-center">
          <Typography variant="h4" color="blue-gray" className="mb-4">
            Subscribe to My Newsletter
          </Typography>
          <Typography color="gray" className="font-normal mb-6">
            Stay updated with my latest posts, projects, and announcements.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button color="blue">Subscribe</Button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default Home;
