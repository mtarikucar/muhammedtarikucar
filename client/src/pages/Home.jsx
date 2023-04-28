import { useState } from "react";
import { FaArrowsAltH } from "react-icons/fa";
import { GiBookAura, GiPlastron } from "react-icons/gi";
import logo1 from "../assets/images/astronout1.png";
import { NavLink } from "react-router-dom";

function Home() {
  const [state, setState] = useState(null);

  return (
    <div className=" display flex h-screen">
      <div
        className={`portfolio bg-[#191825]  ease-in duration-700  ${
          state == 1
            ? "w-11/12 hover:w-11/12"
            : state == null
            ? "w-1/2 hover:w-4/6"
            : "w-1/6 hover:w-1/3"
        }`}
        onClick={() => setState(1)}
      >
        <div className="container flex flex-row min-h-screen justify-center items-center hover:bg-transparent">
          <div className="text-base text-white ease-in duration-300 border-2 p-4 rounded-md">
            {state == 0 ? (
              <>
                <GiPlastron
                  className="ease-in duration-700"
                  size={64}
                  color="white"
                />
              </>
            ) : (
              <>
                <h1 className="text-white text-5xl font-bold">Hi, I'm Tarık</h1>
                <NavLink
                  to={`/Portfolio`}
                  className="flex items-center p-2 space-x-3 rounded-md justify-center"
                >
                  <div
                    className={`text-white my-2 hover:bg-white hover:text-[#191825] hover:font-bold p-2 rounded ease-in duration-300 ${
                      state == 1 ? "border-2" : ""
                    }`}
                  >
                    Go to portfolio
                  </div>
                </NavLink>
                <div className="image banner-astronout1-home lg:hidden absolute w-[300px] flex z-40">
                  <img className="w-96 ast-img" src={logo1} alt="" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="middle w-1/6 flex flex-row- min-h-screen justify-center items-center bg-gradient-to-r from-[#191825] to-white">
        <FaArrowsAltH
          className="ease-in duration-700"
          size={32}
          color="white"
          style={
            state == 1
              ? { transform: "rotate(90deg)" }
              : state == null
              ? { transform: "rotate(180deg)" }
              : { transform: "rotate(270deg)" }
          }
          onClick={() => setState(!state)}
        />
      </div>
      <div
        className={`portfolio bg-white  ease-in duration-700  ${
          state == 0
            ? "w-11/12 hover:w-11/12"
            : state == null
            ? "w-1/2 hover:w-4/6"
            : "w-1/6 hover:w-1/3"
        }`}
        onClick={() => setState(0)}
      >
        <div className="container flex flex-row min-h-screen justify-center items-center ">
          <div className=" font-bold ease-in duration-500 text-xl hover:text-3xl ">
            {state == 1 ? (
              <>
                <GiBookAura
                  className="ease-in duration-700 rounded-full"
                  size={64}
                />
              </>
            ) : (
              <div className="flex flex-col justify-center items-center ease-in duration-700 border-4 border-black rounded-md p-4">
                <GiBookAura
                  className="ease-in duration-700 rounded-full "
                  size={screen}
                />
                <NavLink
                  to={`/Blog`}
                  className="flex items-center p-2 space-x-3 rounded-md"
                >
                  <div
                    className={`text-3xl font-bold rounded-md p-2 ease-in duration-500 hover:text-white hover:bg-black${
                      state == 0 ? "border-2" : ""
                    }`}
                  >
                    Go to blog
                  </div>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
