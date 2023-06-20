import { useEffect, useState,useRef } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function MessageBox({ room, socket }) {
  const {currentUser} = useSelector((store) => store.auth);

  const scrollRef = useRef();

  const [newMessage, setNewMessage] = useState("");
  const [messages,setMessages] = useState([])

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/message/${room._id}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch messages");
    }
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    ["messages"],
    fetchMessages,
    {
      onSuccess: (data) => {
        setMessages(data)
      }
    },
  );

  const sendMessage = () => {
    const messageData = {
      roomID: room._id,
      message: newMessage,
      username: currentUser.name,
      sender: currentUser._id,
    };
    socket.emit("sendMessage", messageData);
    setNewMessage("");
    refetch();
  };

  useEffect(() => {
    if(room){
    refetch();
    console.log(socket);
    socket.emit("room", room);
    socket.emit("add-user", {currentUser,room});
    // Socket event for receiving messages
    socket.on("receiveMessage", (message) => {
      // Update the messages state with the received message
      console.log(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }else
    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      socket.emit("leaveRoom", room);
    };
  }, [room]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  if (isError) {
    return <div>Error fetching messages</div>;
  }

  return (
    <div className="flex p-2 sm:p-6 justify-between flex-col h-[80vh] w-full">
      <>
        <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 ">
          <div className="relative flex items-center space-x-4">
            <div className="flex flex-col leading-tight">
              <div className="text-2xl mt-1 flex items-center">
                <span className="text-gray-700 mr-3">{room.name}</span>
              </div>
            </div>
          </div>
        </div>
        <div
          id="messages"
          className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
        >
          {messages.map((message) => (
            <div className="chat-message"  ref={scrollRef} key={message._id}>
              <div
                className={`flex items-end ${
                  message.sender._id === currentUser._id && "justify-end"
                }`}
              >
                <div
                  className={`flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 ${
                    message.sender._id === currentUser._id ? "items-end" : "items-start"
                  } `}
                >
                  <div>
                    <span
                      className={`px-4 py-2 rounded-lg inline-block  ${
                        message.sender._id === currentUser._id 
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {message.message}
                    </span>
                  </div>
                </div>
                {!message.sender._id === currentUser._id && (
                  <span className="font-light border p-1 rounded-lg hover:">
                    {message.username}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
          <div className="relative flex">
            <input
              type="text"
              placeholder="Write your message!"
              className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-3 bg-gray-200 rounded-l-md py-3"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-r-full h-12 w-12 transition duration-500 ease-in-out text-white bg-teal-500 hover:bg-teal-400 focus:outline-none"
                onClick={sendMessage}  // Added onClick event handler
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                
              </button>
            
          </div>
        </div>
      </>
    </div>
  );
}

export default MessageBox;
