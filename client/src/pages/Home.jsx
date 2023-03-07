import { useState } from "react";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { GiBookAura, GiPlastron } from "react-icons/gi";
import logo1 from "../assets/images/astronout1.png";
import { NavLink } from "react-router-dom";

function Home() {
  const [state, setState] = useState(null);

  return (
    <div className=" display flex h-screen">
      <div
        className={`portfolio bg-[#191825]  ease-in duration-700  ${
          state == "portfolio"
            ? "w-5/6 hover: w-5/6"
            : state == null
            ? "w-1/2 hover:w-4/6"
            : "w-1/6 hover:w-1/3"
        }`}
        onClick={() => setState("portfolio")}
      >
        <div className="container flex flex-row min-h-screen justify-center items-center ">
          <div className="text-base text-white ease-in duration-300 hover:text-xl">
            {state == "blog" ? (
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
                  className="flex items-center p-2 space-x-3 rounded-md"
                >
                  {state == "portfolio" ? (
                    <div className={`text-white my-2 hover:text-xl p-2 border-2 rounded ease-in duration-300`}> Go to portfolio</div>
                  ) : (
                    <></>
                  )}
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
        <FaRegArrowAltCircleRight
          className="ease-in duration-700"
          size={32}
          color="white"
          style={
            state == "portfolio"
              ? { transform: "rotate(180deg)" }
              : state == null
              ? { transform: "rotate(90deg)" }
              : { transform: "rotate(0deg)" }
          }
        />
      </div>
      <div
        className={`portfolio bg-white  ease-in duration-700  ${
          state == "blog"
            ? "w-5/6 hover: w-5/6"
            : state == null
            ? "w-1/2 hover:w-4/6"
            : "w-1/6 hover:w-1/3"
        }`}
        onClick={() => setState("blog")}
      >
        <div className="container flex flex-row min-h-screen justify-center items-center ">
          <div className="text-base font-bold ease-in duration-500 text-xl hover:text-3xl">
            {state == "portfolio" ? (
              <>
                <GiBookAura
                  className="ease-in duration-700 rounded-full"
                  size={64}
                />
              </>
            ) : (
              <div className="flex flex-col min-h-screen justify-center items-center ease-in duration-700">
                <GiBookAura
                  className="ease-in duration-700 rounded-full"
                  size={screen}
                />
                <h1 className="text-3xl font-bold easi-in duration-500 hover:text-5xl">
                  Go to blog
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
