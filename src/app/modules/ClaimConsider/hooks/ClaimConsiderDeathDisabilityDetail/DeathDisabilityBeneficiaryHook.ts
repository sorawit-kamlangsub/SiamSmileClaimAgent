import { useGetDeathAndDisabilityBeneficiary } from "../../../../api/coreClaimApi";
import { GetDeathAndDisabilityClaimDetailConsiderDtoResponse } from "../../../../api/coreClaimApi.client";

/** รายการผู้รับผลประโยชน์ของเคลม Death & Disability (GetDeathAndDisabilityBeneficiary) */
const useDeathDisabilityBeneficiaryHook = (detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined) => {
    const { data, isLoading } = useGetDeathAndDisabilityBeneficiary(detail?.claimId ?? "", detail?.caseId ?? "");
    const beneficiaries = data?.data ?? [];
    const totalPayoutAmount = beneficiaries.reduce((sum, item) => sum + (item.payoutAmount ?? 0), 0);

    return { beneficiaries, beneficiaryLoading: isLoading, totalPayoutAmount };
};

export default useDeathDisabilityBeneficiaryHook;
