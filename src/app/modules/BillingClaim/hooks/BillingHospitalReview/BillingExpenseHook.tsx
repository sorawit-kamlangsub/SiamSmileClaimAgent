import { useMemo } from "react";
import { FormikProps } from "formik";
import { round2 } from "../../store/billingMappers";
import { BillingReviewFormValues } from "../../store/billingClaim.types";

/**
 * ยอดที่คำนวณสดจาก `formik.values.expenses` / `ssEndDiscountAmount` (Step 2)
 *
 * สูตรตาม hospital-billing-fe.md ข้อ 6 — ไม่หักส่วนลดรายบรรทัด/ยอดไม่คุ้มครองซ้ำใน netBillableAmount
 */
const useBillingExpenseHook = (formik: FormikProps<BillingReviewFormValues>) => {
    const { expenses, ssEndDiscountAmount } = formik.values;

    const totals = useMemo(() => {
        const totalClaimedAmount = round2(expenses.reduce((sum, item) => sum + (item.claimAmount || 0), 0));
        const totalDiscountAmount = round2(expenses.reduce((sum, item) => sum + (item.discountAmount || 0), 0));
        const totalNonCoveredAmount = round2(expenses.reduce((sum, item) => sum + (item.nonCoveredAmount || 0), 0));
        const netBillableAmount = Math.max(0, round2(totalClaimedAmount - round2(ssEndDiscountAmount)));

        const hasUncoveredWithoutReason = expenses.some(
            (item) => (item.nonCoveredAmount || 0) > 0 && !item.nonCoveredReasonId
        );
        const hasDiscountExceedsClaim = expenses.some((item) => (item.discountAmount || 0) > (item.claimAmount || 0));

        return {
            totalClaimedAmount,
            totalDiscountAmount,
            totalNonCoveredAmount,
            netBillableAmount,
            hasUncoveredWithoutReason,
            hasDiscountExceedsClaim,
        };
    }, [expenses, ssEndDiscountAmount]);

    return totals;
};

export default useBillingExpenseHook;
