import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

/**
 * A component that requires authentication to access its children
 * If the user is not authenticated, they are redirected to the login page
 */
const RequireAuth = ({ allowedRoles = ["member", "admin"] }) => {
  const { currentUser } = useSelector((store) => store.auth);
  const location = useLocation();

  // If user is not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have the required role, redirect to unauthorized page
  const userRole = currentUser.role || "member";
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default RequireAuth;