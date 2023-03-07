import React from "react";
import logo from "../assets/images/astronout.png";
import logo1 from "../assets/images/astronout1.png";
import bg from "../assets/images/bg.jpg";
import Navbar from "../layouts/Navbar";
import "../styles.css";

function Header() {
  return (
    <>
      <div
        id="home"
        style={{ backgroundImage: `url(${bg})` }}
        className=" bg-center bg-cover bg-no-repeat h-screen flex flex-col "
      >
        <Navbar />
        <div className="wrapper flex justify-between items-center h-screen w-full px-20 lg:justify-center lg:px-6 backdrop-blur-lg">
          <div className="content lg:text-center z-50">

            <h1 className="text-white text-5xl font-bold">Hi, I'm Tarık</h1>
            <p className="text-white py-4 max-w-lg ">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. In qui
              impedit sunt, est molestiae ullam. Saepe voluptatum ducimus
              adipisci pariatur. adipisicing elit. In qui impedit ipsum dolor
              sit amet consectetur
            </p>
          </div>
          <div className="image banner-astronout lg:hidden absolute w-[300px] flex z-40">
            <img className="w-96 ast-img" src={logo1} alt="" />
          </div>
          <div className="image banner-astronout1 lg:hidden absolute w-[300px] flex z-30">
            <img className="w-96 ast-img" src={logo} alt="" />
          </div>

        </div>
      </div>
    </>
  );
}

export default Header;
