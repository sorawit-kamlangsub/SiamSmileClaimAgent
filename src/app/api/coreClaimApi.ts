import axios from "axios";
import { CORECLAIM_API_URL } from "../../Const";
import {
    CalculateCaseClaimDtoRequest,
    CalculateCaseClaimDtoResponseServiceResponse,
    CoreClaimClient,
} from "./coreClaimApi.client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

const coreClaimClient = new CoreClaimClient(CORECLAIM_API_URL, axios);

const getCustomerSearchQueryKey = ["getCustomerSearch"];
const getCustomerDetailByIdQueryKey = ["getCustomerDetailById"];
const getCustomerBenefitDetailSearchQueryKey = ["getCustomerBenefitDetailSearch"];
export const useCalculateCaseClaim = (
    onSuccessCallback?: (response: CalculateCaseClaimDtoResponseServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    return useMutation((body?: CalculateCaseClaimDtoRequest | undefined) => coreClaimClient.calculateCaseClaim(body), {
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

export const useGetCustomerSearch = (
    isSearch?: boolean,
    searchIndex?: number,
    isSeachDetail?: boolean,
    dateHappen?: Dayjs,
    schoolId?: number,
    provinceId?: number,
    incidentTypeId?: number,
    searchDetail?: string,
    orderingField?: string,
    ascendingOrder?: boolean,
    page?: number,
    recordsPerPage?: number
) => {
    return useQuery(
        [getCustomerSearchQueryKey, searchIndex, searchDetail, page, recordsPerPage, orderingField, ascendingOrder],
        () =>
            coreClaimClient.getCustomerSearch(
                searchIndex,
                isSeachDetail,
                dateHappen,
                schoolId,
                provinceId,
                incidentTypeId,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: !!isSearch && !!searchDetail,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetCustomerDetailById = (id: number) => {
    return useQuery([getCustomerDetailByIdQueryKey, id], () => coreClaimClient.getCustomerDetailById(id), {
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
        [getCustomerBenefitDetailSearchQueryKey, policyCode, caseTypeId, dateHappen, isContinue],
        () => coreClaimClient.getCustomerBenefitDetailSearch(policyCode, caseTypeId, dateHappen, isContinue),
        {
            enabled: !!policyCode,
            refetchOnWindowFocus: false,
        }
    );
};
