import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layout
import Layout from "../layouts/Layout";

// Pages
import Home from "../pages/Home";
import Blog from "../pages/Blog";
import BlogPost from "../pages/BlogPost";
import Category from "../pages/Category";
import Post from "../pages/Post";
import Upload from "../pages/Upload";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Categories from "../pages/Categories";
import SearchResults from "../pages/SearchResults";
import About from "../pages/About";
import Chat from "../pages/Chat";
import AdminDashboard from "../pages/AdminDashboard";
import Unauthorized from "../pages/Unautharized";
import NotFound from "../pages/NotFound";

// Components
import { Login } from "./Login.jsx";
import { Register } from "./Register.jsx";
import RequireAuth from "../hooks/RequireAuth";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/blog/category/:category" element={<Blog />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<RequireAuth />}>
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/chat" element={<Chat />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<RequireAuth allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Catch all route - must be last */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
