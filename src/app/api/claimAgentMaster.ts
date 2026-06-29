import axios from "axios";
import { API_URL } from "../../Const";
import { ClaimAgentMasterClient } from "./claimAgentApi.client";
import { useQuery } from "@tanstack/react-query";

const claimAgentMasterClient = new ClaimAgentMasterClient(API_URL, axios);

const getDocumentRecipientTypeQueryKey = ["getDocumentRecipientType"];
const getProvinceQueryKey = ["getProvince"];
const getBankAccountRelationTypeQueryKey = ["getBankAccountRelationType"];
const getContactPersonTypeQueryKey = ["getContactPersonType"];
const getBankQueryKey = ["getBank"];
const getZebraCarOwnerQueryKey = ["getZebraCarOwner"];

export const useGetDocumentRecipientType = (documentRecipientTypeId?: number | undefined) => {
    return useQuery(
        [getDocumentRecipientTypeQueryKey, documentRecipientTypeId],
        () => claimAgentMasterClient.getDocumentRecipientType(documentRecipientTypeId),
        {
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

export const useGetZebraCarOwner = (zebraId?: number | undefined, employeeId?: number | undefined) => {
    return useQuery(
        [getZebraCarOwnerQueryKey, zebraId, employeeId],
        () => claimAgentMasterClient.getZebraCarOwner(zebraId, employeeId),
        {
            refetchOnWindowFocus: true,
        }
    );
};
