import { GetCustomerBenefitDetailHalfDtoResponse } from "./api/coreClaimApi.client";
import { CoverageType } from "./functionHelpers";
import { DeathExtraCoverageId } from "./modules/CreatedClaim/store/claimPASlice";

export type DeathBenefitCategory = "main" | DeathExtraCoverageId;

const PUBLIC_DISASTER_STANDARD_MEDICAL_EXPENSE_ID = 381;
const SCHOOL_LIABILITY_STANDARD_MEDICAL_EXPENSE_ID = 382;

export const classifyDeathBenefit = (
    benefit: GetCustomerBenefitDetailHalfDtoResponse
): DeathBenefitCategory | undefined => {
    if (benefit.coverageTypeId !== CoverageType.Death) return undefined;

    switch (benefit.standardMedicalExpenseId) {
        case PUBLIC_DISASTER_STANDARD_MEDICAL_EXPENSE_ID:
            return DeathExtraCoverageId.PublicDisaster;
        case SCHOOL_LIABILITY_STANDARD_MEDICAL_EXPENSE_ID:
            return DeathExtraCoverageId.SchoolLiability;
        default:
            return "main";
    }
};

export const getDeathMainBenefit = (
    benefits: GetCustomerBenefitDetailHalfDtoResponse[] | undefined
): GetCustomerBenefitDetailHalfDtoResponse | undefined =>
    (benefits ?? []).find((b) => classifyDeathBenefit(b) === "main");

export const filterSelectedDeathBenefits = (
    benefits: GetCustomerBenefitDetailHalfDtoResponse[] | undefined,
    extraCoverageIds: number[]
): GetCustomerBenefitDetailHalfDtoResponse[] =>
    (benefits ?? []).filter((b) => {
        const category = classifyDeathBenefit(b);
        if (category === undefined) return false;
        if (category === "main") return true;
        return extraCoverageIds.includes(category);
    });
