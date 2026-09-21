import { useGetStandardMedicalExpenseByCase } from "../../../../api/coreClaimApi";
import {
    GetCustomerDetailByIdDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
} from "../../../../api/coreClaimApi.client";

/** รหัส formatType SIMB2 — ค่าเดียวกับที่ ClaimExpenseDetailHook (เคลมลูกค้า) ส่ง */
const SIMB2_FORMAT_TYPE_ID = 6;
const PA_PRODUCT_TYPE_ID = 26;

/**
 * รายละเอียดค่าใช้จ่ายของเคลม Death & Disability — ใช้ GetStandardMedicalExpenseByCase ตัวเดียวกับเคลมลูกค้า
 * ต่างจาก ClaimExpenseDetailHook ตรงที่หน้านี้ไม่มี formik ให้เลือกความคุ้มครอง จึงใช้ coverageTypeId จาก detail
 */
const useDeathDisabilityExpenseHook = (
    detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined,
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined
) => {
    const { data, isLoading } = useGetStandardMedicalExpenseByCase(
        detail?.caseId ?? "",
        customerDetail?.productTypeId ?? 0,
        SIMB2_FORMAT_TYPE_ID,
        detail?.coverageTypeId,
        undefined,
        detail?.causeOfIncidentId,
        customerDetail?.productId ?? undefined,
        customerDetail?.policyCode,
        customerDetail?.productTypeId === PA_PRODUCT_TYPE_ID ? customerDetail?.customerTypeCode : undefined
    );

    return { expenseItems: data?.data ?? [], expenseLoading: isLoading };
};

export default useDeathDisabilityExpenseHook;
