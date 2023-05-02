import { useState } from "react";
import CommunityCard from "../components/Community/CommunityCard";
import ActivityLog from "../components/Community/ActivityLog";
import Info from "../components/Community/Info"
import Participitions from "../components/Community/Participitions";
import { useSelector } from "react-redux";

import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import axios from "axios";
import { useParams } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import CommunityUpdateModal from "../components/Community/CommunityUpdateModal";

const fetchCommunityById = async (id, token) => {
  const response = await axios.get(`http://localhost:3000/api/community/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


function Community() {

const [openCommunityUpdateModal ,setOpenCommunityUpdateModal]=useState(false)

  const { token, currentUser } = useSelector(store => store.auth)
  console.log(currentUser, 'c-commuty');
  const { id } = useParams();



  const { isLoading, isError, data } = useQuery(['community', id], () => fetchCommunityById(id, token));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  console.log(data[0], 'data');


  return (
    <>
      <CommunityUpdateModal openCommunityUpdateModal={openCommunityUpdateModal} setOpenCommunityUpdateModal={setOpenCommunityUpdateModal} communityData={data[0]} />
      <div className="h-full -200  p-8 px-32 lg:px-48 grid grid-cols-3  md:grid-cols-2 lg:grid-cols-3  gap-8">
        <div className="col-span-1 ">
          {
            data &&
            <CommunityCard openCommunityUpdateModal={openCommunityUpdateModal} setOpenCommunityUpdateModal={setOpenCommunityUpdateModal} data={data[0]} />
          }
          <ActivityLog />
        </div>
        <div className="col-span-2 lg:grid-cols-2 md:grid-cols-2 ">
          <Participitions />
          <Info />
        </div>
      </div>
    </>
  );
}

export default Community
