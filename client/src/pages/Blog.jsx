import React from "react";
import Posts from "../components/Post/Posts";
import { useSelector } from "react-redux";
import Requests from "../layouts/Requests";

function Blog() {
  const { currentUser } = useSelector((store) => store.auth);

  return (
    <>
      <div className="container flex flex-rows items-center justify-center  overflow-hidden min-h-screen ">
        <div className="my-12 w-lg grid grid-cols-6 gap-4 w-3/4">
          <div className={currentUser ? `col-span-4  sm:col-span-6`: "col-span-6"}>
            <Posts />
          </div>
          {currentUser && (
            <div className={`chat col-span-2 sticky lg:top-0 sm:hidden`}>
              <Requests />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Blog;
