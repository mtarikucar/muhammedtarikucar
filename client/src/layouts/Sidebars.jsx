import { useState, useEffect } from "react";
import { FcHome, FcUnlock, FcReading,FcTreeStructure, FcSms,FcNews } from "react-icons/fc";
import { HiOutlineServer } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

function Sidebars() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useSelector((store) => store.auth);

  return (
    <div className="h-screen flex justify-center items-center fixed sm:hidden ease-in-out duration-500">
      <div className="ml-6 flex w-fit flex-col items-center space-y-10 py-6 ease-in-out duration-500">
        <div
          className={`flex items-center justify-center rounded-md bg-white text-blue-600 hover:bg-gray-200 ease-in-out duration-500 cursor-pointer ${
            open ? "animate-bounce" : "animate-pulse"
          }`}
          onClick={() => setOpen(!open)}
        >
          <HiOutlineServer className="h-6 w-6 cursor-pointer text-gray-500 hover:text-blue-600" />
        </div>

        <div
          className={`sidebar space-y-48 rounded-md bg-white ease-in-out duration-500 ${
            open == true ? "" : "hidden"
          }`}
        >
          <ul className="ease-in-out duration-500">
            <li className="p-3">
              <NavLink to={"/Blog"}>
                <div className="sidebar-icon flex flex-row hover:drop-shadow-xl rounded border-gray-500 p-2 hover:border-blue-600 hover:bg-gray-100 group">
                  <span
                    className="transititext-primary text-primary transition duration-150 rounded-xl ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                    data-te-toggle="tooltip"
                    title="Home"
                  >
                    <FcHome className="h-6 w-6 cursor-pointer text-gray-500 hover:text-blue-600" />
                  </span>
                </div>
              </NavLink>
            </li>
            {currentUser && (
              <>
                <li className="p-3">
                  <NavLink to={`/Profile/${currentUser._id}`}>
                    <div className="sidebar-icon flex flex-row hover:drop-shadow-xl rounded border-gray-500 p-2 hover:border-blue-600 hover:bg-gray-100 group">
                      <span
                        className="transititext-primary text-primary transition duration-150 rounded-xl ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                        data-te-toggle="tooltip"
                        title="Profile"
                      >
                        <FcReading className="h-6 w-6 cursor-pointer text-gray-500 hover:text-blue-600" />
                      </span>
                    </div>
                  </NavLink>
                </li>
                <li className="p-3">
                  <NavLink to={`/Chat`}>
                    <div className="sidebar-icon flex flex-row hover:drop-shadow-xl rounded border-gray-500 p-2 hover:border-blue-600 hover:bg-gray-100 group">
                      <span
                        className="transititext-primary text-primary transition duration-150 rounded-xl ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                        data-te-toggle="tooltip"
                        title="Profile"
                      >
                        <FcSms className="h-6 w-6 cursor-pointer text-gray-500 hover:text-blue-600" />
                      </span>
                    </div>
                  </NavLink>
                </li>
                <li className="p-3">
                  <NavLink to={`/Notifications`}>
                    <div className="sidebar-icon flex flex-row hover:drop-shadow-xl rounded border-gray-500 p-2 hover:border-blue-600 hover:bg-gray-100 group">
                      <span
                        className="transititext-primary text-primary transition duration-150 rounded-xl ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                        data-te-toggle="tooltip"
                        title="Profile"
                      >
                        <FcNews className="h-6 w-6 cursor-pointer text-gray-500 hover:text-blue-600" />
                      </span>
                    </div>
                  </NavLink>
                </li>
                { currentUser.community &&  (
                  <li className="p-3">
                    <NavLink to={`/Community/${currentUser.community}`}>
                      <div className="sidebar-icon flex flex-row hover:drop-shadow-xl rounded border-gray-500 p-2 hover:border-blue-600 hover:bg-gray-100 group">
                        <span
                          className="transititext-primary text-primary transition duration-150 rounded-xl ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                          data-te-toggle="tooltip"
                          title="Profile"
                        >
                          <FcTreeStructure className="h-6 w-6 cursor-pointer text-gray-500 hover:text-blue-600" />
                        </span>
                      </div>
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </ul>
          <div className="flex items-center justify-center pb-5">
            <NavLink to={"/Login"}>
              <div className="sidebar-icon flex flex-row hover:drop-shadow-xl rounded border-gray-500 p-2 hover:border-blue-600 hover:bg-gray-100 group">
                <span
                  className="transititext-primary text-primary transition duration-150 rounded-xl ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                  data-te-toggle="tooltip"
                  title="Auth"
                >
                  <FcUnlock className="h-6 w-6 cursor-pointer text-gray-500 hover:text-blue-600" />
                </span>
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebars;
