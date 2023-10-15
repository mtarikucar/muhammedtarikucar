import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RequireAuth = () => {
  const { currentUser,role } = useSelector((store) => store.auth);

  if (!currentUser) return <Navigate to={"/login"} />
  if (!auth?.currentUser?.role?.find(role => allowedRoles?.includes(role))) return <Navigate to={"/Home"} />
  return <Outlet />;
};

export default RequireAuth;