import React from "react";
import { Outlet } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SpeedDialWithTextOutside } from "./Components/SpeedDialWithTextOutside";
import Footer from "./Components/Footer";
import NavbarCustom from "./Components/NavbarCustom";

const Layout = () => {
  return (
    <>
      <div className="flex flex-no-wrap">
        <div className="container mx-auto py-10  md:w-4/5 w-11/12 px-6 h-full p-4">
          <NavbarCustom />
          <Outlet />
        </div>
      </div>
      <Footer />

      <SpeedDialWithTextOutside />
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        
      />
    </>
  );
};

export default Layout;
