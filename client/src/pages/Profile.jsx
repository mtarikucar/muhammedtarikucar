import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Avatar,
  Typography,
  Button,
  Spinner,
} from "@material-tailwind/react";
import Posts from "../components/Post/Posts";

function Profile() {
  const { id } = useParams();
  const { currentUser } = useSelector((store) => store.auth);
  const [activeTab, setActiveTab] = useState("posts");
  const isOwnProfile = currentUser && currentUser._id === id;

  const { data: user, isLoading } = useQuery(
    ["user", id],
    () => {
      return axios.get(`/users/${id}`).then((res) => res.data[0]);
    },
    {
      enabled: !!id,
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          User not found
        </Typography>
        <Typography color="gray" className="font-normal">
          The user you're looking for doesn't exist or has been removed.
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
      <Card className="mb-8 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-primary-500 to-primary-700"></div>
        <CardBody className="relative px-6 -mt-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar
              src={user.image || `https://ui-avatars.com/api/?name=${user.name}`}
              alt={user.name}
              size="xxl"
              className="border-4 border-white"
            />
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
              <Typography variant="h4" color="blue-gray" className="mb-1">
                {user.name}
              </Typography>
              <Typography color="blue-gray" className="font-normal opacity-70 mb-4">
                {user.email}
              </Typography>
              {user.bio && (
                <Typography color="gray" className="font-normal mb-4 max-w-4xl">
                  {user.bio}
                </Typography>
              )}
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.href = "/settings"}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
        <TabsHeader>
          <Tab value="posts">Posts</Tab>
          <Tab value="about">About</Tab>
          {isOwnProfile && <Tab value="saved">Saved</Tab>}
        </TabsHeader>
        <TabsBody>
          <TabPanel value="posts" className="py-4">
            <div className="grid grid-cols-1 gap-6">
              <Posts userId={id} />
            </div>
          </TabPanel>
          <TabPanel value="about">
            <Card>
              <CardBody>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  About {user.name}
                </Typography>
                <div className="space-y-4">
                  <div>
                    <Typography variant="small" className="font-medium text-gray-700">
                      Email
                    </Typography>
                    <Typography variant="paragraph" className="font-normal">
                      {user.email}
                    </Typography>
                  </div>
                  {user.gender && user.gender !== "not selected" && (
                    <div>
                      <Typography variant="small" className="font-medium text-gray-700">
                        Gender
                      </Typography>
                      <Typography variant="paragraph" className="font-normal capitalize">
                        {user.gender}
                      </Typography>
                    </div>
                  )}
                  {user.bio && (
                    <div>
                      <Typography variant="small" className="font-medium text-gray-700">
                        Bio
                      </Typography>
                      <Typography variant="paragraph" className="font-normal">
                        {user.bio}
                      </Typography>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </TabPanel>
          {isOwnProfile && (
            <TabPanel value="saved">
              <div className="text-center py-12">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Saved Posts
                </Typography>
                <Typography color="gray" className="font-normal">
                  You haven't saved any posts yet.
                </Typography>
              </div>
            </TabPanel>
          )}
        </TabsBody>
      </Tabs>
    </motion.div>
  );
}

export default Profile;
