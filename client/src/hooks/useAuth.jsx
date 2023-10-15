import { useDebugValue } from "react";
import { useSelector } from "react-redux";

const useAuth = () => {
  const auth = useSelector((store) => store.auth);

  useDebugValue(auth, (auth) => (auth?.currentUser ? "Logged In" : "Logged Out"));
  return auth;
};

export default useAuth;
