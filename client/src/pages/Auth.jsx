import React, { useEffect, useState } from "react";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import { useLocation } from "react-router-dom";

function Auth() {
  const [Url, setUrl] = useState("Login");

  const location = useLocation();

  useEffect(() => {
    setUrl(location.pathname.split("/")[2]);
  }, [location]);

  useEffect;
  return <div>{Url == "Login" ? <Login /> : <Register />}</div>;
}

export default Auth;
