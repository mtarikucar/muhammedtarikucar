import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RequireAuth = () => {
  const { currentUser,role } = useSelector((store) => store.auth);

  if (!currentUser) return <Navigate to={"/login"} />
  return <Outlet />;
};

export default RequireAuth;