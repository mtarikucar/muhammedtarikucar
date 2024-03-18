import { motion } from "framer-motion";
import React from "react";
import { CardWithLink } from "../components/CardWithLink";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";

function Home() {
  const {
    data: posts,
  } = useQuery(
    ["categories"],
    () => {
      return axios
        .get("/event")
        .then((res) => res.data);
    },
    {
      onSuccess: (posts) => {
        console.log(posts);
      },
    }
  );

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      className={"mb-12"}
      exit={{ x: window.innerWidth, transition: { duration: 0.1 } }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {posts && posts?.map((post, key) => (
            <CardWithLink key={key} post={post} />
          ))}
      </div>

    
    </motion.div>
  );
}

export default Home;
