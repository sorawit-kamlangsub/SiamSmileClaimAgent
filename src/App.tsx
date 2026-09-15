import { useQueryClient } from "@tanstack/react-query";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./app/layout/Layout";
import { NoticePage } from "./app/modules/_auth";
import Home from "./app/pages/Home";
import { AuthRoutes, RouteMapType, createRouteObject } from "./app/routes";
import Routes from "./app/routes/Routes";
import TransferSlipPage from "./app/modules/TransferSlips/pages/TransferSlipPage";
import LayoutPublic from "./app/layout/LayoutPublic";
import SurveyPage from "./app/modules/Survey/pages/SurveyPage";
import SurveySummaryPage from "./app/modules/Survey/pages/SurveySummaryPage";

function App() {
    const queryClient = useQueryClient();

    const CombineRouteConfig: RouteMapType[] = [
        ...AuthRoutes,
        {
            path: "/",
            element: <Layout />,
            title: "Home",
            children: [
                { index: true, title: "Home", element: <Home />, icon: "home" },
                {
                    path: "/unauthorized",
                    title: "Unauthorized",
                    element: <NoticePage title="401 Unautorized" body="คุณไม่มีสิทธ์ เข้าถึงหน้านี้" />,
                },
                ...Routes,
            ],
        },
        {
            // Slip โอนเงิน
            path: "/slip",
            title: "Transfer Slip",
            element: <LayoutPublic />,
            children: [
                {
                    path: ":id",
                    title: "Transfer Slip",
                    element: <TransferSlipPage />,
                    hideAppBar: true,
                    hideAsideMenu: true,
                },
            ],
        },
        // Survey
        {
            path: "/survey",
            title: "Survey",
            element: <LayoutPublic />,
            children: [
                { index: true, title: "Survey", element: <SurveyPage />, hideAppBar: true, hideAsideMenu: true },
                {
                    path: ":id",
                    title: "Survey",
                    element: <SurveyPage />,
                    hideAppBar: true,
                    hideAsideMenu: true,
                },
                {
                    path: "summary/:id",
                    title: "Survey Summary",
                    element: <SurveySummaryPage />,
                    hideAppBar: true,
                    hideAsideMenu: true,
                },
            ],
            hideAppBar: true,
            hideAsideMenu: true,
        },
        {
            path: "*",
            title: "Not Found",
            element: <Navigate to="/not-found" />,
        },
    ];

    const routeObjects = CombineRouteConfig.map((route) => createRouteObject(route, queryClient));

    const router = createBrowserRouter(routeObjects, {
        basename: import.meta.env.BASE_URL,
    });

    return <RouterProvider router={router} />;
}

export default App;
