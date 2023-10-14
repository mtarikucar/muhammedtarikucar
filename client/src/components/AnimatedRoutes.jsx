import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Upload from "../pages/Upload";
import { AnimatePresence } from "framer-motion";

import Layout from "../layouts/Layout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Category from "../pages/Category";
import Post from "../pages/Post";
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Category/:id" element={<Category />} />
          <Route path="/Post/:id" element={<Post />} />
          <Route path="/Upload" element={<Upload />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
