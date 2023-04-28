import React from "react";
import ProfileCart from "../components/ProfileCart";
import Posts from "../components/Post/Posts";

function Profile() {

  return (
    <div className="flex flex-row justify-center h-full items-center">
      <div className="grid grid-cols-3  w-3/4 gap-4 content-center mt-24">
        <div className="col-span-1">
          <ProfileCart />
        </div>
        <div className="col-span-2 flex flex-col m-3  justify-center items-center">
          <div className="overflow-scroll max-h-[75vh] p-4 space-y-3 m-3">
            <Posts />
            <Posts />
            <Posts />
            <Posts />
            <Posts />
            <Posts />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
