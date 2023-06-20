import { useState } from "react";
import CommunityCreateModal from "../components/Community/CommunityCreateModal";
import UserDropdown from "./UserDropdown";
import UserUpdateModal from "./UserUpdateModal";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";


function ProfileCart({ user }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const { currentUser, token } = useSelector((store) => store.auth);

  const startDirectMessage = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/room/createDirectMessage`,
        { userId1: currentUser._id, userId2: user._id,name:currentUser.name+"-"+user.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch messages");
    }
  };
  
  const mutation = useMutation(startDirectMessage, {
    onSuccess: () => {
      navigate("/chat");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleStartDirectMessage = () => {
    mutation.mutate();
  };

  return (
    <div>
      <CommunityCreateModal
        isCommunityOpen={isCommunityOpen}
        setIsCommunityOpen={setIsCommunityOpen}
      />
      <UserUpdateModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="mx-2 my-10 rounded-xl border bg-white px-4 shadow-md sm:mx-auto sm:max-w-xl sm:px-8">
        <div className="mb-2 flex flex-col gap-y-6 border-b py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <img
              className="h-14 w-14 rounded-full object-cover"
              src={user.image || "../src/assets/images/avatar.png"}
              alt={user.name}
            />
            <div className="ml-4 w-56">
              <p className="text-slate-800 text-xl font-extrabold">
                {user?.name}
              </p>
              <p className="text-slate-500 text-sm">{user.email}</p>
            </div>

            {currentUser && currentUser._id == user._id && (
              <UserDropdown
                setIsOpen={setIsOpen}
                setIsCommunityOpen={setIsCommunityOpen}
              />
            )}
          </div>
          {user.community && (
            <NavLink
              to={`/Community/${user?.community}`}
              className="flex items-center justify-center shadow-md cursor-pointer  font-semibold text-gray-500 w-full bg-clip-text hover:bg-clip-padding hover:bg-gradient-to-r hover:from-emerald-400 hover:to-purple-600  rounded-md  hover:text-white  px-4 py-2 ease-in-out duration-300"
            >
              <span>topluluk</span>
            </NavLink>
          )}
        </div>
        <div className="mb-2 flex justify-between border-b py-8 text-sm sm:text-base">
          <div className="flex flex-col items-center">
            <p className="text-slate-700 mb-1 text-xl font-extrabold">14</p>
            <p className="text-slate-500 text-sm font-medium">gönderi</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-slate-700 mb-1 text-xl font-extrabold">1124</p>
            <p className="text-slate-500 text-sm font-medium">etkileşim</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-slate-700 mb-1 text-xl font-extrabold">25</p>
            <p className="text-slate-500 text-sm font-medium">
              topluluk etkisi
            </p>
          </div>
        </div>

        {currentUser && currentUser._id == user._id ? (
          <div className="w-full mb-2">
            <NavLink to={"/Upload"}>
              <div className=" flex items-center justify-center shadow-md cursor-pointer  font-semibold text-gray-500 w-full bg-clip-text hover:bg-clip-padding hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-600  rounded-md  hover:text-white  px-4 py-2 ease-in-out duration-300">
                <div>gönderi paylaş</div>
              </div>
            </NavLink>
          </div>
        ) : (
          <div className="w-full mb-2">
            <button
              onClick={handleStartDirectMessage}
              className="flex items-center justify-center shadow-md cursor-pointer  font-semibold text-gray-500 w-full bg-clip-text hover:bg-clip-padding hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-600  rounded-md  hover:text-white  px-4 py-2 ease-in-out duration-300"
            >
              mesaj gönder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileCart;
