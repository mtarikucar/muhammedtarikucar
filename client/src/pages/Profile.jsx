import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { publicRequest } from "../utils/requestMethods";

import Posts from "../components/Post/Posts";
function Profile() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    async () => {
      const res = await publicRequest.get(`/posts/user/${id}`);
      console.log(res.data);
      setPosts(res.data);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="profilecard">Profilecard</div>
      <div className="posts">{posts && <Posts custom_list={posts} />}</div>
    </div>
  );
}

export default Profile;
