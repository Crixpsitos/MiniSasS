import { Navigate, Outlet, useLocation } from "react-router";
import { isAuthenticated } from "../modules/auth/utils/authStorage";

const PrivateRouter = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default PrivateRouter;