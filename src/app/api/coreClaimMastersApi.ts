import axios from "axios";
import { CORECLAIM_API_URL } from "../../Const";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AllUserDtoResponse, GetICD10DtoResponse, GetOrganizeDtoResponse, MastersClient } from "./coreClaimApi.client";
import { useMemo } from "react";

const coreClaimMastersClient = new MastersClient(CORECLAIM_API_URL, axios);

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
    productCategoryCode?: string,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined
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
        ],
        () =>
            coreClaimMastersClient.getIncidentTypeMapping(
                incidentTypeId,
                claimSourceId,
                productTypeId,
                productCategoryCode,
                coverageTypeId,
                medicalTypeId,
                causeOfIncidentId
            ),
        {
            refetchOnWindowFocus: true,
        }
    );
};


export const useGetSimBCategory = (
    formatTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined
) => {
    return useQuery(
        [getSimBCategoryQueryKey, formatTypeId, coverageTypeId, medicalTypeId],
        () => coreClaimMastersClient.getSimBCategory(formatTypeId, coverageTypeId, medicalTypeId),
        {
            enabled: !!formatTypeId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetSimB = (
    formatTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    isUseOften?: boolean | undefined
) => {
    return useQuery(
        [getSimBQueryKey, formatTypeId, coverageTypeId, medicalTypeId, isUseOften],
        () => coreClaimMastersClient.getSimB(formatTypeId, coverageTypeId, medicalTypeId, isUseOften),
        {
            enabled: !!formatTypeId && !!coverageTypeId && !!medicalTypeId,
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
        {}
    );
};
export const useGetICD10Filter = (
    searchValue: string,
    defaultId?: any
): UseQueryResult<GetICD10DtoResponse[], unknown> => {
    const key = searchValue;
    const { data, isLoading, ...rest } = useGetICD10();

    return useMemo(() => {
        if (isLoading) return { data, isLoading, ...rest } as UseQueryResult<GetICD10DtoResponse[], unknown>;
        // as UseQueryResult<HospitalDetailRequestDto, unknown>;

        const selectedHospital = data?.data?.find((item) => item.icD10Id == defaultId);
        const filteredData = data?.data?.filter((item) => item.icD10Detail?.includes(key)).slice(0, 10);

        if (selectedHospital && !filteredData?.includes(selectedHospital)) {
            filteredData?.unshift(selectedHospital);
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

export const useGetNonCoveredReason = (nonCoveredReasonId?: number | undefined) => {
    return useQuery(
        [getNonCoveredReasonQueryKey, nonCoveredReasonId],
        () => coreClaimMastersClient.getNonCoveredReason(nonCoveredReasonId),
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
        if (isLoading) return { data, isLoading, ...rest } as UseQueryResult<GetOrganizeDtoResponse[], unknown>;
        // as UseQueryResult<HospitalDetailRequestDto, unknown>;

        const selectedHospital = data?.data?.find((item) => item.organizeId == defaultId);
        const filteredData = data?.data?.filter((item) => item.organizeName?.includes(key)).slice(0, 10);

        if (selectedHospital && !filteredData?.includes(selectedHospital)) {
            filteredData?.unshift(selectedHospital);
        }

        return { data: filteredData, isLoading, ...rest } as UseQueryResult<GetOrganizeDtoResponse[], unknown>;
    }, [key, defaultId, data, isLoading]);
};
