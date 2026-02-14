import { Navigate, Outlet, useLocation } from "react-router";
import { useSyncExternalStore } from "react";
import { isAuthenticated, subscribeToAuthChanges } from "../modules/auth/utils/authStorage";

const PrivateRouter = () => {
  const location = useLocation();

  const authed = useSyncExternalStore(subscribeToAuthChanges, isAuthenticated, () => false);

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default PrivateRouter;