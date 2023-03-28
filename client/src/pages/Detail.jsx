import { useRef, useState, useEffect } from "react";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { useParams } from "react-router-dom";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { EffectCoverflow, Pagination, Navigation } from "swiper";

import { useSelector } from "react-redux";
function Detail() {
  const audioRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoMute, setIsVideoMute] = useState(false);
  const { id } = useParams();

  const { posts } = useSelector((store) => store.post);
  const [post, setPost] = useState(null);

  useEffect(() => {
    setPost(posts.find((x) => x._id === id));
  }, []);

  useEffect(() => {
    audioRef.current;
    isPlaying == true ? audioRef.current.play() : audioRef.current.pause();
  }, [isPlaying, post]);

  return (
    <div className="container flex flex-rows items-center justify-center overflow-hidden min-h-screen ">
      <div className="my-12 w-lg grid grid-cols-2 gap-4 w-3/4 rounded-md max-h-fit lg:grid-cols-1 sm:w-full">
        <div className="flex flex-col items-center  border-4 rounded-xl m-8 lg:min-h-[80vh] md:min-h-[50vh] p-8 lg:m-0 sm:p-2">
          {post?.materials.map((material, key) => (
            <>
              {material.type == "video" ? (
                <video
                  src={material.url}
                  autoPlay
                  loop
                  muted
                  alt="slide_image"
                  className="m-2"
                />
              ) : (
                <img src={material.url} alt="slide_image" className="m-2" />
              )}
            </>
          ))}

          <div className="grid grid-rows-2 gap-4">
            <div className="content"></div>
            {post.sound && (
              <div className="flex flex-col items-center border-4 rounded-xl h-fit ">
                <div className="flex h-[87px] w-[87px] items-center justify-center mt-2 rounded-full border-[4px] border-white backdrop-blur-lg dark:!border-navy-700">
                  <div
                    className="Play-Pause"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying && isPlaying == true ? (
                      <img
                        className="h-full w-full rounded-full hover:p-2  ease-in-out duration-300 sm:h-16"
                        src="\sounds\pause.svg"
                        alt="pause"
                      ></img>
                    ) : (
                      <img
                        className="h-full w-full rounded-full hover:p-2  ease-in-out duration-300 sm:h-16"
                        src="\sounds\play.svg"
                        alt="play"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
            <audio src={post?.sound} ref={audioRef}></audio>
          </div>
        </div>
        <div className="paragraph flex flex-col first-letter items-center justify-center mr-8 ">
          <p className="font-bold text-2xl mt-8 mb-2">{post && post.title}</p>
          <p className="px-8 mb-6 text-base overflow-y-scroll max-h-[70vh] scroll-smooth paragraph scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-100 ">
            <div
              dangerouslySetInnerHTML={{ __html: post && post.content }}
            ></div>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Detail;
