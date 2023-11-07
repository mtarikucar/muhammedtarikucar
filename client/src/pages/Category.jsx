import React from "react";
import { motion } from "framer-motion";
import Posts from "../components/Post/Posts";
import { useParams } from "react-router-dom";

function Category() {
  const { id } = useParams();
  const styles = {
    pin_container: {
      gridTemplateColumns: "repeat(auto-fill, 325px)",
      gridAutoRows: "10px",
      left: "50%",
      transform: "translateX(-50%)",
    },
  };
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      exit={{ x: "100%", transition: { duration: 0.1 } }}
      
    >
      <div
        className="w-5/6 absolute grid justify-center "
        style={styles.pin_container}
      >
        <Posts event={id} />
      </div>
    </motion.div>
  );
}

export default Category;
