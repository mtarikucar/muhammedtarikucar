import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CardDefault } from "./CardDefault";

function Posts({ userId, category, event }) {
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
      if (category) {
        params.event = event;
      }

      return axios
        .get("http://localhost:3000/api/posts", { params })
        .then((res) => res.data);
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
      {posts && posts
        .slice(0)
        .reverse()
        .map((post, key) => (
          <CardDefault key={key} post={post} />
        ))}
    </>
  );
}

export default Posts;
