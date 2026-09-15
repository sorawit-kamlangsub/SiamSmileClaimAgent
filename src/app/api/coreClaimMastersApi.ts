import axios from "axios";
import { API_URL } from "../../Const";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AllUserDtoResponse, GetICD10DtoResponse, GetOrganizeDtoResponse, MastersClient } from "./coreClaimApi.client";
import { useMemo } from "react";
import { useBranchByUserPermission } from "../modules/_common/branchPermission";

const coreClaimMastersClient = new MastersClient(API_URL, axios);

const getUserQuerykey = ["getUser"];
const getIncidentTypeQueryKey = ["getIncidentType"];
const getIncidentTypeMappingQueryKey = ["getIncidentTypeMapping"];
const getSimBCategoryQueryKey = ["getSimBCategory"];
const getSimBQueryKey = ["getSimB"];
const getChiefComplaintQueryKey = ["getChiefComplaint"];
const getICD10QueryKey = ["getICD10"];
const getNonCoveredReasonQueryKey = ["getNonCoveredReason"];

const getDocumentRecipientTypeQueryKey = ["getDocumentRecipientType"];
const getProvinceQueryKey = ["getProvince"];
const getBankAccountRelationTypeQueryKey = ["getBankAccountRelationType"];
const getContactPersonTypeQueryKey = ["getContactPersonType"];
const getBankQueryKey = ["getBank"];
const getZebraCarOwnerQueryKey = ["getZebraCarOwner"];
const getSchoolByProvinceIdQueryKey = ["getSchoolByProvinceId"];
const getAllHospitalQueryKey = ["getAllHospital"];
const getFormatTypeQueryKey = ["getFormatType"];
const getBeneficiaryQueryKey = ["getBeneficiary"];
const getRelationTypeQueryKey = ["getRelationType"];
const getDisabilityLossPartQueryKey = ["getDisabilityLossPart"];
const getBodyPartByDisabilityLossPartQueryKey = ["getBodyPartByDisabilityLossPart"];
const getPaymentStatusQueryKey = ["getPaymentStatus"];
const getBranchQueryKey = ["getBranch"];
const getDeductionSourceQueryKey = ["getDeductionSource"];
const getEmployeeClaimPaymentLimitQueryKey = ["getEmployeeClaimPaymentLimit"];
const getDecisionQueryKey = ["getDecision"];
const getDecisionReasonQueryKey = ["getDecisionReason"];
const getInsuranceCompanyQueryKey = ["getInsuranceCompany"];
const getDocumentReviewStatusQueryKey = ["getDocumentReviewStatus"];
const getClaimTransactionTypeQueryKey = ["getClaimTransactionType"];
const getBenefitQueryKey = ["getBenefit"];

export const useGetUser = (userId?: number | undefined) => {
    return useQuery([getUserQuerykey, userId], () => coreClaimMastersClient.users(userId), {
        cacheTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
    });
};

export const getUserFilter = (searchValue: string, defaultId?: any): UseQueryResult<AllUserDtoResponse[], unknown> => {
    const key = searchValue.substring(0, 5);
    const { data, isLoading, ...rest } = useGetUser();

    return useMemo(() => {
        if (isLoading) return { data, isLoading, ...rest } as UseQueryResult<AllUserDtoResponse[], unknown>;

        // const activeEmployees = data?.data?.filter((item) => item.EmployeeStatus_ID !== 6);

        const selectedEmployee = data?.data?.find((item) => item.userId == defaultId);

        const filteredData = data?.data?.filter((item) => item.displayName?.includes(key)).slice(0, 10);

        if (selectedEmployee && !filteredData?.includes(selectedEmployee)) {
            filteredData?.unshift(selectedEmployee);
        }

        return {
            data: filteredData,
            isLoading,
            ...rest,
        } as UseQueryResult<AllUserDtoResponse[], unknown>;
    }, [key, defaultId, data, isLoading]);
};

export const useGetIncidentType = (incidentTypeId?: number | undefined) => {
    return useQuery(
        [getIncidentTypeQueryKey, incidentTypeId],
        () => coreClaimMastersClient.getIncidentType(incidentTypeId),
        {
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetIncidentTypeMapping = (
    incidentTypeId?: number | undefined,
    claimSourceId?: number | undefined,
    productTypeId?: number | undefined,
    productCategoryCode?: string | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined,
    isClaimContinue?: boolean | undefined,
    initialClaimId?: string | undefined
) => {
    return useQuery(
        [
            getIncidentTypeMappingQueryKey,
            incidentTypeId,
            claimSourceId,
            productTypeId,
            productCategoryCode,
            coverageTypeId,
            medicalTypeId,
            causeOfIncidentId,
            isClaimContinue,
            initialClaimId,
        ],
        () =>
            coreClaimMastersClient.getIncidentTypeMapping(
                incidentTypeId,
                claimSourceId,
                productTypeId,
                productCategoryCode,
                coverageTypeId,
                medicalTypeId,
                causeOfIncidentId,
                isClaimContinue,
                initialClaimId
            ),
        {
            enabled: !!incidentTypeId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetSimBCategory = (
    formatTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    productTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined,
    planId?: number | undefined
) => {
    return useQuery(
        [
            getSimBCategoryQueryKey,
            formatTypeId,
            coverageTypeId,
            medicalTypeId,
            productTypeId,
            causeOfIncidentId,
            planId,
        ],
        () =>
            coreClaimMastersClient.getSimBCategory(
                formatTypeId,
                coverageTypeId,
                medicalTypeId,
                productTypeId,
                causeOfIncidentId,
                planId
            ),
        {
            enabled: !!formatTypeId && !!coverageTypeId && !!productTypeId && !!(medicalTypeId || causeOfIncidentId),
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetSimB = (
    formatTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    isUseOften?: boolean | undefined,
    productTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined,
    plandId?: number | undefined
) => {
    return useQuery(
        [
            getSimBQueryKey,
            formatTypeId,
            coverageTypeId,
            medicalTypeId,
            isUseOften,
            productTypeId,
            causeOfIncidentId,
            plandId,
        ],
        () =>
            coreClaimMastersClient.getSimB(
                formatTypeId,
                coverageTypeId,
                medicalTypeId,
                isUseOften,
                productTypeId,
                causeOfIncidentId,
                plandId
            ),
        {
            enabled: !!formatTypeId && !!coverageTypeId && !!productTypeId && !!(medicalTypeId || causeOfIncidentId),
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetChiefComplaint = (chiefComplaintId?: number | undefined) => {
    return useQuery(
        [getChiefComplaintQueryKey, chiefComplaintId],
        () => coreClaimMastersClient.getChiefComplaint(chiefComplaintId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetICD10 = (
    iCD10Id?: number | undefined,
    iCD10Code?: string | undefined,
    isTPA?: boolean | undefined
) => {
    return useQuery(
        [getICD10QueryKey, iCD10Id, iCD10Code, isTPA],
        () => coreClaimMastersClient.getICD10(iCD10Id, iCD10Code, isTPA),
        { refetchOnMount: false, refetchOnWindowFocus: false }
    );
};
export const useGetICD10Filter = (
    searchValue: string,
    defaultId?: any
): UseQueryResult<GetICD10DtoResponse[], unknown> => {
    const key = searchValue;
    const { data, isLoading, ...rest } = useGetICD10();

    return useMemo(() => {
        const all = data?.data ?? [];
        const selected = all.find((item) => item.icD10Id == defaultId);
        const filteredData = all.filter((item) => item.icD10Detail?.includes(key)).slice(0, 10);

        // คงรายการที่ prefill (icD10Id == defaultId) ไว้เสมอ ไม่ให้หลุดเพราะ slice(0, 10)
        if (selected && !filteredData.some((item) => item.icD10Id === selected.icD10Id)) {
            filteredData.unshift(selected);
        }

        return { data: filteredData, isLoading, ...rest } as UseQueryResult<GetICD10DtoResponse[], unknown>;
    }, [key, defaultId, data, isLoading]);
};

export const useGetDocumentRecipientType = (documentRecipientTypeId?: number | undefined) => {
    return useQuery(
        [getDocumentRecipientTypeQueryKey, documentRecipientTypeId],
        () => coreClaimMastersClient.getDocumentRecipientType(documentRecipientTypeId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetNonCoveredReason = (
    nonCoveredReasonId?: number | undefined,
    coverageTypeId?: number | undefined
) => {
    return useQuery(
        [getNonCoveredReasonQueryKey, nonCoveredReasonId, coverageTypeId],
        () => coreClaimMastersClient.getNonCoveredReason(nonCoveredReasonId, coverageTypeId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetProvince = (provinceId?: number | undefined) => {
    return useQuery([getProvinceQueryKey, provinceId], () => coreClaimMastersClient.getProvince(provinceId), {
        refetchOnWindowFocus: true,
    });
};

//bankAccountRelationGroupId : 1 = ph, pa, claimmisc | 2 = motor
export const useGetBankAccountRelationType = (
    bankAccountRelationTypeId?: number | undefined,
    bankAccountRelationGroupId?: number | undefined,
    productTypeId?: number | undefined
) => {
    return useQuery(
        [getBankAccountRelationTypeQueryKey, bankAccountRelationTypeId, bankAccountRelationGroupId, productTypeId],
        () =>
            coreClaimMastersClient.getBankAccountRelationType(
                bankAccountRelationTypeId,
                bankAccountRelationGroupId,
                productTypeId
            ),
        {
            refetchOnWindowFocus: true,
        }
    );
};

//contactPersonGroupId : 1 = ph, deadclaim | 2 = pa | 3 = motor
export const useGetContactPersonType = (
    contactPersonTypeId?: number | undefined,
    contactPersonGroupId?: number | undefined,
    productTypeId?: number | undefined
) => {
    return useQuery(
        [getContactPersonTypeQueryKey, contactPersonTypeId, contactPersonGroupId, productTypeId],
        () => coreClaimMastersClient.getContactPersonType(contactPersonTypeId, contactPersonGroupId, productTypeId),
        {
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetBank = (organizeId?: number | undefined) => {
    return useQuery([getBankQueryKey, organizeId], () => coreClaimMastersClient.getAllBank(organizeId), {
        refetchOnWindowFocus: true,
    });
};

export const useGetZebraCarOwner = (zebraId?: number | undefined, employeeId?: number | undefined) => {
    return useQuery(
        [getZebraCarOwnerQueryKey, zebraId, employeeId],
        () => coreClaimMastersClient.getZebraCarOwner(zebraId, employeeId),
        {
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetSchoolByProvinceId = (provinceId: number, organizeId?: number | undefined) => {
    return useQuery(
        [getSchoolByProvinceIdQueryKey, provinceId, organizeId],
        () => coreClaimMastersClient.getSchoolByProvinceId(provinceId, organizeId),
        {
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetAllHospital = (organizeId?: number | undefined) => {
    return useQuery([getAllHospitalQueryKey, organizeId], () => coreClaimMastersClient.getAllHospital(organizeId), {});
};

export const useGetHospitalDetailAllFilter = (
    searchValue: string,
    defaultId?: any
): UseQueryResult<GetOrganizeDtoResponse[], unknown> => {
    const key = searchValue;
    const { data, isLoading, ...rest } = useGetAllHospital();

    return useMemo(() => {
        const all = data?.data ?? [];
        const selectedHospital = all.find((item) => item.organizeId == defaultId);
        const filteredData = all.filter((item) => item.organizeName?.includes(key)).slice(0, 10);

        // คงรายการที่ prefill (organizeId == defaultId) ไว้เสมอ ไม่ให้หลุดเพราะ slice(0, 10)
        if (selectedHospital && !filteredData.some((item) => item.organizeId === selectedHospital.organizeId)) {
            filteredData.unshift(selectedHospital);
        }

        return { data: filteredData, isLoading, ...rest } as UseQueryResult<GetOrganizeDtoResponse[], unknown>;
    }, [key, defaultId, data, isLoading]);
};

export const useGetFormatType = (formatTypeId?: number | undefined) => {
    return useQuery([getFormatTypeQueryKey, formatTypeId], () => coreClaimMastersClient.getFormatType(formatTypeId), {
        refetchOnWindowFocus: true,
    });
};

export const useGetBeneficiary = (applicationId?: string | undefined) => {
    return useQuery(
        [getBeneficiaryQueryKey, applicationId],
        () => coreClaimMastersClient.getBeneficiary(applicationId || ""),
        {
            enabled: !!applicationId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetRelationType = (relationTypeId?: number | undefined) => {
    return useQuery(
        [getRelationTypeQueryKey, relationTypeId],
        () => coreClaimMastersClient.getRelationType(relationTypeId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetTitle = (titleId?: number | undefined, personTypeId?: number) => {
    return useQuery(
        [getRelationTypeQueryKey, titleId, personTypeId],
        () => coreClaimMastersClient.getTitle(titleId, personTypeId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetDisabilityLossPart = (disabilityLossPartId?: number | undefined) => {
    return useQuery(
        [getDisabilityLossPartQueryKey, disabilityLossPartId],
        () => coreClaimMastersClient.getDisabilityLossPart(disabilityLossPartId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetBodyPartByDisabilityLossPart = (disabilityLossPartId?: number | undefined) => {
    return useQuery(
        [getBodyPartByDisabilityLossPartQueryKey, disabilityLossPartId],
        () => coreClaimMastersClient.getBodyPartByDisabilityLossPart(disabilityLossPartId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetBranch = (branchId?: number | undefined) => {
    const branchQuery = useQuery([getBranchQueryKey, branchId], () => coreClaimMastersClient.getBranch(branchId), {
        refetchOnWindowFocus: false,
    });
    const filteredBranches = useBranchByUserPermission(branchQuery.data?.data);
    return {
        ...branchQuery,
        data: branchQuery.data ? { ...branchQuery.data, data: filteredBranches } : branchQuery.data,
    };
};

export const useGetPaymentStatus = (paymentStatusId?: number | undefined) => {
    return useQuery(
        [getPaymentStatusQueryKey, paymentStatusId],
        () => coreClaimMastersClient.getPaymentStatus(paymentStatusId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetDeductionSource = (deductionSourceId?: number | undefined) => {
    return useQuery(
        [getDeductionSourceQueryKey, deductionSourceId],
        () => coreClaimMastersClient.getDeductionSource(deductionSourceId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetEmployeeClaimPaymentLimit = (userId: number) => {
    return useQuery(
        [getEmployeeClaimPaymentLimitQueryKey, userId],
        () => coreClaimMastersClient.employeePaymentLimit(userId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetDecision = (decisionId?: number | undefined) => {
    return useQuery([getDecisionQueryKey, decisionId], () => coreClaimMastersClient.getDecision(decisionId), {
        refetchOnWindowFocus: false,
    });
};

export const useGetDocumentReviewStatus = (documentReviewStatusId?: number | undefined) => {
    return useQuery(
        [getDocumentReviewStatusQueryKey, documentReviewStatusId],
        () => coreClaimMastersClient.getDocumentReviewStatus(documentReviewStatusId),
        {
            cacheTime: 1000 * 60 * 60 * 24,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetDecisionReason = (decisionReasonId?: number | undefined, decisionId?: number | undefined) => {
    return useQuery(
        [getDecisionReasonQueryKey, decisionReasonId, decisionId],
        () => coreClaimMastersClient.getDecisionReason(decisionReasonId, decisionId),
        {
            enabled: !!decisionId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetInsuranceCompany = (
    organizeId?: number | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [getInsuranceCompanyQueryKey, organizeId, searchDetail, orderingField, ascendingOrder, page, recordsPerPage],
        () =>
            coreClaimMastersClient.getInsuranceCompany(
                organizeId,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetClaimTransactionType = (claimTransactionTypeId?: number | undefined) => {
    return useQuery(
        [getClaimTransactionTypeQueryKey, claimTransactionTypeId],
        () => coreClaimMastersClient.getClaimTransactionType(claimTransactionTypeId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetBenefit = (benefitId?: number | undefined, benefitIdList?: number[] | undefined) => {
    return useQuery(
        [getBenefitQueryKey, benefitId, benefitIdList],
        () => coreClaimMastersClient.getBenefit(benefitId, benefitIdList),
        {
            enabled: benefitId !== undefined || !!benefitIdList?.length,
            refetchOnWindowFocus: false,
        }
    );
};
