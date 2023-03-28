import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Portfolio from "./pages/Portfolio";

import React from "react";
import { Routes, Route } from "react-router-dom";
import Detail from "./pages/Detail";
import Upload from "./pages/Upload";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Sidebars from "./layouts/Sidebars";
function App() {
  return (
    <>
      <Sidebars />
      <Routes>
        <Route path="/Upload" element={<Upload />} />
        <Route path="/Blog" element={<Blog />} />
        <Route path="/Blog/:id" element={<Detail />} />
        <Route path="/Auth/Login" element={<Auth />} />
        <Route path="/Auth/Register" element={<Auth />} />
        <Route path="/Profile/:id" element={<Profile />} />
        <Route path="/Portfolio" element={<Portfolio />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
