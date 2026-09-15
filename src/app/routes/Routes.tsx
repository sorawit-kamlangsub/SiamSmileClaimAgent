import { Navigate, Outlet } from "react-router-dom";
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
import { SweetAlertTestPage } from "../pages/SweetAlertTestPage.tsx";

import ManageTransferPage from "../modules/ManageClaimFund/pages/ManageTransferPage.tsx";
import RepayPage from "../modules/ManageTransfer/pages/RepayPage.tsx";
import BankStatusCheck from "../modules/BankStatus/pages/BankStatusCheck.tsx";
import IncreaseLimitTransfer from "../modules/IncreaseLimitTransfer/page/IncreaseLimitTransfer.tsx";
import RefundApprovePage from "../modules/RefundApprove/pages/RefundApprovePage.tsx";

import ConsiderMonitorPage from "../modules/ClaimConsider/pages/ConsiderMonitorPage.tsx";
import ConsiderDetailPage from "../modules/ClaimConsider/pages/ConsiderDetailPage.tsx";
import ConsiderHospitalDetailPage from "../modules/ClaimConsider/pages/ConsiderHospitalDetailPage.tsx";
import ConsiderHospitalDocumentPage from "../modules/ClaimConsider/pages/ConsiderHospitalDocumentPage.tsx";
import RefundPage from "../modules/Refund/pages/RefundPage.tsx";
import AdjustTransferPage from "../modules/AdjustTransfer/pages/AdjustTransferPage.tsx";
import ManageRefundDetailPage from "../modules/ManageClaimTransferDetails/pages/ManageRefundDetailPage.tsx";
import ManageAdjustDetailPage from "../modules/ManageClaimTransferDetails/pages/ManageAdjustDetailPage.tsx";
import ConsiderHospitalMonitorPage from "../modules/ClaimConsider/pages/ConsiderHospitalMonitorPage.tsx";
import BillingHospitalMonitorPage from "../modules/BillingClaim/pages/BillingHospitalMonitorPage.tsx";
import BillingHospitalReviewPage from "../modules/BillingClaim/pages/BillingHospitalReviewPage.tsx";
import BillingHospitalDocumentPage from "../modules/BillingClaim/pages/BillingHospitalDocumentPage.tsx";
import BillingCustomerPage from "../modules/BillingClaim/pages/BillingCustomerPage.tsx";

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
    {
        path: "/test-sweetalert",
        title: "test-sweetalert",
        element: <SweetAlertTestPage />,
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
        path: "claim/ph/:appId/:refId/:isContinuous/:oldClaimId",
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
        path: "claim/pa/:appId/:refId/:isContinuous/:oldClaimId",
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

    /**
     * จัดการเงินเคลม
     */
    {
        path: "/manage/adjust-transfer",
        title: "โอนเพิ่ม",
        permissions: [],
        element: <Outlet />,
        children: [
            {
                path: "adjust-transfer",
                title: "โอนเพิ่ม",
                permissions: [],
                element: <AdjustTransferPage />,
                index: true,
            },
            {
                path: "detail/:id",
                title: "โอนเพิ่ม - รายละเอียด",
                element: <ManageAdjustDetailPage />,
                permissions: [],
            },
        ],
    },
    {
        path: "/manage/refund",
        title: "คืนเงิน",
        permissions: [],
        element: <Outlet />,
        children: [
            {
                path: "refund",
                title: "คืนเงิน",
                permissions: [],
                element: <RefundPage />,
                index: true,
            },
            {
                path: "detail/:id",
                title: "คืนเงิน - รายละเอียด",
                element: <ManageRefundDetailPage />,
                permissions: [],
            },
        ],
    },
    {
        path: "/manage/refund-approve",
        title: "อนุมัติคืนเงิน",
        permissions: [],
        element: <RefundApprovePage />,
    },
    {
        path: "/manage/increase-limit-transfer",
        title: "ขยายวงเงิน",
        permissions: [],
        element: <IncreaseLimitTransfer />,
    },
    {
        path: "/manage/transfer/repay",
        title: "แก้ไขการโอนเงิน",
        permissions: [],
        element: <RepayPage />,
    },
    {
        path: "/manage/bank/status",
        title: "สอบถามธนาคาร",
        permissions: [],
        element: <BankStatusCheck />,
    },
    {
        path: "/manage/setting/transfer",
        title: "ตั้งค่าการโอนเงิน",
        permissions: [],
        element: <ManageTransferPage />,
    },
    {
        path: "/consider/monitor",
        title: "พิจารณาเคลม - เคลมลูกค้า",
        element: <Outlet />,
        children: [
            {
                path: "customers",
                title: "เคลมลูกค้า",
                element: <ConsiderMonitorPage />,
                index: true,
            },
            {
                // :caseId (btoa) ต่อจาก :id (btoa) — ส่งมาจากหน้า monitor เพื่อยิง useGetClaimDetailConsider
                path: "customers/:id/:caseId",
                title: "บันทึกข้อมูลเคลม - เคลมลูกค้า",
                element: <ConsiderDetailPage />,
            },
        ],
    },
    {
        path: "/consider/hospital-monitor",
        title: "พิจารณาเคลม - เคลมโรงพยาบาล",
        element: <Outlet />,
        children: [
            {
                index: true,
                title: "เคลมโรงพยาบาล",
                element: <ConsiderHospitalMonitorPage />,
            },
            {
                // :caseId (btoa) ต่อจาก :id (btoa) — ส่งมาจากหน้า monitor เพื่อยิง useGetClaimDetailConsider
                path: "hospital/:id/:caseId",
                title: "บันทึกข้อมูลเคลม - เคลมโรงพยาบาล",
                element: <ConsiderHospitalDetailPage />,
            },
            {
                // :caseId (btoa) ต่อจาก :id (btoa) — หน้าดูเอกสารใช้ useGetClaimDetailConsider เหมือนหน้าพิจารณา
                path: "hospital/:id/:caseId/document",
                title: "ดูรายละเอียดเคลม - เคลมโรงพยาบาล",
                element: <ConsiderHospitalDocumentPage />,
            },
        ],
    },
    // ===== วางบิลเคลม =====
    {
        path: "/billing",
        title: "วางบิลเคลม",
        element: <Outlet />,
        permissions: [],
        children: [
            {
                index: true,
                title: "วางบิลเคลม - เคลมโรงพยาบาล",
                element: <Navigate to="hospital" replace />,
            },
            {
                path: "customers",
                title: "วางบิลเคลม - เคลมลูกค้า",
                element: <BillingCustomerPage />,
            },
            {
                path: "hospital",
                title: "วางบิลเคลม - เคลมโรงพยาบาล",
                element: <BillingHospitalMonitorPage />,
            },
            {
                path: "hospital/:id/review",
                title: "ตรวจสอบรายการวางบิล - เคลมโรงพยาบาล",
                element: <BillingHospitalReviewPage />,
            },
            {
                path: "hospital/:id/document",
                title: "ดูรายละเอียดการวางบิล - เคลมโรงพยาบาล",
                element: <BillingHospitalDocumentPage />,
            },
        ],
    },
];

export default Routes;
