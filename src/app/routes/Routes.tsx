import { Outlet } from "react-router-dom";
import CheckEligibleDetailPage from "../modules/CheckEligible/pages/CheckEligibleDetailPage";
import ClaimPHPage from "../modules/CreatedClaim/pages/CreateClaim/ClaimPH/ClaimPHPage";
import ClaimPHSummaryPage from "../modules/CreatedClaim/pages/CreateClaim/ClaimPH/ClaimPHSummaryPage";
import MonitorPage from "../modules/CreatedClaim/pages/Monitor/MonitorPage";
import BlankPage from "../pages/BlankPage";
import { RouteMapType } from "./AuthRoutes";
import ClaimPAPage from "../modules/CreatedClaim/pages/CreateClaim/ClaimPA/ClaimPAPage";
import ClaimPASummaryPage from "../modules/CreatedClaim/pages/CreateClaim/ClaimPA/ClaimPASummaryPage";
// import ClaimLinePage from "../modules/CreatedClaim/pages/ClaimLine/ClaimLinePage";
// import ClaimLineSummaryPage from "../modules/CreatedClaim/pages/ClaimLine/ClaimLineSummaryPage";
// import DaysCalculatePage from "../modules/CreatedClaim/pages/ClaimSimulate/DaysCalculatePage.tsx";
// import ClaimLineCalculatePage from "../modules/CreatedClaim/pages/ClaimSimulate/ClaimLineCalculatePage.tsx";
import ClaimSimulateSummaryPage from "../modules/ClaimSimulate/pages/ClaimSimulateSummaryPage.tsx";
import ClaimSimulatePage from "../modules/ClaimSimulate/pages/ClaimSimulatePage.tsx";
import { ExtraPaymentListPage } from "../modules/ExtraPayment/pages/ExtraPaymentListPage.tsx";
import ExtraPaymentPage from "../modules/ExtraPayment/pages/ExtraPaymentPage.tsx";

/**
 * Config ของ route ของ Project
 *
 * รูปแบบของ Config นี้ จะมี ดังนี้
 * ```
 * {
 *         path: string,            // ที่อยู่ของ path url ที่จะใช้
 *        title: string,            // ชื่อของหน้าที่จะใช้แสดง
 *      element: JSX.Element,       // หน้าที่จะใช้แสดง
 *    children?: RouteMapType[],    // ถ้ามี children จะเป็นการกำหนด route ของหน้านั้นๆ
 *       index?: boolean,           // ถ้าเป็น true ต้ว Element จะเป็นหน้าแรกที่จะแสดง
 * permissions?: string[],          // กำหนด permission ที่จะใช้เข้าถึงหน้านี้ได้
 *   condition?: "AND" | "OR",      // กำหนดว่า permission เป็นการ AND หรือ OR
 * }
 * ```
 */

const Routes: RouteMapType[] = [
    {
        path: "/blank-page",
        title: "Blank Page",
        element: <BlankPage body="Blank Page" />,
    },
    // ===== ตรวจสอบสิทธิ์ =====

    {
        path: "/checkeligible/detail/:cusId",
        title: "ตรวจสอบสิทธิ์ - รายละเอียด",
        element: <CheckEligibleDetailPage />,
        permissions: [],
        condition: "AND",
    },

    // ===== แจ้งเคลม =====
    {
        path: "/monitor-claim",
        title: "Monitor - แจ้งเคลม",
        element: <MonitorPage />,
        permissions: [],
        condition: "AND",
        children: [],
    },
    {
        path: "claim/ph/:appId/:refId",
        title: "แจ้งเคลม - PH",
        element: <Outlet />,
        permissions: [],
        condition: "AND",
        children: [
            {
                index: true,
                title: "แจ้งเคลม - PH",
                element: <ClaimPHPage />,
            },
            {
                path: "summary",
                title: "สรุปรายการเคลม",
                element: <ClaimPHSummaryPage />,
                permissions: [],
                condition: "AND",
            },
        ],
    },
    {
        path: "claim/pa/:appId/:refId",
        title: "แจ้งเคลม - PA",
        element: <Outlet />,
        permissions: [],
        condition: "AND",
        children: [
            {
                index: true,
                title: "แจ้งเคลม - PA",
                element: <ClaimPAPage />,
            },
            {
                path: "summary",
                title: "สรุปรายการเคลม",
                element: <ClaimPASummaryPage />,
                permissions: [],
                condition: "AND",
            },
        ],
    },
    {
        path: "/claim-simulation",
        title: "คำนวณวงเงินเคลม",
        element: <Outlet />,
        permissions: [],
        condition: "AND",
        children: [
            {
                index: true,
                title: "คำนวณวงเงินเคลม",
                element: <ClaimSimulatePage />,
            },
            {
                path: "summary",
                title: "สรุปรายการเคลม",
                element: <ClaimSimulateSummaryPage />,
                permissions: [],
                condition: "AND",
            },
        ],
    },
    // ===== พิจารณาเคลม =====
    {
        path: "/consideration",
        title: "พิจารณาเคลม",
        element: <BlankPage body="พิจารณาเคลม" />,
        permissions: [],
        condition: "AND",
    },

    // ===== โอนเพิ่ม =====
    {
        path: "/payment-monitor",
        title: "Monitor-โอนเงิน",
        permissions: [],
        condition: "AND",
        children: [
            {
                index: true,
                title: "โอนเพิ่ม",
                element: <ExtraPaymentListPage />,
            },
            {
                path: "extra-payment",
                title: "โอนเพิ่ม",
                element: <ExtraPaymentPage />,
                permissions: [],
                condition: "AND",
            },
        ],
    },
];

export default Routes;
