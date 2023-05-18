import React from "react";
import axios from "axios";

import { AiFillEdit } from 'react-icons/Ai';
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
function CommunityCard({ data, openCommunityUpdateModal, setOpenCommunityUpdateModal }) {

  const { token, currentUser } = useSelector(store => store.auth)
  const { id } = useParams();

  const mutate= useMutation(() =>
    axios.post(`http://18.197.123.238:3000/api/community/join/${id}`,{}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        id: currentUser._id,
      },
    })
  );
  const handleClick = () => {
    mutate.mutate();
  };


  return (

    <>

      <div className="bg-white rounded-lg shadow-xl pb-8 ">
        <div className="w-full h-[250px]">
          <img
            src="https://vojislavd.com/ta-template-demo/assets/img/profile-background.jpg"
            className="w-full h-full rounded-tl-lg rounded-tr-lg"
          />
        </div>
        <div className="flex flex-col  items-center  -mt-20">

          <img
            src={` ${data.image ? data.image : 'https://vojislavd.com/ta-template-demo/assets/img/profile.jpg'}`}
            className="w-40 border-4 border-white rounded-full"
          />


          <div className="flex items-center space-x-2 mt-2">
            <p className="text-2xl">{data.name}</p>

            <button
              on
              onClick={() => setOpenCommunityUpdateModal(true)}
              className="h-6 w-6 text-center  text-blue-500">
              <AiFillEdit />
            </button>

          </div>
          <p className="text-gray-700">
            {data.description}
          </p>
          <p className="text-sm text-gray-500">New York, USA</p>
        </div>
        <div className="flex-1 flex flex-col items-center lg:items-end justify-end px-8 mt-2">
          <div className="flex items-center space-x-4 mt-2">
            <button

              onClick={handleClick} 
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded text-sm space-x-2 transition duration-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
              </svg>
              <span>Connect</span>
            </button>
            <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded text-sm space-x-2 transition duration-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span>Message</span>
            </button>

          </div>
        </div>
      </div>
    </>
  );
}

export default CommunityCard;
