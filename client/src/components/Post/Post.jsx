import { NavLink } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { MdArrowRight, MdArrowLeft } from "react-icons/md";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { EffectCoverflow, Pagination, Navigation } from "swiper";

function Post({ post }) {
  const audioRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current;
    isPlaying == true ? audioRef.current.play() : audioRef.current.pause();
  }, [isPlaying]);

  return (
    <div className="flex flex-col justify-center items-center h-fit hover:bg-gray-300 rounded-2xl ease-in-out duration-500 shadow-2xl ">
      <div className="relative flex flex-col items-center rounded mx-auto p-4 bg-white bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:!shadow-none ">
        <div className="relative flex h-32 w-full justify-center rounded-xl bg-cover ">
          <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            autoplay={true}
            loop={true}
            slidesPerView={"auto"}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
            }}
            pagination={{ el: ".swiper-pagination", clickable: true }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
              clickable: true,
            }}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="swiper_container z-0 rounded-xl "
          >
            {post.materials.map((material, key) => (
              <SwiperSlide key={key}>
                {material.type == "video" ? (
                  <video
                    src={material.url}
                    autoPlay
                    loop
                    muted
                    alt="slide_image"
                  />
                ) : (
                  <img src={material.url} alt="slide_image" />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          {post.sound && (
            <div className="absolute -bottom-16 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white backdrop-blur-lg dark:!border-navy-700 shadow-xl">
              <div
                className="Play-Pause z-50"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying && isPlaying == true ? (
                  <img
                    className="h-full w-full rounded-full hover:p-2  ease-in-out duration-300"
                    src="\sounds\pause.svg"
                    alt="pause"
                  ></img>
                ) : (
                  <img
                    className="h-full w-full rounded-full hover:p-2  ease-in-out duration-300"
                    src="\sounds\play.svg"
                    alt="play"
                  />
                )}
              </div>
            </div>
          )}
          <audio src={post.sound && post.sound} ref={audioRef}></audio>
        </div>
        <div className="mt-16 flex flex-col items-center w-full">
          <h4 className="text-xl font-bold text-navy-700 dark:text-black ">
            {post.title}
          </h4>
          <div className="text-base font-normal text-gray-600 max-h-36 overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
          </div>
          <NavLink to={`/Blog/${post._id}`}>
            <div className="text-lg font-bold text-navy-700 text-gray-500 border-2 px-4 py-1 mt-2 rounded-md hover:text-white hover:bg-gray-500 hover:border-none ease-in-out duration-300">
              more
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Post;
