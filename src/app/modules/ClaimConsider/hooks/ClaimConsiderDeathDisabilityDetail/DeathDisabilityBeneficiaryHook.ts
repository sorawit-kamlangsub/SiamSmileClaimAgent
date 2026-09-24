import { useGetDeathAndDisabilityBeneficiary } from "../../../../api/coreClaimApi";
import {
    GetDeathAndDisabilityBeneficiaryDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
} from "../../../../api/coreClaimApi.client";

/**
 * รายการผู้รับผลประโยชน์ของเคลม Death & Disability (GetDeathAndDisabilityBeneficiary)
 *
 * การแก้ไขจาก dialog "แก้ไขข้อมูล" บันทึกผ่าน UpdateBeneficiary ทันที แล้วรายการนี้โหลดใหม่เอง
 */
const useDeathDisabilityBeneficiaryHook = (detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined) => {
    const { data, isLoading } = useGetDeathAndDisabilityBeneficiary(detail?.claimId ?? "", detail?.caseId ?? "");
    const beneficiaries: GetDeathAndDisabilityBeneficiaryDtoResponse[] = data?.data ?? [];
    const totalPayoutAmount = beneficiaries.reduce((sum, item) => sum + (item.payoutAmount ?? 0), 0);

    return {
        beneficiaries,
        beneficiaryLoading: isLoading,
        totalPayoutAmount,
    };
};

export default useDeathDisabilityBeneficiaryHook;
