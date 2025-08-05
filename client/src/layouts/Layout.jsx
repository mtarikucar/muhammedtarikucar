import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Components/Footer";
import MainNavbar from "../components/Navbar/Navbar";
import ChatSidebar from "../components/Chat/ChatSidebar";

const Layout = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set document direction based on language
    const isRTL = i18n.language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavbar />

      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <Footer />
      
      <ChatSidebar />

      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={i18n.language === 'ar'}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
      />
    </div>
  );
};

export default Layout;
