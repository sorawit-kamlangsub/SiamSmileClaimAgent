import axios from "axios";
import { API_URL } from "../../Const";
import { ClaimAgentClient } from "./claimAgentApi.client";
import { useQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

const claimAgentClient = new ClaimAgentClient(API_URL, axios);

const getCustomerSearchQueryKey = ["getCustomerSearch"];
const getCustomerDetailByIdQueryKey = ["getCustomerDetailById"];
const getCustomerBenefitDetailSearchQueryKey = ["getCustomerBenefitDetailSearch"];

export const useGetCustomerSearch = (
    isSearch?: boolean,
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
        [getCustomerSearchQueryKey, searchIndex, searchDetail],
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
            enabled: isSearch && !!searchIndex && !!searchDetail,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetCustomerDetailById = (id: number) => {
    return useQuery([getCustomerDetailByIdQueryKey, id], () => claimAgentClient.getCustomerDetailById(id), {
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
        () => claimAgentClient.getCustomerBenefitDetailSearch(policyCode, caseTypeId, dateHappen, isContinue),
        {
            enabled: !!policyCode,
            refetchOnWindowFocus: false,
        }
    );
};
