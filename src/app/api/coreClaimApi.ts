import axios from "axios";
import {
    CalculateCaseClaimDtoRequest,
    CalculateCaseClaimDtoResponseServiceResponse,
    CoreClaimClient,
    CreateCoreClaimDtoResponseServiceResponse,
    CreateCoreClaimV2DtoRequest,
    GetClaimHistoryDtoResponseListServiceResponse,
    GetDocumentSubTypeDtoRequest,
} from "./coreClaimApi.client";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
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
const getCustomerBenefitDetailHalfQueryKey = ["getCustomerBenefitDetailHalf"];
const getCustomerSearchByPolicyCodeQueryKey = ["getCustomerSearchByPolicyCode"];
const getPolicyBenefitSheredQueryKey = ["getPolicyBenefitShered"];
const getDashboardCustomerConsiderQueryKey = ["getDashboardCustomerConsider"];
const getClaimTransactionMonitorQueryKey = ["getClaimTransactionMonitor"];
const getClaimDetailConsiderQueryKey = ["getClaimDetailConsider"];
const getClaimTransactionLogQueryKey = ["getClaimTransactionLog"];

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
    incidentDate?: dayjs.Dayjs | undefined,
    isContinue?: boolean | undefined,
    incidentTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    claimNo?: string | undefined,
    customerTypeCode?: string | undefined
) => {
    return useQuery(
        [
            getCustomerBenefitDetailSearchQueryKey,
            policyCode,
            incidentDate,
            isContinue,
            incidentTypeId,
            coverageTypeId,
            medicalTypeId,
            claimNo,
            customerTypeCode,
        ],
        () =>
            coreClaimClient.getCustomerBenefitDetailSearch(
                policyCode,
                incidentDate,
                isContinue,
                incidentTypeId,
                coverageTypeId,
                medicalTypeId,
                claimNo,
                customerTypeCode
            ),
        {
            enabled: !!policyCode,
            refetchOnWindowFocus: false,
        }
    );
};

export const useCreateCoreClaim = (
    onSuccessCallback?: (response: CreateCoreClaimDtoResponseServiceResponse) => void,
    onErrorCallback?: (error: string, type: number) => void
) => {
    return useMutation((body?: CreateCoreClaimV2DtoRequest | undefined) => coreClaimClient.createCoreClaim(body), {
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

export const useGetCustomerBenefitDetailHalf = (
    policyCode?: string | undefined,
    caseTypeId?: number | undefined,
    incidentDate?: Dayjs | undefined,
    isContinue?: boolean | undefined,
    incidentTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined,
    formatTypeId?: number | undefined,
    cusTomerTypeCode?: string | undefined,
    customerCode?: string | undefined
) => {
    return useQuery(
        [
            getCustomerBenefitDetailHalfQueryKey,
            policyCode,
            caseTypeId,
            incidentDate,
            isContinue,
            incidentTypeId,
            coverageTypeId,
            medicalTypeId,
            causeOfIncidentId,
            formatTypeId,
            cusTomerTypeCode,
            customerCode,
        ],
        () =>
            coreClaimClient.getCustomerBenefitDetailHalf(
                policyCode,
                caseTypeId,
                incidentDate,
                isContinue,
                incidentTypeId,
                coverageTypeId,
                medicalTypeId,
                causeOfIncidentId,
                formatTypeId,
                cusTomerTypeCode,
                customerCode
            ),
        {
            enabled:
                !!policyCode &&
                !!incidentDate &&
                !!incidentTypeId &&
                !!coverageTypeId &&
                (coverageTypeId === 2 || coverageTypeId === 3 ? !!medicalTypeId : true) &&
                (coverageTypeId === 4 || coverageTypeId === 5 ? !!causeOfIncidentId : true),
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

export const useGetPolicyBenefitShered = (
    applicaitonCode?: string | undefined,
    customerTypeCode?: string | undefined
) => {
    return useQuery(
        [getPolicyBenefitSheredQueryKey, applicaitonCode, customerTypeCode],
        () => coreClaimClient.getPolicyBenefitShered(applicaitonCode, customerTypeCode),
        {
            enabled: !!applicaitonCode && !!customerTypeCode,
        }
    );
};

export const useGetDashboardCustomerConsider = (
    dateOption?: number | undefined,
    dateFrom?: dayjs.Dayjs | undefined,
    dateTo?: dayjs.Dayjs | undefined
) => {
    return useQuery(
        [getDashboardCustomerConsiderQueryKey, dateOption, dateFrom, dateTo],
        () => coreClaimClient.getDashboardCustomerConsider(dateOption, dateFrom, dateTo),
        {
            enabled: !!dateOption && !!dateFrom && !!dateTo,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetClaimTransactionMonitor = (
    isSearch?: boolean,
    dateOption?: number | undefined,
    dateFrom?: dayjs.Dayjs | undefined,
    dateTo?: dayjs.Dayjs | undefined,
    isProductTypeId_PH?: boolean | undefined,
    isProductTypeId_PA?: boolean | undefined,
    claimTransactionTypeId?: number | undefined,
    searchOption?: number | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [
            getClaimTransactionMonitorQueryKey,
            dateOption,
            dateFrom,
            dateTo,
            isProductTypeId_PH,
            isProductTypeId_PA,
            claimTransactionTypeId,
            searchOption,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
        ],
        () =>
            coreClaimClient.getClaimTransactionMonitor(
                dateOption,
                dateFrom,
                dateTo,
                isProductTypeId_PH,
                isProductTypeId_PA,
                claimTransactionTypeId,
                searchOption,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: !!isSearch,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetClaimDetailConsider = (claimId: string) => {
    return useQuery([getClaimDetailConsiderQueryKey, claimId], () => coreClaimClient.getClaimDetailConsider(claimId), {
        enabled: !!claimId,
        refetchOnWindowFocus: false,
    });
};

export const useGetClaimTransactionLog = (
    claimId: string,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [getClaimTransactionLogQueryKey, claimId, searchDetail, orderingField, ascendingOrder, page, recordsPerPage],
        () =>
            coreClaimClient.getClaimTransactionLog(
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
