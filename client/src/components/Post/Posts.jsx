import React from "react";
import { useEffect } from "react";

import Post from "./Post";
import PostLoad from "./PostLoad";

import { getPosts } from "../../redux/Post/PostActions";
import { useDispatch, useSelector } from "react-redux";

function Posts({ custom_list }) {
  const { posts, isFetching, error } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPosts());
  }, []);

  return (
    <>
      {(isFetching || error) && (
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
            .map((post, key) => <Post key={key} post={post} />)}
    </>
  );
}

export default Posts;
