import React from "react";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const getJoinRequests = async (communityId, token, id) => {
  const { data } = await axios.get(
    `http://localhost:3000/api/community/join/${communityId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        id: id,
      },
    }
  );
  return data;
};

function useJoinRequests(communityId, token, id) {
  return useQuery(
    ["joinRequests", communityId],
    () => getJoinRequests(communityId, token, id),
    {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (data) => {
        console.log(communityId);
      },
    }
  );
}

const handleRequestAction = async ({ action, requestId, token }) => {
  const { data } = await axios.patch(
    `http://localhost:3000/api/community/join/${requestId}`,
    {
      action: action,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

function Requests() {
  const { token, currentUser } = useSelector((store) => store.auth);

  const {
    data: joinRequests,
  } = useJoinRequests(currentUser.community, token, currentUser._id);

  const acceptRequestMutation = useMutation(
    (requestId) => handleRequestAction({ action: "accept", requestId, token }),
    
  );

  const rejectRequestMutation = useMutation(
    (requestId) => handleRequestAction({ action: "reject", requestId, token }),
  );

  const handleAccept = (requestId) => {
    acceptRequestMutation.mutate(requestId);
  };

  const handleReject = (requestId) => {
    rejectRequestMutation.mutate(requestId);
  };

  return (
    <div className="fixed max-w-sm">
      <section className="flex flex-col justify-center antialiased text-gray-600">
        <div className="relative w-full mx-auto bg-white shadow-lg rounded-lg">
          <header className="pt-6 pb-4 px-5 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                
                <div className="pr-1">
                  <a
                    className="inline-flex text-gray-800 hover:text-gray-900"
                    href="#0"
                  >
                    <h2 className="text-xl leading-snug font-bold">
                      {currentUser.name}
                    </h2>
                  </a>
                  <NavLink
                    to={`/Profile/${currentUser._id}`}
                    className="block text-sm font-medium hover:text-indigo-500"
                    href="#0"
                  >
                    @{currentUser.name}
                  </NavLink>
                </div>
              </div>
            </div>
          </header>

          <div className="py-3 px-5">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-1">
              bildirimler
            </h3>
            <div className="divide-y divide-gray-200">
              <div className="flex items-center">
                <div>
                  <div className="text-[13px]">anasayfaya hoşgeldin, şuanda beta teta ne haltsa testlerinde olan bu sitede geziniyosun daha fazla bilgi almak için sol alttaki  versiyon loguna bakabilirsin</div>
                </div>
              </div>
            </div>
            {currentUser.community && (
              <div className="divide-y divide-gray-200">
                {joinRequests?.map((request) => (
                  <button
                    key={request._id}
                    className="w-full text-left py-2 focus:outline-none focus-visible:bg-indigo-50"
                  >
                    <div className="flex items-center">
                      <img
                        className="rounded-full items-start flex-shrink-0 mr-3"
                        src={request.user.image}
                        width="32"
                        height="32"
                        alt={request.user.name}
                      />
                      <div>
                        <NavLink
                          to={`/Profile/${request.user._id}`}
                          className="text-sm font-semibold text-gray-900"
                        >
                          {request.user.name}
                        </NavLink>
                        <div className="text-[13px]">{request.message}</div>
                      </div>
                      <div>
                        <button
                          className="inline-flex items-center text-sm font-medium text-green-500 hover:text-green-600 focus:outline-none focus-visible:ring-2"
                          onClick={() => handleAccept(request._id)}
                        >
                          <i className="material-icons">check_circle</i>
                        </button>
                        <button
                          className="inline-flex items-center text-sm font-medium text-red-500 hover:text-red-600 focus:outline-none focus-visible:ring-2 ml-4"
                          onClick={() => handleReject(request._id)}
                        >
                          <i className="material-icons">cancel</i>
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Requests;
