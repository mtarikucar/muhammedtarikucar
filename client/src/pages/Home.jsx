import { motion } from "framer-motion";
import React from "react";
import { AccordionCustomAnimation } from "../components/AccordionCustomAnimation";
import { CardWithLink } from "../components/CardWithLink";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";

function Home() {
  const {
    isLoading,
    isError,
    data: posts,
    error,
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
      exit={{ x: window.innerWidth, transition: { duration: 0.1 } }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts && posts?.map((post, key) => (
            <CardWithLink key={key} post={post} />
          ))}
      </div>

      <div className="mt-6">
        <AccordionCustomAnimation />
      </div>
    </motion.div>
  );
}

export default Home;
