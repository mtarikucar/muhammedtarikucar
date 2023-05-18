import { NavLink } from "react-router-dom";
import { FcFullTrash } from "react-icons/fc";
import { useSelector } from "react-redux";
import { useState } from "react";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { useMutation } from "@tanstack/react-query";
import AudioPlayer from "../AudioPlayer";
import axios from "axios";

function Post({ post }) {
  // Tarih ve saat bilgisini al
  const date = new Date(post.updatedAt);

  // Gün, ay ve yıl bilgisini al
  const day = date.getDate();
  const month = date.getMonth() + 1; // JavaScript'te aylar 0-11 aralığında numaralandırılır
  const year = date.getFullYear();

  // Saat bilgisini al
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Gün, ay, yıl ve saat bilgisini birleştirerek istediğimiz formatta oluştur
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  const { currentUser, token } = useSelector((store) => store.auth);

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);

  const deletePost = async (postId) => {
    const response = await axios.delete(
      `http://18.197.123.238:3000/api/posts/${postId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: currentUser._id,
        },
      }
    );
    return response.data;
  };
  const deleteMutation = useMutation(deletePost);

  function handleDeleteConfirmation() {
    deleteMutation.mutate(post._id);
    setShowDeleteConfirmationModal(false);
  }
  return (
    <>
      {showDeleteConfirmationModal && (
        <DeleteConfirmationModal
          onConfirm={handleDeleteConfirmation}
          onCancel={() => setShowDeleteConfirmationModal(false)}
        />
      )}
      <article className="rounded-xl bg-white p-4 ring ring-indigo-50 mb-4 w-full">
        <div className="flex items-center sm:gap-8">
          {post?.sound ? (
            <div className="custom-audio-player">
              <AudioPlayer src={post?.sound} homepage={true} />
            </div>
          ) : (
            <>
              <div
                className="grid h-20 w-20 shrink-0 place-content-center rounded-full border-2 border-indigo-500 m-4"
                aria-hidden="true"
              >
                <div className="flex items-center gap-1">
                  <span className="h-8 w-0.5 rounded-full bg-indigo-500"></span>
                  <span className="h-6 w-0.5 rounded-full bg-indigo-500"></span>
                  <span className="h-4 w-0.5 rounded-full bg-indigo-500"></span>
                  <span className="h-6 w-0.5 rounded-full bg-indigo-500"></span>
                  <span className="h-8 w-0.5 rounded-full bg-indigo-500"></span>
                </div>
              </div>
            </>
          )}
          <div>
            <div className="flex flex-row justify-between">
              <h3 className=" text-lg font-medium sm:text-xl">
                <NavLink to={`/Blog/${post._id}`}>{post.title}</NavLink>
              </h3>

              <div className="">
                {currentUser?._id == post.author && (
                  <FcFullTrash
                    onClick={() => setShowDeleteConfirmationModal(true)}
                    className={`cursor-pointer`}
                  />
                )}
              </div>
            </div>

            <p className="mt-1 text-sm text-gray-700 overflow-hidden">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    post &&
                    post.content.substring(0, 200) +
                      (post && post.content.length > 200 ? "..." : ""),
                }}
              ></div>
            </p>

            <div className="mt-4 sm:flex sm:items-center sm:gap-2">
              <div className="flex items-center gap-1 text-gray-500">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>

                <p className="text-xs font-medium">{formattedDate}</p>
              </div>

              <span className="hidden sm:block" aria-hidden="true">
                &middot;
              </span>

              <p className="mt-2 text-xs font-medium text-gray-500 sm:mt-0">
                <NavLink
                  to={`/Profile/${post.author}`}
                  className="underline hover:text-gray-800 "
                >
                  # {post.author}
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

export default Post;
