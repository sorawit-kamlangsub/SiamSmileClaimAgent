import axios from "axios";
import { API_URL } from "../../Const";
import { ClaimAgentMasterClient } from "./claimAgentApi.client";
import { useQuery } from "@tanstack/react-query";

const claimAgentMasterClient = new ClaimAgentMasterClient(API_URL, axios);

const getSimBCategoryQueryKey = ["getSimBCategory"];
const getSimBQueryKey = ["getSimB"];
const getDocumentRecipientTypeQueryKey = ["getDocumentRecipientType"];
const getChiefComplaintQueryKey = ["getChiefComplaint"];
const getCaseTypeQueryKey = ["getCaseType"];
const getICD10QueryKey = ["getICD10"];
const getProvinceQueryKey = ["getProvince"];
const getBankAccountRelationTypeQueryKey = ["getBankAccountRelationType"];
const getContactPersonTypeQueryKey = ["getContactPersonType"];
const getBankQueryKey = ["getBank"];

export const useGetSimBCategory = (formatTypeId?: number | undefined, patientTypeId?: number | undefined) => {
    return useQuery(
        [getSimBCategoryQueryKey, formatTypeId, patientTypeId],
        () => claimAgentMasterClient.getSimBCategory(formatTypeId, patientTypeId),
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
        () => claimAgentMasterClient.getSimB(formatTypeId, patientTypeId, isUseOften),
        {
            enabled: !!formatTypeId && !!patientTypeId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetDocumentRecipientType = (documentRecipientTypeId?: number | undefined) => {
    return useQuery(
        [getDocumentRecipientTypeQueryKey, documentRecipientTypeId],
        () => claimAgentMasterClient.getDocumentRecipientType(documentRecipientTypeId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetChiefComplaint = (chiefComplaintId?: number | undefined) => {
    return useQuery(
        [getChiefComplaintQueryKey, chiefComplaintId],
        () => claimAgentMasterClient.getChiefComplaint(chiefComplaintId),
        {
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetCaseType = (caseTypeId?: number | undefined) => {
    return useQuery([getCaseTypeQueryKey, caseTypeId], () => claimAgentMasterClient.getCaseType(caseTypeId), {
        refetchOnWindowFocus: false,
    });
};

export const useGetICD10 = (
    iCD10Id?: number | undefined,
    iCD10Code?: string | undefined,
    isTPA?: boolean | undefined
) => {
    return useQuery(
        [getICD10QueryKey, iCD10Id, iCD10Code, isTPA],
        () => claimAgentMasterClient.getICD10(iCD10Id, iCD10Code, isTPA),
        {
            enabled: !!iCD10Id || !!iCD10Code,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetProvince = (provinceId?: number | undefined) => {
    return useQuery([getProvinceQueryKey, provinceId], () => claimAgentMasterClient.getProvince(provinceId), {
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
        () => claimAgentMasterClient.getBankAccountRelationType(bankAccountRelationTypeId, bankAccountRelationGroupId),
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
        () => claimAgentMasterClient.getContactPersonType(contactPersonTypeId, contactPersonGroupId),
        {
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetBank = (organizeId?: number | undefined) => {
    return useQuery([getBankQueryKey, organizeId], () => claimAgentMasterClient.getAllBank(organizeId), {
        refetchOnWindowFocus: true,
    });
};
