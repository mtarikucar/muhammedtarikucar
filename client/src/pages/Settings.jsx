import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import axios from "../api/axios";
import { loginSuccess } from "../store/AuthSlice";
import { toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Textarea,
  Button,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Select,
  Option,
  Avatar,
} from "@material-tailwind/react";

function Settings() {
  const { currentUser } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form state
  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [gender, setGender] = useState(currentUser?.gender || "not selected");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile update mutation
  const updateProfileMutation = useMutation(
    async (profileData) => {
      const response = await axios.put(`/users/${currentUser._id}`, profileData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Update the Redux store with the new user data
        dispatch(loginSuccess({
          ...currentUser,
          user: {
            ...currentUser,
            name: data.updatedUser.name,
            bio: data.updatedUser.bio,
            gender: data.updatedUser.gender,
          }
        }));
        toast.success("Profile updated successfully");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update profile");
      },
    }
  );

  // Password update mutation
  const updatePasswordMutation = useMutation(
    async (passwordData) => {
      const response = await axios.put(`/users/${currentUser._id}/password`, passwordData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update password");
      },
    }
  );

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name,
      bio,
      gender,
    });
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          Not Authorized
        </Typography>
        <Typography color="gray" className="font-normal">
          You need to be logged in to access this page.
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
      <Typography variant="h3" color="blue-gray" className="mb-6">
        Account Settings
      </Typography>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
        <TabsHeader>
          <Tab value="profile">Profile</Tab>
          <Tab value="password">Password</Tab>
          <Tab value="preferences">Preferences</Tab>
        </TabsHeader>
        <TabsBody>
          <TabPanel value="profile">
            <Card className="w-full max-w-3xl mx-auto">
              <CardHeader
                color="blue"
                className="mb-4 grid h-28 place-items-center"
              >
                <Typography variant="h3" color="white">
                  Edit Profile
                </Typography>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <div className="flex justify-center mb-4">
                  <Avatar
                    src={currentUser.image || `https://ui-avatars.com/api/?name=${currentUser.name}`}
                    alt={currentUser.name}
                    size="xxl"
                    className="border-2 border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-6">
                  <Input
                    label="Name"
                    size="lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Textarea
                    label="Bio"
                    size="lg"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <Select
                    label="Gender"
                    value={gender}
                    onChange={(value) => setGender(value)}
                  >
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="not selected">Prefer not to say</Option>
                  </Select>
                </div>
              </CardBody>
              <CardFooter className="pt-0">
                <Button
                  variant="gradient"
                  onClick={handleProfileUpdate}
                  fullWidth
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? "Updating..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>
          <TabPanel value="password">
            <Card className="w-full max-w-3xl mx-auto">
              <CardHeader
                color="blue"
                className="mb-4 grid h-28 place-items-center"
              >
                <Typography variant="h3" color="white">
                  Change Password
                </Typography>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <Input
                  type="password"
                  label="Current Password"
                  size="lg"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  type="password"
                  label="New Password"
                  size="lg"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  size="lg"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </CardBody>
              <CardFooter className="pt-0">
                <Button
                  variant="gradient"
                  onClick={handlePasswordUpdate}
                  fullWidth
                  disabled={updatePasswordMutation.isLoading}
                >
                  {updatePasswordMutation.isLoading ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>
          <TabPanel value="preferences">
            <Card className="w-full max-w-3xl mx-auto">
              <CardHeader
                color="blue"
                className="mb-4 grid h-28 place-items-center"
              >
                <Typography variant="h3" color="white">
                  Preferences
                </Typography>
              </CardHeader>
              <CardBody>
                <Typography color="gray" className="mb-8 font-normal text-center">
                  Preference settings will be available soon.
                </Typography>
              </CardBody>
            </Card>
          </TabPanel>
        </TabsBody>
      </Tabs>
    </motion.div>
  );
}

export default Settings;
