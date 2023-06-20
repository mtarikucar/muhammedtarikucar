import React, { useState, useEffect, useRef } from "react";
import MessageBox from "../components/MessageBox";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import io from "socket.io-client"; // Import socket.io client library

const socket = io("http://localhost:3000");

function Chat() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { currentUser, token } = useSelector((store) => store.auth);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  const {
    data: rooms,
    isLoading,
    isError,
    error,
  } = useQuery(
    ["room", currentUser._id],
    async () => {
      const response = await axios.get(
        `http://localhost:3000/api/room/${currentUser._id}`,
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
    },
    {
      enabled: !!currentUser._id,
      onSuccess: (data) => {},
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="h-screen px-24 sm:px-2 w-full">
      <div className="container m-auto flex my-10 border rounded-sm w-full">
        <div
          className={` p-4 sm:p-6 justify-start flex flex-col h-[80vh] bg-gray-200  overflow-y-scroll scrollbar-thumb-gray-900 scrollbar-track-gray-100 scrollbar-thin ${
            selectedRoom ? "w-36 items-center" : "w-full"
          }`}
        >
          {rooms?.map((room) => (
            <>
              <div
                key={room._id}
                className="my-2 p-2 w-fit bg-white shadow rounded-md flex justify-center items-center gap-4 hover:p-4 ease-in-out duration-300"
                onClick={() =>
                  setSelectedRoom(selectedRoom === room ? null : room)
                }
              >
                <img
                  src={
                    room.image
                      ? room.image
                      : `https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=2000`
                  }
                  alt=""
                  className="h-12 rounded-md"
                />
                {!selectedRoom && (
                  <h2 className="text-xl font-bold">{room.name}</h2>
                )}
              </div>
            </>
          ))}
        </div>
        {selectedRoom && (
          <div className="ease-in-out duration-300 w-full">
            <MessageBox room={selectedRoom} socket={socket} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
