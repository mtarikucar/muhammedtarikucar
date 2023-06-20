import { useRef, useState, useEffect } from "react";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { useParams } from "react-router-dom";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import AudioPlayer from "../components/AudioPlayer";
import { useSelector } from "react-redux";

import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

// Detail Component
function Detail() {
  const { id } = useParams();

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const { currentUser, token } = useSelector((store) => store.auth);

  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ["post", id],
    async () => {
      const response = await axios.get(`http://localhost:3000/api/posts/${id}`);
      return response.data[0];
    },
    {
      enabled: !!id, // Only run the query if the "id" is available.
      onSuccess: (data) => {
        console.log(data);
      },
    }
  );
  // Custom Hook
  const addComment = async (postId, comment) => {
    const response = await axios.post(
      `http://localhost:3000/api/posts/comment`,
      {
        content: comment,
        user: currentUser._id,
        postId: postId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  };

  // Custom Hook
  const toggleLike = async (postId) => {
    const response = await axios.post(
      `http://localhost:3000/api/posts/${postId}/toggle-like`
    );
    return response.data;
  };

  // Mutation to add a comment
  const addCommentMutation = useMutation((comment) => addComment(id, comment), {
    onSuccess: () => {
      refetch();
    },
  });

  // Mutation to toggle like
  const toggleLikeMutation = useMutation(() => toggleLike(id));

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCommentMutation.mutateAsync(comment);
      setComment("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleLike = async () => {
    try {
      await toggleLikeMutation.mutateAsync();
      // Update the post data or perform any necessary action
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="container flex flex-rows items-center justify-center overflow-hidden min-h-screen ">
      <div className="my-12 w-lg grid grid-cols-2 gap-4 w-3/4 rounded-md max-h-fit lg:grid-cols-1 sm:w-full">
        <div className="flex flex-col items-center  border-4 rounded-xl m-8 lg:min-h-[80vh] md:min-h-[50vh] p-8 lg:m-0 sm:p-2">
          {post?.materials.map((material, key) => (
            <>
              {material.type === "video" ? (
                <video
                  src={material.url}
                  autoPlay
                  loop
                  muted
                  alt="slide_image"
                  className="m-2"
                />
              ) : (
                <img
                  src={material.url}
                  alt="slide_image"
                  className="m-2 max-h-96"
                />
              )}
            </>
          ))}

          {post?.sound && (
            <div className="custom-audio-player">
              <AudioPlayer src={post?.sound} />
            </div>
          )}
        </div>
        <div className="paragraph flex flex-col first-letter items-center justify-center mr-8 ">
          <p className="font-bold text-2xl mt-8 mb-2">{post && post.title}</p>
          <p className="px-8 mb-6 text-base overflow-y-scroll max-h-[70vh] scroll-smooth paragraph scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-100 ">
            <div
              dangerouslySetInnerHTML={{ __html: post && post.content }}
            ></div>
          </p>

          {/* Comment Section */}
          
          <h3 className="font-bold text-xl">Yorumlar</h3>
          <form onSubmit={handleCommentSubmit} className="flex my-4">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Yorum ekle"
              className="flex-grow px-4 py-2 mr-2 border border-gray-300 rounded-md focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none"
            >
              Yorum yap
            </button>
          </form>
          <div className="px-8 mb-6 text-base overflow-y-scroll max-h-[30vh] scroll-smooth paragraph scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-100 ">
            <ul>
              {post.comments.map((comment) => (
                <li key={comment._id} className="flex items-center mb-4">
                  <img
                    src={comment.user.image || "../src/assets/images/avatar.png"}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="ml-2">
                    <p className="font-bold">{comment.user.name}</p>
                    <p className="text-gray-600">{comment.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Like Button */}
          <div className="mt-4">
            <button
              onClick={handleToggleLike}
              className="flex items-center px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none"
            >
              <FaRegArrowAltCircleRight className="mr-2" />
              beğen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;
