import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Replace the URL with your Socket.io server URL

function MessageBox({ room }) {
  const user = useSelector((store) => store.auth.currentUser);

  const [newMessage, setNewMessage] = useState("");

  const fetchMessages = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/message/", {
        offer: room._id,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch messages");
    }
  };

/*   const {
    data: messages,
    isLoading,
    isError,
  } = useQuery(["messages"], fetchMessages, {
    refetchInterval: 100,
  });
 */


  useEffect(() => {
    if (isError) {
      console.log("Error fetching messages");
    }

    // Join the room for the offer
    socket.emit("joinRoom", room._id);

    // Listen for new messages
    socket.on("newMessage", (message) => {
      // Update the messages state with the new message
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up the socket event listener when the component unmounts
    return () => {
      socket.off("newMessage");
    };
  }, [isError]);
  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  if (isError) {
    return <div>Error fetching messages</div>;
  }

  return (
    <div className="flex-1 p-2 sm:p-6 justify-between flex flex-col h-[80vh]">
      <>
        <div className="container m-auto flex my-10 border rounded-sm drop-shadow-md">
          <div className="flex-1 p:2 sm:p-6 justify-start flex flex-col h-[80vh] bg-gray-200  overflow-y-scroll">
            {offers?.map(
              (offer) =>
                offer.status === "pending" && (
                  <div
                    key={offer._id}
                    className="m-3 sm:px-6 lg:px-8 hover:pt-4 ease-in-out duration-300 cursor-pointer"
                    onClick={() => setSelectedOffer(offer)}
                  >
                    <div className="mx-auto  max-w-2xl rounded-md">
                      <div className="bg-white shadow">
                        <div className="px-4 py-2 sm:px-8 sm:py-10">
                          <ul className="-my-8 flex w-full justify-between items-center ">
                            <div className="mr-2">
                              <div className=" p-3 ">
                                <span>muhatap:</span>
                                <span className="text-sm text-gray-700">
                                  kişi
                                </span>
                              </div>
                            </div>
                            <li className="flex flex-col space-y-3 py-6 text-left sm:flex-row sm:space-x-5 sm:space-y-0">
                              <div className="shrink-0">
                                <img
                                  className="h-12 w-12 max-w-full rounded-lg object-cover"
                                  src={offer.offerProductId.image}
                                  alt=""
                                />
                              </div>

                              <div className="relative flex flex-1 flex-col justify-between">
                                <div className="sm:col-gap-5 ">
                                  <div className="pr-8 sm:pr-5">
                                    <p className="text-base font-semibold text-gray-900">
                                      {offer.offerProductId.title}
                                    </p>
                                    <p className="mx-0 mt-1 mb-0 text-sm text-gray-400">
                                      ₺{offer.offerProductId.price}.00
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <span className="flex mx-3 text-2xl">x</span>
                            <li className="flex flex-col space-y-3 py-6 text-left sm:flex-row sm:space-x-5 sm:space-y-0">
                              <div className="shrink-0">
                                <img
                                  className="h-12 w-12 max-w-full rounded-lg object-cover"
                                  src={offer.wantedProductId.image}
                                  alt=""
                                />
                              </div>

                              <div className="relative flex flex-1 flex-col justify-between">
                                <div className="sm:col-gap-5 ">
                                  <div className="pr-8 sm:pr-5">
                                    <p className="text-base font-semibold text-gray-900">
                                      {offer.wantedProductId.title}
                                    </p>
                                    <p className="mx-0 mt-1 mb-0 text-sm text-gray-400">
                                      ₺{offer.wantedProductId.price}.00
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
          {selectedOffer && <MessageBox offer={selectedOffer} />}
        </div>
      </>
    </div>
  );
}

export default MessageBox;
