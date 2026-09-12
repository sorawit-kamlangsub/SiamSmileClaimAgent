import { BILLING_STATUS, BILLING_STATUS_LABEL, BillingStatusId } from "./billingClaim.types";

/**
 * สีของ Chip สถานะรายการ (pattern เดียวกับ backgroundColorMapDecision ใน functionHelpers.ts)
 *
 * สถานะเป็นของ BE ล้วน — ไม่มีการคำนวณฝั่ง FE (ต่างจากตอน mock ที่เคยมี `recalcBillingStatus`
 * คำนวณเอง เพราะตอนนั้นยังไม่มี backend เป็นเจ้าของ state)
 */
export const backgroundColorMapBillingStatus: Record<BillingStatusId, string> = {
    [BILLING_STATUS.pendingReview]: "#FFF1CD",
    [BILLING_STATUS.needsCorrection]: "#FFF1CD",
    [BILLING_STATUS.passed]: "#D4EDBC",
    [BILLING_STATUS.rejected]: "#FFCFC9",
    [BILLING_STATUS.cancelled]: "#FFCFC9",
};

export const colorMapBillingStatus: Record<BillingStatusId, string> = {
    [BILLING_STATUS.pendingReview]: "#a56e07",
    [BILLING_STATUS.needsCorrection]: "#a56e07",
    [BILLING_STATUS.passed]: "#11734B",
    [BILLING_STATUS.rejected]: "#B32615",
    [BILLING_STATUS.cancelled]: "#B32615",
};

export const billingStatusLabel = (statusId?: number): string =>
    statusId !== undefined && statusId in BILLING_STATUS_LABEL
        ? BILLING_STATUS_LABEL[statusId as BillingStatusId]
        : "-";

/** สถานะคำขอส่งกลับ — "Pending" = BE บันทึกคำขอแล้ว ยังไม่ยืนยันว่า SmileConnect รับ (handoff ข้อ "สถานะและเหตุผล") */
export const billingReturnStatusLabel = (raw: string | undefined): string =>
    raw === "Pending" ? "รอดำเนินการส่งกลับ" : raw ?? "-";
