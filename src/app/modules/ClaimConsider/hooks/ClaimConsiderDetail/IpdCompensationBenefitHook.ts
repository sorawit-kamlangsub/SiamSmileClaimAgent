import { useMemo } from "react";
import dayjs from "dayjs";
import { useGetCustomerBenefitDetailHalf } from "../../../../api/coreClaimApi";
import {
    GetClaimDetailConsiderDtoResponse,
    GetCustomerDetailByIdDtoResponse,
} from "../../../../api/coreClaimApi.client";
import { CoverageType } from "../../../../functionHelpers";
import { IPD_COMPENSATION_BENEFIT_ID, isIpdCompensationFlow } from "../../store/ipdCompensationCalculator";

/** formatTypeId ของสิทธิ์ความคุ้มครองค่ารักษา (ค่าเดียวกับหน้าแจ้งเคลม — useClaimPHForm.getFormatType) */
const FORMAT_TYPE_MEDICAL = 7;

type UseIpdCompensationBenefitParams = {
    detail: GetClaimDetailConsiderDtoResponse | undefined;
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
    coverageTypeId: number | undefined;
    medicalTypeId: number | undefined;
};

/**
 * DFUAT-101 : อัตราค่าชดเชยผู้ป่วยในต่อวัน ต้องมาจากสิทธิ์ความคุ้มครองของผู้เอาประกัน ไม่ใช่ค่าคงที่
 * อ่านจาก GET /customer/benefit-detail/half (ชุดเดียวกับ "รายละเอียดความคุ้มครอง" ของหน้าแจ้งเคลม) แถว
 * "ค่าชดเชยการนอนรักษาพยาบาลเป็นผู้ป่วยใน" (benefitId 16) → pricePerUnit = อัตราต่อคืน, maxPrice = วงเงินตามสิทธิ์
 *
 * ยิงเฉพาะ flow ค่าชดเชยผู้ป่วยใน (ค่ารักษา + IPD / Day Case) — นอก flow ไม่ยิงและคืน undefined
 * ทุกจุดที่ต้องใช้อัตรานี้ (การ์ด Step 2, gate ปุ่ม ถัดไป/อนุมัติ) เรียก hook นี้ด้วย argument ชุดเดียวกัน
 * react-query จึงใช้ผลเดียวกัน ไม่ยิงซ้ำ
 */
const useIpdCompensationBenefit = ({
    detail,
    customerDetail,
    coverageTypeId,
    medicalTypeId,
}: UseIpdCompensationBenefitParams) => {
    const isFlow = isIpdCompensationFlow(coverageTypeId, medicalTypeId);
    // dayjs object ใหม่ทุก render แต่ query key เทียบด้วยค่า (ISO string) จึงไม่ทำให้ยิงซ้ำ
    const incidentDate = useMemo(
        () => (isFlow && detail?.incidentDate ? dayjs(detail.incidentDate) : undefined),
        [isFlow, detail?.incidentDate]
    );

    const { data, isLoading } = useGetCustomerBenefitDetailHalf(
        isFlow ? customerDetail?.policyCode ?? undefined : undefined,
        incidentDate,
        false,
        detail?.incidentTypeId,
        CoverageType.Medical,
        medicalTypeId,
        undefined,
        FORMAT_TYPE_MEDICAL,
        undefined,
        customerDetail?.customerDetailId
    );

    const benefit = isFlow ? data?.data?.find((item) => item.benefitId === IPD_COMPENSATION_BENEFIT_ID) : undefined;

    return {
        /** อัตราค่าชดเชยต่อวัน (บาท) — undefined = ยังโหลดไม่เสร็จ หรือแผนนี้ไม่มีสิทธิ์ค่าชดเชยผู้ป่วยใน */
        dailyRate: benefit?.pricePerUnit ?? undefined,
        /** วงเงินตามสิทธิ์ (บาท) */
        benefitLimit: benefit?.maxPrice ?? undefined,
        isLoading: isFlow && isLoading,
    };
};

export default useIpdCompensationBenefit;
