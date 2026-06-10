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

//ประเภทผู้รับเอกสาร (Document Recipient Type)
export const useGetDocumentRecipientType = (documentRecipientTypeId?: number | undefined) => {
    return useQuery(
        [getDocumentRecipientTypeQueryKey, documentRecipientTypeId],
        () => claimAgentMasterClient.getDocumentRecipientType(documentRecipientTypeId),
        {
            enabled: !!documentRecipientTypeId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetChiefComplaint = (chiefComplaintId?: number | undefined) => {
    return useQuery(
        [getChiefComplaintQueryKey, chiefComplaintId],
        () => claimAgentMasterClient.getChiefComplaint(chiefComplaintId),
        {
            enabled: !!chiefComplaintId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetCaseType = (caseTypeId?: number | undefined) => {
    return useQuery([getCaseTypeQueryKey, caseTypeId], () => claimAgentMasterClient.getCaseType(caseTypeId), {
        enabled: !!caseTypeId,
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
