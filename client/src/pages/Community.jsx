import { useState } from "react";
import CommunityCard from "../components/Community/CommunityCard";
import ActivityLog from "../components/Community/ActivityLog";
import Info from "../components/Community/Info";
import Participitions from "../components/Community/Participitions";
import { useSelector } from "react-redux";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";
import { useParams } from "react-router-dom";

import CommunityUpdateModal from "../components/Community/CommunityUpdateModal";

function Community() {
  const [openCommunityUpdateModal, setOpenCommunityUpdateModal] =
    useState(false);

  const { token, currentUser } = useSelector((store) => store.auth);

  const { id } = useParams();

  const { isLoading, isError, data } = useQuery(["community"], async () => {
    const response = await axios.get(
      `http://localhost:3000/api/community/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: currentUser._id,
        },
      }
    );
    return response.data;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  console.log(data, "data");

  return (
    <>
      <CommunityUpdateModal
        openCommunityUpdateModal={openCommunityUpdateModal}
        setOpenCommunityUpdateModal={setOpenCommunityUpdateModal}
        communityData={data[0]}
      />
      <div className="h-full -200  p-8 px-32 lg:px-48 grid grid-cols-3  md:grid-cols-2 lg:grid-cols-3  gap-8">
        <div className="col-span-1 ">
          {data && (
            <CommunityCard
              openCommunityUpdateModal={openCommunityUpdateModal}
              setOpenCommunityUpdateModal={setOpenCommunityUpdateModal}
              data={data[0]}
            />
          )}
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

export default Community;
