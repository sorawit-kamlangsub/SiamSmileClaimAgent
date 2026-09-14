import { useGetPolicyBenefit } from "../../../../api/coreClaimApi";
import useConsiderDetailHook from "./ConsiderDetailHook";

const usePolicyBenefitHook = () => {
    const { customerDetailData } = useConsiderDetailHook();

    const {
        data: benefit,
        isLoading: benefitLoading,
        isError: benefitError,
    } = useGetPolicyBenefit(
        customerDetailData?.data?.productTypeId ?? 0,
        customerDetailData?.data?.productTypeId === 26 ? customerDetailData?.data?.policyCode : undefined,
        customerDetailData?.data?.productTypeId === 6 ? customerDetailData?.data?.productId : undefined,
        customerDetailData?.data?.productTypeId === 26 ? customerDetailData?.data?.customerTypeCode : undefined
    );
    return {
        benefit,
        benefitLoading,
        benefitError,
    };
};

export default usePolicyBenefitHook;
