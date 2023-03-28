import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

import { login } from "../../redux/Auth/AuthActions";

export default function Login() {
  const dispatch = useDispatch();
  const auth = useSelector((store) => store.auth);
  const emailRef = useRef();
  const passwordRef = useRef();

  const formSubmitHandler = (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    if (!password.trim() || !email.trim()) return;
    dispatch(
      login({
        email,
        password,
      })
    );
    emailRef.current.value = "";
    passwordRef.current.value = "";
  };

  return (
    <div className="px-4 w-full h-screen flex justify-center items-center bg-login bg-no-repeat bg-cover ">
      <form
        onSubmit={formSubmitHandler}
        action=""
        className="border drop-shadow-2xl bg-white p-6 flex flex-col w-3/4 min-w-[17rem] sm:min-w-[22rem] md:min-w-[25rem] rounded-md hover:backdrop-blur-2xl "
      >
        <input
          className="p-2 mb-4 border-2 rounded focus:outline-none "
          type="text"
          placeholder="email"
          ref={emailRef}
        />
        <input
          className="p-2 mb-4 border-2 rounded focus:outline-none"
          type="password"
          placeholder="Password"
          ref={passwordRef}
        />
        <button
          className="mb-4 rounded-md bg-blue-600 text-white p-2 disabled:bg-blue-600 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-600"
          disabled={auth.isFetching}
        >
          Login
        </button>
        {auth.error && <p>Something went wrong. Please try later...</p>}
        <NavLink to={"/Auth/Register"}>
          <div className="flex items-center justify-center hover:text-transparent  hover:bg-clip-text bg-clip-padding bg-gradient-to-r from-purple-400 to-pink-600 w-fit rounded-md  text-white  px-4 py-2 ease-in-out duration-300">
            <button>register</button>
          </div>
        </NavLink>
      </form>
    </div>
  );
}
