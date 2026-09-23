import { useMemo } from "react";
import { useGetCaseDisabilityBenefitByCaseId, useGetStandardMedicalExpenseByCase } from "../../../../api/coreClaimApi";
import {
    GetCustomerDetailByIdDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
} from "../../../../api/coreClaimApi.client";

/** รหัส formatType SIMB2 — ค่าเดียวกับที่ ClaimExpenseDetailHook (เคลมลูกค้า) ส่ง */
const SIMB2_FORMAT_TYPE_ID = 6;
const PA_PRODUCT_TYPE_ID = 26;
/** coverageTypeId ทุพพลภาพ/สูญเสียอวัยวะ */
export const DISABILITY_COVERAGE_TYPE_ID = 4;

/** รูปแบบกลางของรายการค่าใช้จ่าย — map จากทั้ง 2 API ให้ section แสดงเหมือนกัน */
export type DeathDisabilityExpenseItem = {
    key: string | number;
    description: string | undefined;
    maximumLimit: number | undefined;
    netCaseAmount: number | undefined;
};

/**
 * รายละเอียดค่าใช้จ่ายของเคลม Death & Disability
 * - เคลมทุพพลภาพ/สูญเสียอวัยวะ (coverageTypeId 4): GetCaseDisabilityBenefitByCaseId (วงเงินจาก maxPrice)
 * - อื่นๆ: GetStandardMedicalExpenseByCase ตัวเดียวกับเคลมลูกค้า
 * ยิงเฉพาะ API ของกรณีนั้น อีกตัวถูก disable
 */
const useDeathDisabilityExpenseHook = (
    detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined,
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined
) => {
    const isDisability = detail?.coverageTypeId === DISABILITY_COVERAGE_TYPE_ID;
    const customerTypeCode =
        customerDetail?.productTypeId === PA_PRODUCT_TYPE_ID ? customerDetail?.customerTypeCode : undefined;

    const { data: standardData, isLoading: standardLoading } = useGetStandardMedicalExpenseByCase(
        // caseId ว่าง = disable query (เคลม disability ใช้อีก API)
        isDisability ? "" : detail?.caseId ?? "",
        customerDetail?.productTypeId ?? 0,
        SIMB2_FORMAT_TYPE_ID,
        detail?.coverageTypeId,
        undefined,
        detail?.causeOfIncidentId,
        customerDetail?.productId ?? undefined,
        customerDetail?.policyCode,
        customerTypeCode
    );
    const { data: disabilityData, isLoading: disabilityLoading } = useGetCaseDisabilityBenefitByCaseId(
        detail?.caseId ?? "",
        customerDetail?.productTypeId,
        customerDetail?.productId ?? undefined,
        detail?.incidentTypeId,
        detail?.coverageTypeId,
        detail?.causeOfIncidentId,
        customerDetail?.policyCode,
        customerTypeCode,
        isDisability
    );

    const expenseItems: DeathDisabilityExpenseItem[] = useMemo(
        () =>
            isDisability
                ? (disabilityData?.data ?? []).map((item, index) => ({
                      key: item.caseDisabilityId ?? index,
                      description: item.descriptionTH,
                      maximumLimit: item.maxPrice,
                      netCaseAmount: item.netCaseAmount,
                  }))
                : (standardData?.data ?? []).map((item, index) => ({
                      key: item.caseItemId ?? item.standardMedicalExpenseId ?? index,
                      description: item.descriptionTH || item.descriptionEN,
                      maximumLimit: item.maximumLimit,
                      netCaseAmount: item.netCaseAmount,
                  })),
        [isDisability, disabilityData, standardData]
    );

    return {
        expenseItems,
        expenseLoading: isDisability ? disabilityLoading : standardLoading,
        /** รายการทุพพลภาพดิบ (มี bodyPartId) — ใช้ส่ง case.caseDisability ตอนบันทึกผลพิจารณา */
        disabilityBenefits: isDisability ? disabilityData?.data ?? [] : [],
        /** รายการค่าใช้จ่ายดิบของเคลมเสียชีวิต — ใช้ส่ง case.caseItem ตอนบันทึกผลพิจารณา */
        standardExpenses: isDisability ? [] : standardData?.data ?? [],
    };
};

export default useDeathDisabilityExpenseHook;
