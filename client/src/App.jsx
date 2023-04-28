import Home from "./pages/Home";

import Portfolio from "./pages/Portfolio";

import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebars from "./layouts/Sidebars";
import Blog from "./pages/Blog";
import Upload from "./pages/Upload";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Detail from "./pages/Detail";
import Community from "./pages/Community";
import Chat from "./pages/Chat";

function App() {
  return (
    <div className="bg-gray-50">
      <Sidebars />
      <Routes>

        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Community/:id" element={<Community />} />
        <Route path="/Chat" element={<Chat />} />
        <Route path="/Blog/:id" element={<Detail />} />
        <Route path="/Blog" element={<Blog />} />
        <Route path="/Profile/:id" element={<Profile />} />
        <Route path="/Upload" element={<Upload />} />
        <Route path="/Portfolio" element={<Portfolio />} />
        
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
