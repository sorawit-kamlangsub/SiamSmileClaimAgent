import { useFormik } from "formik";
import {
    BILLING_SEARCH_BY,
    BILLING_STATUS,
    BillingSearchByField,
    BillingStatusId,
} from "../../store/billingClaim.types";

export type BillingSearchFilterValues = {
    searchBy: BillingSearchByField;
    searchBy_selectedText: string;
    searchDetail: string;
    statusId: BillingStatusId;
};

/** ค่าเริ่มต้นของฟอร์มค้นหา — สถานะรายการ Default = "รอตรวจสอบ" (statusId 1) */
export const getDefaultBillingFilter = (): BillingSearchFilterValues => ({
    searchBy: BILLING_SEARCH_BY.insuredName,
    searchBy_selectedText: "",
    searchDetail: "",
    statusId: BILLING_STATUS.pendingReview,
});

const useBillingSearchFilterHook = () => {
    const formik = useFormik<BillingSearchFilterValues>({
        initialValues: getDefaultBillingFilter(),
        onSubmit: () => undefined,
    });

    return { formik };
};

export default useBillingSearchFilterHook;
