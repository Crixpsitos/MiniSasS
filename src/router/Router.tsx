import { createBrowserRouter } from "react-router";
import { lazyRoute } from "./lazyRoute";

const router = createBrowserRouter([
    {
        path: "/login",
        lazy: lazyRoute(() => import("../modules/auth/pages/Login")),
    },
    {
        lazy: lazyRoute(() => import("./PrivateRouter")),
        children: [
            {
                path: "/",
                lazy: lazyRoute(() => import("@/modules/dashboard/layout/DashboardLayout")),
                children: [
                    {
                        index: true,
                        lazy: lazyRoute(() => import("../modules/dashboard/pages/Dashboard")),
                    },
                    {
                        path: "upload-videos",
                        lazy: lazyRoute(() => import("../modules/uploadVideos/pages/UploadVideo")),
                    },
                ],
            },

        ],
    },
    {
        path: "*",
        lazy: lazyRoute(() => import("../modules/notFound/pages/NotFound")),
    }
]);

export default router;