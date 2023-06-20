import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const getCommunityMembers = async (communityId, token) => {
  const { data } = await axios.get(
    `http://localhost:3000/api/community/${communityId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

function useCommunityMembers(communityId, token) {
  return useQuery(
    ["communityMembers", communityId],
    () => getCommunityMembers(communityId, token),
    {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (data) => {
        console.log(communityId);
      },
    }
  );
}

function Participitions() {
  const { token, currentUser } = useSelector((store) => store.auth);

  const {
    data: communityMembers,
    isLoading,
    isError,
    error,
  } = useCommunityMembers(currentUser.community, token);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <div className="flex items-center justify-between">
        <h4 className="text-xl text-gray-900 font-bold">participitions</h4>
        <a href="#" title="View All">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500 hover:text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-8 mt-8">
        {communityMembers.map((member) => (
          <a
            key={member._id}
            href="#"
            className="flex flex-col items-center justify-center text-gray-800 hover:text-blue-600"
            title="View Profile"
          >
            <img
              src={member.image}
              className="w-16 rounded-full"
              alt={member.name}
            />
            <p className="text-center font-bold text-sm mt-1">{member.name}</p>
            <p className="text-xs text-gray-500 text-center">{member.title}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export default Participitions;
