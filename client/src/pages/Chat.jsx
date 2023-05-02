import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messageInput = useRef(null);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message !== "") {
      socket.emit("sendMessage", message);
      setMessage("");
      messageInput.current.focus();
    }
  };

  return (
    <div className="flex h-screen  p-12 justify-center items-center">
      <div className="flex h-full antialiased text-gray-800 w-3/4">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <div className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
            <div className="flex flex-row items-center justify-center h-12 w-full">
              <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  ></path>
                </svg>
              </div>
              <div className="ml-2 font-bold text-2xl">QuickChat</div>
            </div>
            <div className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
              <div className="h-20 w-20 rounded-full border overflow-hidden">
                <img
                  src="https://avatars3.githubusercontent.com/u/2763884?s=128"
                  alt="Avatar"
                  className="h-full w-full"
                />
              </div>
              <div className="text-sm font-semibold mt-2">Aminos Co.</div>
              <div className="text-xs text-gray-500">Lead UI/UX Designer</div>
              <div className="flex flex-row items-center mt-3">
                <div className="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full">
                  <div className="h-3 w-3 bg-white rounded-full self-end mr-1"></div>
                </div>
                <div className="leading-none ml-1 text-xs">Active</div>
              </div>
            </div>
            <div className="flex flex-col mt-8">
              <div className="flex flex-row items-center justify-between text-xs">
                <span className="font-bold">Active Conversations</span>
                <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
                  4
                </span>
              </div>
              <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
                <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                  <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                    H
                  </div>
                  <div className="ml-2 text-sm font-semibold">Henry Boyd</div>
                </button>
                <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                  <div className="flex items-center justify-center h-8 w-8 bg-gray-200 rounded-full">
                    M
                  </div>
                  <div className="ml-2 text-sm font-semibold">Marta Curtis</div>
                  <div className="flex items-center justify-center ml-auto text-xs text-white bg-red-500 h-4 w-4 rounded leading-none">
                    2
                  </div>
                </button>
                <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                  <div className="flex items-center justify-center h-8 w-8 bg-orange-200 rounded-full">
                    P
                  </div>
                  <div className="ml-2 text-sm font-semibold">
                    Philip Tucker
                  </div>
                </button>
                <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                  <div className="flex items-center justify-center h-8 w-8 bg-pink-200 rounded-full">
                    C
                  </div>
                  <div className="ml-2 text-sm font-semibold">
                    Christine Reid
                  </div>
                </button>
                <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                  <div className="flex items-center justify-center h-8 w-8 bg-purple-200 rounded-full">
                    J
                  </div>
                  <div className="ml-2 text-sm font-semibold">Jerry Guzman</div>
                </button>
              </div>
              <div className="flex flex-row items-center justify-between text-xs mt-6">
                <span className="font-bold">Archivied</span>
                <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
                  7
                </span>
              </div>
              <div className="flex flex-col space-y-1 mt-4 -mx-2">
                <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                  <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                    H
                  </div>
                  <div className="ml-2 text-sm font-semibold">Henry Boyd</div>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-auto h-full p-6">
            <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
              <div className="flex flex-col h-full overflow-x-auto mb-4">
                <div className="flex flex-col h-full">
                  <div className="grid grid-cols-12 gap-y-2">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`${
                          msg.isOwn
                            ? "col-start-6 col-end-13"
                            : "col-start-1 col-end-8"
                        } p-3 rounded-lg`}
                      >
                        <div
                          className={`${
                            msg.isOwn
                              ? "flex items-center justify-start flex-row-reverse"
                              : "flex flex-row items-center"
                          }`}
                        >
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                            {msg.isOwn ? "Y" : "A"}
                          </div>
                          <div
                            className={`${
                              msg.isOwn ? "mr-3" : "ml-3"
                            } relative text-sm ${
                              msg.isOwn ? "bg-indigo-100" : "bg-white"
                            } py-2 px-4 shadow rounded-xl`}
                          >
                            <div>{msg.text}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
                <div className="flex-grow ml-4">
                  <div className="relative w-full">
                    <input
                      type="text"
                      ref={messageInput}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                    />
                    <button
                      onClick={sendMessage}
                      className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="ml-4">
                  <button className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0">
                    <span>Send</span>
                    <span className="ml-2">
                      <svg
                        className="w-4 h-4 transform rotate-45 -mt-px"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        ></path>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
