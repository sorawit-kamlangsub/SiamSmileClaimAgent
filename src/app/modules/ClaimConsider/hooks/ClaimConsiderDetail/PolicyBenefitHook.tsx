import { GetCustomerDetailByIdDtoResponse } from "../../../../api/coreClaimApi.client";
import { useGetPolicyBenefit } from "../../../../api/coreClaimApi";

type UsePolicyBenefitHookParams = {
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
};

/**
 * รับ customerDetail จาก parent (HeaderDetails ต่อ useConsiderDetailHook ไว้ให้แล้ว) แทนการเรียก
 * useConsiderDetailHook ซ้ำเอง — เดิมยิง query/formik ทั้งชุดซ้ำอีกรอบ (รวม useGetClaimDetailConsider,
 * useGetCustomerDetailById ฯลฯ) แค่เพื่อเอา productTypeId/policyCode/productId/customerTypeCode
 * ทำให้เปลืองและ resolve คนละจังหวะกับตัวหลัก — ตอนสลับเคลม ตารางความคุ้มครองอาจโชว์ของเคลมเก่าค้างชั่วขณะ
 */
const usePolicyBenefitHook = ({ customerDetail }: UsePolicyBenefitHookParams) => {
    const {
        data: benefit,
        isLoading: benefitLoading,
        isError: benefitError,
    } = useGetPolicyBenefit(
        customerDetail?.productTypeId ?? 0,
        customerDetail?.productTypeId === 26 ? customerDetail?.policyCode : undefined,
        customerDetail?.productTypeId === 6 ? customerDetail?.productId : undefined,
        customerDetail?.productTypeId === 26 ? customerDetail?.customerTypeCode : undefined
    );
    return {
        benefit,
        benefitLoading,
        benefitError,
    };
};

export default usePolicyBenefitHook;
