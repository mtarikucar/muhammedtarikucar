import { useState } from "react";
import CommunityCreateModal from "../components/Community/CommunityCreateModal";
import UserDropdown from "./UserDropdown";
import UserUpdateModal from "./UserUpdateModal";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

function ProfileCart({ user }) {

  const [isOpen, setIsOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const { currentUser } = useSelector(store => store.auth)

  
  return (
    <div>
      <CommunityCreateModal isCommunityOpen={isCommunityOpen} setIsCommunityOpen={setIsCommunityOpen} />
      <UserUpdateModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="mx-2 my-10 rounded-xl border bg-white px-4 shadow-md sm:mx-auto sm:max-w-xl sm:px-8">
        <div className="mb-2 flex flex-col gap-y-6 border-b py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <img
              className="h-14 w-14 rounded-full object-cover"
              src={user.image}
              alt={user.name}
            />
            <div className="ml-4 w-56">
              <p className="text-slate-800 text-xl font-extrabold">
                {user?.name}
              </p>
              <p className="text-slate-500 text-sm">{user.email}</p>
            </div>

            {
              currentUser &&
              currentUser._id == user._id &&
              <UserDropdown setIsOpen={setIsOpen} setIsCommunityOpen={setIsCommunityOpen} />
            }
          </div>
         {/*  {

            user.community &&
            < NavLink
              to={`/Community/${user?.community}`}
              className="flex items-center justify-center gap-1 rounded-lg border border-emerald-500 px-4 py-2 font-medium text-emerald-500 focus:outline-none focus:ring hover:bg-emerald-100">

              <span>Community</span>
            </NavLink>
          } */}
        </div>
       {/*  <div className="mb-2 flex justify-between border-b py-8 text-sm sm:text-base">
          <div className="flex flex-col items-center">
            <p className="text-slate-700 mb-1 text-xl font-extrabold">14</p>
            <p className="text-slate-500 text-sm font-medium">Posts</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-slate-700 mb-1 text-xl font-extrabold">1124</p>
            <p className="text-slate-500 text-sm font-medium">Followers</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-slate-700 mb-1 text-xl font-extrabold">25</p>
            <p className="text-slate-500 text-sm font-medium">Sponsors</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-slate-700 mb-1 text-xl font-extrabold">3</p>
            <p className="text-slate-500 text-sm font-medium">Awards</p>
          </div>
        </div> */}
        {/* <div className="flex justify-between my-4">
          <button className="text-slate-500 hover:bg-slate-100 rounded-lg border-2 px-4 py-2 font-medium focus:outline-none focus:ring">
            Message
          </button>
          <button className="rounded-lg border-2 border-transparent bg-blue-600 px-4 py-2 font-medium text-white focus:outline-none focus:ring hover:bg-blue-700">
            Follow
          </button>
        </div> */}
        {
          currentUser &&
          currentUser._id == user._id && (
            <div className="w-full mb-2">
              <NavLink to={"/Upload"}>
                <div className="  flex items-center justify-center shadow-md cursor-pointer  font-semibold text-gray-500 w-full bg-clip-text hover:bg-clip-padding hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-600  rounded-md  hover:text-white  px-4 py-2 ease-in-out duration-300">
                  <div>gönderi paylaş</div>
                </div>
              </NavLink>
            </div>
          )}
      </div>
    </div >
  );
}

export default ProfileCart;
