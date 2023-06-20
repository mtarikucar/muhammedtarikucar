import React from "react";
import { FcSms } from "react-icons/fc";
import { NavLink } from "react-router-dom";

function MessageBoxButton() {
  return (
    <NavLink to="/chat">
      <div className="fixed right-8 md:right-12 lg:right-16  z-50 bottom-16 drop-shadow-lg hover:p-2 ease-in-out duration-300">
        <span className="inline-block bg-white p-2 rounded-full">
          <FcSms className="m-2"/>
        </span>
      </div>
    </NavLink>
  );
}

export default MessageBoxButton;
