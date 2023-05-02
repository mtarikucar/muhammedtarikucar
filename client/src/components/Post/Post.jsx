import { NavLink } from "react-router-dom";
import { FcFullTrash } from "react-icons/fc";
import { useSelector } from "react-redux";
import { useState } from "react";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

function Post({ post }) {
  console.log(post);
  const { currentUser,token } = useSelector((store) => store.auth);

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);

  const deletePost = async (postId) => {
    const response = await axios.delete(`http://localhost:3000/api/posts/${postId}`,
    
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        id: currentUser._id,
      },
    });
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
        <div className="flex items-start sm:gap-8">
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

          <div>
            <div className="flex flex-row justify-between">
              <strong className="rounded border border-indigo-500 bg-indigo-500 px-3 py-1.5 text-[10px] font-medium text-white">
                Episode #101
              </strong>

              <div className="">
                {currentUser._id == post.author && (
                  <FcFullTrash
                    onClick={() => setShowDeleteConfirmationModal(true)}
                    className={`cursor-pointer`}
                  />
                )}
              </div>
            </div>

            <h3 className="mt-4 text-lg font-medium sm:text-xl">
              <NavLink to={`/Blog/${post._id}`}>{post.title}</NavLink>
            </h3>

            <p className="mt-1 text-sm text-gray-700">
              <div
                dangerouslySetInnerHTML={{ __html: post && post.content }}
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

                <p className="text-xs font-medium">{post.category}</p>
              </div>

              <span className="hidden sm:block" aria-hidden="true">
                &middot;
              </span>

              <p className="mt-2 text-xs font-medium text-gray-500 sm:mt-0">
                Featuring{" "}
                <a href="#" className="underline hover:text-gray-700">
                  Barry
                </a>
                ,
                <a href="#" className="underline hover:text-gray-700">
                  Sandra
                </a>{" "}
                and
                <a href="#" className="underline hover:text-gray-700">
                  August
                </a>
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

export default Post;
