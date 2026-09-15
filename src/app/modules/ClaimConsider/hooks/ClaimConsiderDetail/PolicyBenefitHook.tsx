import { useGetCustomerDetailById, useGetPolicyBenefit } from "../../../../api/coreClaimApi";

/**
 * รับ customerDetailData เป็น param แทนที่จะเรียก useConsiderDetailHook() เอง
 * เพื่อให้ reuse ข้ามหน้าพิจารณาเคลมได้ (ลูกค้า/โรงพยาบาล) โดยไม่ลาก formik + Redux sync
 * ของ useConsiderDetailHook (เฉพาะ flow เคลมลูกค้า) ติดมาด้วย
 */
const usePolicyBenefitHook = (customerDetailData?: ReturnType<typeof useGetCustomerDetailById>["data"]) => {
    const { data: benefit, isLoading: benefitLoading } = useGetPolicyBenefit(
        customerDetailData?.data?.productTypeId ?? 0,
        customerDetailData?.data?.productTypeId === 26 ? customerDetailData?.data?.policyCode : undefined,
        customerDetailData?.data?.productTypeId === 6 ? customerDetailData?.data?.productId : undefined,
        customerDetailData?.data?.productTypeId === 26 ? customerDetailData?.data?.customerTypeCode : undefined
    );
    return {
        benefit,
        benefitLoading,
    };
};

export default usePolicyBenefitHook;
