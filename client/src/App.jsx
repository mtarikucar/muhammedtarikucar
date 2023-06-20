import React from "react";
import { Routes, Route,NavLink } from "react-router-dom";

import Sidebars from "./layouts/Sidebars";

import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Blog from "./pages/Blog";
import Upload from "./pages/Upload";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Detail from "./pages/Detail";
import Community from "./pages/Community";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Todos from "./pages/Todos";

import MessageBoxButton from "./components/MessageBoxButton";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useSelector } from "react-redux";
function App() {

  const {currentUser} = useSelector((store) => store.auth);
  return (
    <div className="">
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
        <Route path="/Notifications" element={<Notifications />} />
        <Route path="/Todos" element={<Todos />} />
        <Route path="/" element={<Home />} />
      </Routes>
      <NavLink to={"/Todos"}>
        <pre className="fixed bottom-2 left-2 text-gray-400 text-sm cursor-copy">
          @beta-0.0/muhammedtarikucar.com
        </pre>
      </NavLink>
      {currentUser &&
      <MessageBoxButton/>
    }
    <ToastContainer />
    </div>
  );
}

export default App;
