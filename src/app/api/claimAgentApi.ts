import axios from "axios";
import { API_URL } from "../../Const";
import {
    CalculateCaseClaimDtoRequest,
    CalculateCaseClaimDtoResponseServiceResponse,
    ClaimAgentClient,
    ClaimAgentMasterClient,
} from "./claimAgentApi.client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

const claimAgentClient = new ClaimAgentClient(API_URL, axios);
const claimAgentMasterClient = new ClaimAgentMasterClient(API_URL, axios);

const getCustomerSearchQueryKey = ["getCustomerSearch"];
const getSimBCategoryQueryKey = ["getSimBCategory"];

export const useGetCustomerSearch = (
    searchIndex?: number | undefined,
    isSeachDetail?: boolean | undefined,
    dateHappen?: Dayjs | undefined,
    schoolId?: number | undefined,
    provinceId?: number | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [getCustomerSearchQueryKey, searchIndex, isSeachDetail],
        () =>
            claimAgentClient.getCustomerSearch(
                searchIndex,
                isSeachDetail,
                dateHappen,
                schoolId,
                provinceId,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: !!searchIndex,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetCustomerDetailById = (id: number) => {
    return useQuery([getCustomerSearchQueryKey, id], () => claimAgentClient.getCustomerDetailById(id), {
        enabled: !!id,
        refetchOnWindowFocus: false,
    });
};

export const useGetCustomerBenefitDetailSearch = (
    policyCode?: string | undefined,
    caseTypeId?: number | undefined,
    dateHappen?: Dayjs | undefined,
    isContinue?: boolean | undefined
) => {
    return useQuery(
        [getCustomerSearchQueryKey, policyCode, caseTypeId, dateHappen, isContinue],
        () => claimAgentClient.getCustomerBenefitDetailSearch(policyCode, caseTypeId, dateHappen, isContinue),
        {
            enabled: !!policyCode,
            refetchOnWindowFocus: false,
        }
    );
};

export const useCalculateCaseClaim = (
    onSuccessCallback?: (response: CalculateCaseClaimDtoResponseServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    return useMutation((body?: CalculateCaseClaimDtoRequest | undefined) => claimAgentClient.calculateCaseClaim(body), {
        onSuccess: (response) => {
            if (!response.isSuccess)
                onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
            else onSuccessCallback?.(response);
        },
        onError: (error: Error) => {
            onErrorCallback?.(error.message);
        },
    });
};

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
