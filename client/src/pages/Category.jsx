import React from "react";
import { motion } from "framer-motion";
import { CardDefault } from "../components/Post/CardDefault";
import Posts from "../components/Post/Posts";
import { useParams } from "react-router-dom";

function Category() {
  const { id } = useParams();

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      exit={{ x: '100%', transition: { duration: 0.1 } }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Posts event={id} />
      </div>
    </motion.div>
  );
}

export default Category;
