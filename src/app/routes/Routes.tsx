import CheckEligibleDetailPage from "../modules/CheckEligible/pages/CheckEligibleDetailPage";
import CheckEligibleMonitorPage from "../modules/CheckEligible/pages/CheckEligibleMonitorPage";
import SurveyPage from "../modules/Survey/pages/SurveyPage";
import TransferSlipPage from "../modules/TransferSlips/pages/TransferSlipPage";
import BlankPage from "../pages/BlankPage";
import { RouteMapType } from "./AuthRoutes";

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
        path: "/checkeligible/monitor",
        title: "Monitor - ตรวจสอบสิทธิ์",
        element: <CheckEligibleMonitorPage />,
        permissions: [],
        condition: "AND",
    },

    {
        path: "/checkeligible/detail/:appId/:refId",
        title: "ตรวจสอบสิทธิ์ - รายละเอียด",
        element: <CheckEligibleDetailPage />,
        permissions: [],
        condition: "AND",
    },

    // ===== แจ้งเคลม =====
    {
        path: "/claim",
        title: "แจ้งเคลม",
        element: <BlankPage body="แจ้งเคลม" />,
        permissions: [],
        condition: "AND",
    },

    // ===== พิจารณาเคลม =====
    {
        path: "/consideration",
        title: "พิจารณาเคลม",
        element: <BlankPage body="พิจารณาเคลม" />,
        permissions: [],
        condition: "AND",
    },

    // Survey

    {
        path: "/survey/:id",
        title: "Survey",
        element: <SurveyPage />,
        hideAppBar: true,
        hideAsideMenu: true,
    },

    // Slip โอนเงิน
    {
        path: "/slip/:id",
        title: "Transfer Slip",
        element: <TransferSlipPage />,
        hideAppBar: true,
        hideAsideMenu: true,
    },
];

export default Routes;
