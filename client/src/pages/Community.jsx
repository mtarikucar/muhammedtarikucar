import React from "react";
import CommunityCard from "../components/Community/CommunityCard";
import ActivityLog from "../components/Community/ActivityLog";
import Info from "../components/Community/Info"
import Participitions from "../components/Community/Participitions";

function Community() {
  return (
    <div className="h-full -200 p-8 px-48 grid grid-cols-3 gap-8">
      <div className="col-span-1">
        <CommunityCard />
        <ActivityLog/>
      </div>
      <div className="col-span-2">
        <Participitions/>
        <Info/>
      </div>
    </div>
  );
}

export default Community;
