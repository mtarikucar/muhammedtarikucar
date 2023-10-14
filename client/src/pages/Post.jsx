import { useState } from "react";

import { useParams } from "react-router-dom";
import AudioPlayer from "../components/AudioPlayer";

import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
  Typography,
  Avatar,
  Collapse,
  Button,
  Card,
  CardBody,
  Textarea,
} from "@material-tailwind/react";

function Post() {
  const { id } = useParams();

  const [comment, setComment] = useState("");

  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((cur) => !cur);

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
        user: "6466540433004b97c36395e7",
        postId: postId,
      }
    );
    return response.data;
  };

  // Mutation to add a comment
  const addCommentMutation = useMutation((comment) => addComment(id, comment), {
    onSuccess: () => {
      refetch();
    },
  });

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCommentMutation.mutateAsync(comment);
      setComment("");
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
    <div className=" flex flex-col items-center justify-center min-h-screen">
      <div>
        <Button onClick={toggleOpen} className="w-full">
          Materyalleri göster
        </Button>
        <Collapse open={open}>
          <Card className="my-4">
            <CardBody>
              <div className="flex flex-col items-center  border-4 rounded-xl">
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
            </CardBody>
          </Card>
        </Collapse>
      </div>

      <div className="flex flex-col first-letter items-center justify-center container">
        <p className="font-bold text-2xl mt-8 mb-2">{post && post.title}</p>
        <p className="px-2 mb-6 text-base ">
          <div
            dangerouslySetInnerHTML={{ __html: post && post.content }}
            className="break-words"
          ></div>
        </p>

        <div className="w-full">
          <h3 className="font-bold text-xl">Yorumlar</h3>
          <form onSubmit={handleCommentSubmit} className="flex my-4">
            <div className="w-full">
              <Textarea
                variant="outlined"
                rows={2}
                value={comment}
                label="yorum"
                className="w-full"
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex w-full justify-end py-1.5">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="red"
                    variant="text"
                    className="rounded-md"
                    onClick={() => setComment("")}
                  >
                    iptal
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-md"
                    onClick={handleCommentSubmit}
                  >
                    gönder
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="px-8 mb-6 text-base container">
          <ul className="container">
            {post.comments.map((comment, index) => (
              <Timeline key={comment._id}>
                <TimelineItem>
                  {index !== post.comments.length - 1 && <TimelineConnector />}
                  <TimelineHeader>
                    <TimelineIcon className="p-0">
                      <Avatar
                        size="sm"
                        src={comment.user?.image || "../src/images/avatar.png"}
                        withBorder
                      />
                    </TimelineIcon>
                    <Typography variant="h5" color="blue-gray">
                      {comment.user?.name}
                    </Typography>
                  </TimelineHeader>
                  <TimelineBody className="pb-4  h-fit">
                    <Typography
                      color="gary"
                      className="font-normal text-gray-600 break-words"
                    >
                      {comment.text}
                    </Typography>
                  </TimelineBody>
                </TimelineItem>
              </Timeline>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Post;
