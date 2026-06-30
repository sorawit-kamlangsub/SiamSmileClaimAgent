import axios from "axios";
import { CORECLAIM_API_URL } from "../../Const";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AllUserDtoResponse, MastersClient } from "./coreClaimApi.client";
import { useMemo } from "react";

const coreClaimMastersClient = new MastersClient(CORECLAIM_API_URL, axios);

const getUserQuerykey = ["getUser"];
const getMedicaltypeQueryKey = ["getMedicaltype"];
const getIncidentTypeQueryKey = ["getIncidentType"];
const getCoverageTypeQueryKey = ["getCoverageType"];
const getCauseOfAccidentQueryKey = ["getCauseOfAccident"];
const getSimBCategoryQueryKey = ["getSimBCategory"];
const getSimBQueryKey = ["getSimB"];
const getChiefComplaintQueryKey = ["getChiefComplaint"];
const getICD10QueryKey = ["getICD10"];

const getDocumentRecipientTypeQueryKey = ["getDocumentRecipientType"];
const getProvinceQueryKey = ["getProvince"];
const getBankAccountRelationTypeQueryKey = ["getBankAccountRelationType"];
const getContactPersonTypeQueryKey = ["getContactPersonType"];
const getBankQueryKey = ["getBank"];
const getZebraCarOwnerQueryKey = ["getZebraCarOwner"];

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

export const useGetMedicaltype = (claimSourceId?: number | undefined) => {
    return useQuery(
        [getMedicaltypeQueryKey, claimSourceId],
        () => coreClaimMastersClient.getMedicalType(claimSourceId),
        {
            refetchOnWindowFocus: true,
        }
    );
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

export const useGetCoverageType = (coverageTypeId?: number | undefined) => {
    return useQuery(
        [getCoverageTypeQueryKey, coverageTypeId],
        () => coreClaimMastersClient.getCoverageType(coverageTypeId),
        {
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetCauseOfAccident = (causeOfIncidentId?: number | undefined) => {
    return useQuery(
        [getCauseOfAccidentQueryKey, causeOfIncidentId],
        () => coreClaimMastersClient.getCauserOfIncident(causeOfIncidentId),
        {
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetSimBCategory = (formatTypeId?: number | undefined, patientTypeId?: number | undefined) => {
    return useQuery(
        [getSimBCategoryQueryKey, formatTypeId, patientTypeId],
        () => coreClaimMastersClient.getSimBCategory(formatTypeId, patientTypeId),
        {
            enabled: !!formatTypeId && !!patientTypeId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetSimB = (
    formatTypeId?: number | undefined,
    patientTypeId?: number | undefined,
    isUseOften?: boolean | undefined
) => {
    return useQuery(
        [getSimBQueryKey, formatTypeId, patientTypeId, isUseOften],
        () => coreClaimMastersClient.getSimB(formatTypeId, patientTypeId, isUseOften),
        {
            enabled: !!formatTypeId && !!patientTypeId,
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
        {
            enabled: !!iCD10Id || !!iCD10Code,
            refetchOnWindowFocus: false,
        }
    );
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

export const useGetProvince = (provinceId?: number | undefined) => {
    return useQuery([getProvinceQueryKey, provinceId], () => coreClaimMastersClient.getProvince(provinceId), {
        refetchOnWindowFocus: true,
    });
};

//bankAccountRelationGroupId : 1 = ph, pa, claimmisc | 2 = motor
export const useGetBankAccountRelationType = (
    bankAccountRelationTypeId?: number | undefined,
    bankAccountRelationGroupId?: number | undefined
) => {
    return useQuery(
        [getBankAccountRelationTypeQueryKey, bankAccountRelationTypeId, bankAccountRelationGroupId],
        () => coreClaimMastersClient.getBankAccountRelationType(bankAccountRelationTypeId, bankAccountRelationGroupId),
        {
            refetchOnWindowFocus: true,
        }
    );
};

//contactPersonGroupId : 1 = ph, deadclaim | 2 = pa | 3 = motor
export const useGetContactPersonType = (
    contactPersonTypeId?: number | undefined,
    contactPersonGroupId?: number | undefined
) => {
    return useQuery(
        [getContactPersonTypeQueryKey, contactPersonTypeId, contactPersonGroupId],
        () => coreClaimMastersClient.getContactPersonType(contactPersonTypeId, contactPersonGroupId),
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
