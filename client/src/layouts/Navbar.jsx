import React, { useState } from "react";
import AnchorLink from "react-anchor-link-smooth-scroll";
import "../styles.css";
import { useSelector } from "react-redux";

function Navbar() {
  const [burgerActive, setBurgerActive] = useState(true);

  const language = useSelector((state) => state.language.value);

  console.log(language);
  window.onscroll = function () {
    scrollFunction();
  };

  function scrollFunction() {
    if (
      document.body.scrollTop > 80 ||
      document.documentElement.scrollTop > 80
    ) {
      document.querySelector(".navbarcon").style.backgroundColor = "#171717";
    } else {
      document.querySelector(".navbarcon").style.backgroundColor =
        "rgba(0, 0, 0, 0)";
    }
  }

  return (
    <>
      <div className="navbarcon flex justify-between items-center px-20 py-6 bg-transparent z-40 text-white lg:px-6 fixed w-full">
        <h1 className="text-4xl  font-bold ">Muhammed Tarık Uçar</h1>

        <nav
          className={` flex justify-center items-center gap-x-10 ${
            burgerActive && "lg:hidden"
          } lg:fixed lg:top-0 -z-20  lg:flex-col lg:w-full lg:bg-[#171717]  lg:h-[450px] lg:left-0 h-full lg:items-start  lg:pl-6  cursor-pointer lg:pt-20`}
        >
          {/* <li className="bla">
              <AnchorLink href="#projects">Projects</AnchorLink>
            </li> */}

          <div className="icon text-lg flex gap-4  lg:gap-8 lg:my-10">
            <a href="https://www.instagram.com/tarikucr/" target="_blank">
              <i className="fa-brands fa-instagram border-[1px] border-white p-2 rounded-[100%] hover:bg-white hover:text-black"></i>
            </a>
            <a href="https://github.com/mtarikucar" target="_blank">
              <i className="fa-brands fa-github border-[1px] border-white p-2 rounded-[100%] hover:bg-white hover:text-black "></i>
            </a>
          </div>
        </nav>
        <i
          onClick={(e) => setBurgerActive(!burgerActive)}
          className="fa-solid fa-bars hidden lg:block text-2xl cursor-pointer"
        ></i>
      </div>
    </>
  );
}

export default Navbar;
