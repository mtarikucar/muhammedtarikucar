import {useState} from "react";

import {useParams} from "react-router-dom";
import AudioPlayer from "../components/AudioPlayer";

import {useQuery, useMutation} from "@tanstack/react-query";
import {
    Card,
    CardBody,
} from "@material-tailwind/react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";

function Post() {
    const {id} = useParams();

    const [comment, setComment] = useState("");
    const axiosPrivate = useAxiosPrivate()
    const auth = useAuth();

    const {
        data: post,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery(
        ["post", id],
        async () => {
            const response = await axiosPrivate.get(`/posts/${id}`);
            return response.data[0];
        },
        {
            enabled: !!id
        }
    );
    // Custom Hook
    const addComment = async (postId, comment) => {
        const response = await axiosPrivate.post(
            `/posts/comment`,
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

    console.log(auth);
    return (
        <div className=" grid sm:grid-cols-2 items-center justify-center ">
            <div>

                    <Card className="my-4">
                        <CardBody>
                            <div className="flex flex-col items-center border-4 rounded-xl">
                                {post?.materials.map((material, key) => (
                                    <div key={key}>
                                        {material.type === 'video' ? (
                                            <video
                                                src={material.url}
                                                autoPlay
                                                loop
                                                muted
                                                className="m-2"
                                            />
                                        ) : (
                                            <img
                                                src={material.url}
                                                className="m-2 max-h-96"
                                                alt="slide_image"
                                            />
                                        )}
                                    </div>
                                ))}

                                {post?.sound && (
                                    <div className="w-full p-2">
                                        <AudioPlayer src={post?.sound}/>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
            </div>

            <div className="flex flex-col first-letter items-center justify-center container">
                <p className="font-bold text-2xl mt-8 mb-2">{post && post.title}</p>
                <p className="px-2 mb-6 text-base ">
                    <div
                        dangerouslySetInnerHTML={{__html: post && post.content}}
                        className="break-words"
                    ></div>
                </p>
            </div>
        </div>
    )
        ;
}

export default Post;
