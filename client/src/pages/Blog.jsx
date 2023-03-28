import React from "react";
import Posts from "../components/Post/Posts";

function Blog() {
 

  return (
    <>
      <div className="container flex flex-rows items-center justify-center  overflow-hidden min-h-screen ">
        <div className="my-12 w-lg grid grid-cols-3 gap-4 lg:grid-cols-1 w-3/4">
          <Posts/>
        </div>
      </div>
    </>
  );
}

export default Blog;
