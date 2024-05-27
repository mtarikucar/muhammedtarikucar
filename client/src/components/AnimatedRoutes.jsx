import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Upload from "../pages/Upload";
import { AnimatePresence } from "framer-motion";

import Layout from "../layouts/Layout";

import Home from "../pages/Home";
import Category from "../pages/Category";
import Post from "../pages/Post";
import Unauthorized from "../pages/Unautharized";
import {Login} from "./Login.jsx";
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/Category/:id" element={<Category />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Post/:id" element={<Post />} />
          <Route path="/Upload" element={<Upload />} />
          <Route path="/Unauthorized" element={<Unauthorized />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
