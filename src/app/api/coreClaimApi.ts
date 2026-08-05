import axios from "axios";
import {
    CalculateCaseClaimDtoRequest,
    CalculateCaseClaimDtoResponseServiceResponse,
    CoreClaimClient,
    CreateCoreClaimDataTableServiceResponse,
    CreateCoreClaimDtoRequest,
    GetClaimHistoryDtoResponseListServiceResponse,
    GetDocumentSubTypeDtoRequest,
} from "./coreClaimApi.client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";
import { API_URL } from "../../Const";

const coreClaimClient = new CoreClaimClient(API_URL, axios);

const getCustomerSearchQueryKey = ["getCustomerSearch"];
const getCustomerDetailByIdQueryKey = ["getCustomerDetailById"];
const getCustomerBenefitDetailSearchQueryKey = ["getCustomerBenefitDetailSearch"];
const getClaimContinueQueryKey = ["getClaimContinue"];
const getDocumentSubTypeQueryKey = ["getDocumentSubType"];
const getClaimHistoryQueryKey = ["getClaimHistory"];
const getCustomerBankAccountQueryKey = ["getCustomerBankAccount"];
const getContactPersonQueryKey = ["getContactPerson"];
const getCaseByClaimIdQueryKey = ["getCaseByClaimId"];
const calculateCaseDisabilityQueryKey = ["calculateCaseDisability"];
const getCustomerSearchByPolicyCodeQueryKey = ["getCustomerSearchByPolicyCode"];

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

export const useGetCustomerDetailById = (id: number | undefined) => {
    return useQuery([getCustomerDetailByIdQueryKey, id], () => coreClaimClient.getCustomerDetailById(id as number), {
        enabled: !!id,
        refetchOnWindowFocus: false,
    });
};

export const useGetCustomerBenefitDetailSearch = (
    policyCode?: string | undefined,
    caseTypeId?: number | undefined,
    dateHappen?: Dayjs | undefined,
    isContinue?: boolean | undefined,
    incidentTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined
) => {
    return useQuery(
        [
            getCustomerBenefitDetailSearchQueryKey,
            policyCode,
            caseTypeId,
            dateHappen,
            isContinue,
            incidentTypeId,
            coverageTypeId,
            medicalTypeId,
            causeOfIncidentId,
        ],
        () =>
            coreClaimClient.getCustomerBenefitDetailSearch(
                policyCode,
                caseTypeId,
                dateHappen,
                isContinue,
                incidentTypeId,
                coverageTypeId,
                medicalTypeId,
                causeOfIncidentId
            ),
        {
            enabled: !!policyCode,
            refetchOnWindowFocus: false,
        }
    );
};

export const useCreateCoreClaim = (
    onSuccessCallback?: (response: CreateCoreClaimDataTableServiceResponse) => void,
    onErrorCallback?: (error: string, type: number) => void
) => {
    return useMutation((body: CreateCoreClaimDtoRequest) => coreClaimClient.createCoreClaim(body), {
        onSuccess: (response) => {
            if (!response.isSuccess)
                onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error", 1);
            else onSuccessCallback?.(response);
        },
        onError: (error: Error) => {
            onErrorCallback?.(error.message, 2);
        },
    });
};

export const useGetDocumentType = (request: GetDocumentSubTypeDtoRequest, isEnabled?: boolean) => {
    return useQuery(
        [getDocumentSubTypeQueryKey, request],
        async () => {
            const response = await coreClaimClient.getDocumentSubType(request);
            return response;
        },
        {
            cacheTime: Infinity,
            staleTime: Infinity,
            enabled: !!(isEnabled && request.documentTypeId),
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        }
    );
};

export const useGetClaimContinue = (
    applicationId?: string | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [getClaimContinueQueryKey, applicationId, searchDetail, orderingField, ascendingOrder, page, recordsPerPage],
        () =>
            coreClaimClient.getClaimContinue(
                applicationId,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: !!applicationId,
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetClaimHistory = (
    applicationId?: string | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery<GetClaimHistoryDtoResponseListServiceResponse, Error>(
        [getClaimHistoryQueryKey, applicationId, searchDetail, orderingField, ascendingOrder, page, recordsPerPage],
        () =>
            coreClaimClient.getClaimHistory(
                applicationId,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: !!applicationId,
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetCustomerBankAccount = (applicationId?: string | undefined) => {
    return useQuery(
        [getCustomerBankAccountQueryKey, applicationId],
        () => coreClaimClient.getCustomerBankAccount(applicationId || ""),
        {
            enabled: !!applicationId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetContactPerson = (applicationId: string, productTypeId?: number | undefined) => {
    return useQuery(
        [getContactPersonQueryKey, applicationId, productTypeId],
        () => coreClaimClient.getContactPerson(applicationId, productTypeId),
        {
            enabled: !!applicationId && !!productTypeId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetCaseByClaimId = (
    claimId?: string | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [getCaseByClaimIdQueryKey, claimId, searchDetail, orderingField, ascendingOrder, page, recordsPerPage],
        () =>
            coreClaimClient.getCaseByClaimId(
                claimId,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: !!claimId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useCalculateCaseDisability = (
    customerId?: number | undefined,
    bodyPartId?: number | undefined,
    standardMedicalExpenseId?: number | undefined
) => {
    return useQuery(
        [calculateCaseDisabilityQueryKey, customerId, bodyPartId, standardMedicalExpenseId],
        () => coreClaimClient.calculateCaseDisability(customerId, bodyPartId, standardMedicalExpenseId),
        {
            enabled: !!customerId && !!bodyPartId && !!standardMedicalExpenseId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetCustomerSearchByPolicyCode = (
    policyCode?: string | undefined,
    searchIndex?: number | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [
            getCustomerSearchByPolicyCodeQueryKey,
            policyCode,
            searchIndex,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
        ],
        () =>
            coreClaimClient.getCustomerSearchByPolicyCode(
                policyCode,
                searchIndex,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: !!policyCode && !!searchIndex && !!searchDetail,
            refetchOnWindowFocus: false,
        }
    );
};
