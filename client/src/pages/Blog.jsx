import React from "react";
import Posts from "../components/Post/Posts";
import Chat from "../layouts/Chat";

function Blog() {
  return (
    <>
      <div className="container flex flex-rows items-center justify-center  overflow-hidden min-h-screen ">
        <div className="my-12 w-lg grid grid-cols-6 gap-4 w-3/4">
          <div className="col-start-2 sm:col-start-1 col-span-3">
            <Posts />
          </div>
          <div className="chat col-span-2">
            <Chat/>
          </div>
        </div>
      </div>
    </>
  );
}

export default Blog;
