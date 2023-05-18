import React, { useRef, useState } from "react";
import { FaPlay, FaPause, FaVolumeUp } from "react-icons/fa";
import { FiChevronsRight, FiChevronsLeft } from "react-icons/fi";

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time - minutes * 60);

  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

const AudioPlayer = ({ src, homepage }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
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
        className={`bg-indigo-500 text-white px-6 py-4 rounded  hover:px-8 ease-in-out duration-300 ${playing ? "px-8": ""}`}
      >
        {playing ? <FaPause /> : <FaPlay />}
      </button>

      {!homepage && (
        <>
          <div className="flex items-center justify-between w-full mt-5">
            <button
              onClick={() => changeCurrentTime(currentTime - 5)}
              className="bg-indigo-500 text-white p-2 rounded mx-3 flex items-center"
            >
              <FiChevronsLeft /> 5
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
              5 <FiChevronsRight />
            </button>
          </div>
          <div className="flex items-center justify-between w-full mt-5">
            <div className="pr-2 m-3">
              <FaVolumeUp />
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
