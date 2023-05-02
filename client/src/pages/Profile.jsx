// Profile.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ProfileCart from '../components/ProfileCart';
import Posts from '../components/Post/Posts';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
const fetchUser = async (userId) => {
  const response = await axios.get(`http://localhost:3000/api/users/${userId}`);
  return response.data;
};

const useUser = (userId) => {
  return useQuery(['user', userId], () => fetchUser(userId), { enabled: !!userId });
};

function Profile() {

  const { currentUser } = useSelector(store => store.auth)
  const { id } = useParams();

  const { data: user, isLoading, isError, error } = useUser(id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-row justify-center h-screen items-center">
      <div className="grid grid-cols-3  w-3/4 gap-4 content-center">
        <div className="col-span-1">
          <ProfileCart user={user}/>
        </div>
        <div className="col-span-2 flex flex-col m-3 w-full justify-center items-center">
          <div className="overflow-scroll max-h-[75vh] p-4 space-y-3 m-3  w-full ">
            <Posts userId={id}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
