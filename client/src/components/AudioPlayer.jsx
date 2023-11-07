import React, { useRef, useState } from "react";

import { PlayIcon, PauseIcon, ArrowUpIcon, ChevronDoubleRightIcon, ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";


const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time - minutes * 60);

  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

const AudioPlayer = ({ src, homepage }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playing, setPlaying] = useState(false);

  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const changeCurrentTime = (time) => {
    const newTime = parseFloat(time);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeVolume = (value) => {
    audioRef.current.volume = value;
    setVolume(value);
  };

  const togglePlay = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className={`flex flex-col items-center p-5 rounded-lg ${!homepage && "border-2 my-2 w-full bg-gray-200"}`}>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        controls
        className="hidden"
      />

      <button
        onClick={togglePlay}
        className={`bg-indigo-500 text-white px-6 py-4 rounded  hover:px-8 ease-in-out duration-300 ${playing ? "px-8" : ""}`}
      >
        {playing ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
        </svg>
          : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        }
      </button>

      {!homepage && (
        <>
          <div className="flex items-center justify-between w-full mt-5">
            <button
              onClick={() => changeCurrentTime(currentTime - 5)}
              className="bg-indigo-500 text-white p-2 rounded mx-3 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
              5
            </button>
            <div className="w-full mx-3">
              <div className="mid flex-cols items-center justify-center">
                <div>
                  <span className="pr-2">{formatTime(currentTime)}</span>/
                  <span className="pl-2">{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => changeCurrentTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <button
              onClick={() => changeCurrentTime(currentTime + 5)}
              className="bg-indigo-500 text-white p-2 rounded mx-3 flex items-center"
            >
              5
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between w-full mt-5">
            <div className="pr-2 m-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>

            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => changeVolume(e.target.value)}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AudioPlayer;
