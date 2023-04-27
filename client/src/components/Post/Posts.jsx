import React from "react";
import Post from "./Post";
import PostLoad from "./PostLoad";


function Posts({ custom_list }) {



  /*   useEffect(() => {
    dispatch(getPosts());
  }, []);
 */
  return (
    <>
      <Post />
      {/* {(isFetching || error) && (
        <>
          <PostLoad /> <PostLoad />
          <PostLoad />
        </>
      )}
      {custom_list
        ? 
        custom_list
            .slice(0)
            .reverse()
            .map((post, key) => <Post key={key} post={post} />)
        : posts &&
          posts
            .slice(0)
            .reverse()
            .map((post, key) => <Post key={key} post={post} />)} */}
    </>
  );
}

export default Posts;
