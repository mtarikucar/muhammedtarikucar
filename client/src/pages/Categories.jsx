import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";

function Categories() {
  const { data: categories, isLoading } = useQuery(
    ["categories"],
    () => {
      return axios.get("/event").then((res) => res.data);
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-12 w-12" />
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
      <div className="mb-8 text-center">
        <Typography variant="h2" color="blue-gray" className="mb-2">
          Categories
        </Typography>
        <Typography color="gray" className="font-normal">
          Browse posts by category
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && categories.map((category) => (
          <Card key={category._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                {category.title}
              </Typography>
              <Typography color="gray" className="font-normal mb-6 line-clamp-3">
                {category.content || "Explore posts in this category"}
              </Typography>
              <div className="flex justify-end">
                <Button
                  variant="text"
                  color="blue"
                  className="flex items-center gap-2"
                  as={Link}
                  to={`/Category/${category._id}`}
                >
                  View Posts
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
            No categories found
          </Typography>
          <Typography color="gray" className="font-normal">
            Check back later for new categories.
          </Typography>
        </div>
      )}
    </motion.div>
  );
}

export default Categories;
