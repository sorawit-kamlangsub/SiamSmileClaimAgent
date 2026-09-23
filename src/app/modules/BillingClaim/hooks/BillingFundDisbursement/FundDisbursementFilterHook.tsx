import { useFormik } from "formik";
import { FundDisbursementFilterValues, FundClaimType, getDefaultFundFilter } from "../../store/fundDisbursement.types";

/**
 * ฟอร์มค้นหาหน้า "ตั้งเบิกกองทุน" — pattern เดียวกับ `BillingSearchFilterHook` (วางบิลเคลมโรงพยาบาล):
 * formik อยู่ที่นี่ กดค้นหาแล้ว page เป็นคน copy ค่าไป `appliedFilter` (ดู BillingFundDisbursementPage.tsx)
 *
 * `initialClaimType` มาจาก `?claimType=` ของ URL — ใช้ตอนเด้งมาจากปุ่ม "อนุมัติ" หน้าตรวจสอบรพ.วางบิล
 * (handoff "Business Rule: อนุมัติรายการวางบิลโรงพยาบาล" ข้อ 7)
 */
const useFundDisbursementFilterHook = (initialClaimType?: FundClaimType) => {
    const formik = useFormik<FundDisbursementFilterValues>({
        initialValues: getDefaultFundFilter(initialClaimType),
        onSubmit: () => undefined,
    });

    return { formik };
};

export default useFundDisbursementFilterHook;
