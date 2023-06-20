import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import PostLoad from "./PostLoad"
import Post from './Post';

function Posts({ userId, category }) {
  const {
    isLoading,
    isError,
    data: posts,
    error,
  } = useQuery(
    ["posts", userId, category],
    () => {
      const params = {};
      if (userId) {
        params.userId = userId;
      }
      if (category) {
        params.category = category;
      }

      return axios.get("http://localhost:3000/api/posts", { params }).then((res) => res.data);
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: (posts) => {
        console.log(posts);
      },
    }
  );


  return (
    <>
      {(isLoading || isError || error) && (
        <>
          <PostLoad />
        </>
      )}
      {
        posts &&
          posts
            .slice(0)
            .reverse()
            .map((post, key) => <Post key={key} post={post} />)}
    </>
  );
}

export default Posts;
