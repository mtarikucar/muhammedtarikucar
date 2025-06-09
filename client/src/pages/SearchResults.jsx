import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import axios from "../api/axios";
import {
  Typography,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Spinner,
} from "@material-tailwind/react";
import Posts from "../components/Post/Posts";

function SearchResults() {
  const { t } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState("posts");

  // Reset active tab when query changes
  useEffect(() => {
    setActiveTab("posts");
  }, [query]);

  const { data: searchResults, isLoading } = useQuery(
    ["search", query],
    () => {
      return axios.get(`/search?q=${encodeURIComponent(query)}`).then((res) => res.data);
    },
    {
      enabled: !!query,
      refetchOnWindowFocus: false,
    }
  );

  // For now, we'll simulate search results since the API endpoint might not exist
  const simulatedResults = {
    posts: [],
    users: [],
    categories: []
  };

  // Use actual results if available, otherwise use simulated results
  const results = searchResults || simulatedResults;

  if (!query) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          {t("search.noQuery")}
        </Typography>
        <Typography color="gray" className="font-normal">
          {t("search.noQueryDesc")}
        </Typography>
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
        <Typography variant="h3" color="blue-gray" className="mb-2">
          {t("search.resultsFor")}
        </Typography>
        <Typography color="gray" className="font-normal">
          {t("search.resultsFor")}: <span className="font-medium">"{query}"</span>
        </Typography>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="h-12 w-12" />
        </div>
      ) : (
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
          <TabsHeader>
            <Tab value="posts">
              {t("search.posts")} {results.posts && `(${results.posts.length})`}
            </Tab>
            <Tab value="users">
              {t("search.users")} {results.users && `(${results.users.length})`}
            </Tab>
            <Tab value="categories">
              {t("search.categories")} {results.categories && `(${results.categories.length})`}
            </Tab>
          </TabsHeader>
          <TabsBody>
            <TabPanel value="posts" className="py-4">
              {/* For now, we'll just display all posts and filter client-side */}
              <Posts searchQuery={query} />
            </TabPanel>
            <TabPanel value="users">
              <div className="text-center py-12">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  User search coming soon
                </Typography>
                <Typography color="gray" className="font-normal">
                  This feature is under development.
                </Typography>
              </div>
            </TabPanel>
            <TabPanel value="categories">
              <div className="text-center py-12">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Category search coming soon
                </Typography>
                <Typography color="gray" className="font-normal">
                  This feature is under development.
                </Typography>
              </div>
            </TabPanel>
          </TabsBody>
        </Tabs>
      )}
    </motion.div>
  );
}

export default SearchResults;
