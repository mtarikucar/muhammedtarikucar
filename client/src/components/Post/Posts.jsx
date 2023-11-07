import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { CardDefault } from "./CardDefault";

function Posts({ userId, category, event }) {
  const { data: posts } = useQuery(
    ["posts", userId],
    () => {
      const params = {};
      if (userId) {
        params.userId = userId;
      }
      if (event) {
        params.category = event;
      }


      return axios.get("/posts", { params }).then((res) => res.data);
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: (posts) => {
        console.log(posts);
      },
    }
  );

  return posts
    ? posts
        .slice(0)
        .reverse()
        .map((post, key) => <CardDefault key={key} post={post} />)
    : null;
}
export default Posts;
