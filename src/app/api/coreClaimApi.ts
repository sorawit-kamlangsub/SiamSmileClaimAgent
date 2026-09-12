import axios from "axios";
import {
    ApproveClaimDecisionDtoRequest,
    CalculateCaseClaimDtoRequest,
    CalculateCaseClaimDtoResponseServiceResponse,
    CoreClaimClient,
    CreateContinuedClaimDtoRequest,
    CreateCoreClaimDtoResponseServiceResponse,
    CreateCoreClaimV2DtoRequest,
    GetClaimHistoryDtoResponseListServiceResponse,
    GetDocumentSubTypeDtoRequest,
    SaveClaimEditDraftDtoRequest,
    SaveClaimEditDraftDtoResponeServiceResponse,
    UpsertClaimDecisionDtoRequest,
    UpsertClaimDecisionDtoResponseServiceResponse,
} from "./coreClaimApi.client";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
const getCustomerClaimAdjudicationMonitorQueryKey = ["getCustomerClaimAdjudicationMonitor"];
const getClaimDetailConsiderQueryKey = ["getClaimDetailConsider"];
const getCaseReviewOverviewQueryKey = ["getCaseReviewOverview"];
const getClaimTransactionLogQueryKey = ["getClaimTransactionLog"];
const getPolicyBenefitQueryKey = ["getPolicyBenefit"];
const getPreviousClaimQueryKey = ["getPreviousClaim"];
const getStandardMedicalExpenseByCaseQueryKey = ["getStandardMedicalExpenseByCase"];
const getHospitalClaimAdjudicationMonitorQueryKey = ["getHospitalClaimAdjudicationMonitor"];
const getDocumentByCaseIdQueryKey = ["getDocumentByCaseId"];
const getDCRQueryKey = ["getDCR"];
const getClaimEditDraftRevisionQueryKey = ["getClaimEditDraftRevision"];

/**
 * ล้าง cache ของ query ที่ได้รับผลกระทบจากการบันทึก/พิจารณาเคลม (ใช้ร่วมกันทั้งเคลมลูกค้าและเคลม รพ.
 * เพราะ mutation ชุดนี้ใช้ผ่าน useClaimDetailActionHook เหมือนกันทั้งสอง flow)
 *
 * ทำไมต้องมี : global staleTime = 5 นาที ถ้าไม่ invalidate ผู้ใช้ที่บันทึกแล้วกลับเข้ารายการเดิม
 * ภายใน 5 นาทีจะเห็นข้อมูล "ก่อนบันทึก" จาก cache จนกว่าจะ refresh ทั้งหน้า
 *
 * ทำไมใช้ refetchType "none" : query รายละเอียด/ค่ารักษา/เอกสาร ยัง active อยู่ตอนกดบันทึก และผู้ใช้
 * กำลังจะออกจากหน้าอยู่แล้ว การ refetch ตรงนั้นเป็น request ที่เสียเปล่าบนหน้าที่หนักที่สุด — แค่มาร์ค
 * ว่า stale ก็พอ รอบ mount ถัดไปจะยิงใหม่เอง (refetchOnMount ไม่ได้ถูก override จึงเป็น true ตาม default)
 *
 * หมายเหตุรูปแบบ key : key ในไฟล์นี้เป็น array ซ้อน array เช่น [["getClaimDetailConsider"], claimId]
 * จึงต้องส่ง filter เป็น [key] ไม่ใช่ key เปล่าๆ ไม่งั้นจะเทียบ string กับ array แล้วไม่ match อะไรเลย
 */
const invalidateClaimConsiderQueries = (queryClient: QueryClient) => {
    [
        getClaimDetailConsiderQueryKey,
        getStandardMedicalExpenseByCaseQueryKey,
        getDocumentByCaseIdQueryKey,
        getClaimTransactionLogQueryKey,
        getCustomerClaimAdjudicationMonitorQueryKey,
        getHospitalClaimAdjudicationMonitorQueryKey,
        getDashboardCustomerConsiderQueryKey,
    ].forEach((queryKey) => queryClient.invalidateQueries([queryKey], { refetchType: "none" }));
};

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
        [
            getCustomerSearchQueryKey,
            searchIndex,
            isSeachDetail,
            dateHappen,
            schoolId,
            provinceId,
            incidentTypeId,
            searchDetail,
            page,
            recordsPerPage,
            orderingField,
            ascendingOrder,
        ],
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
    initialClaimId?: string | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [
            getClaimContinueQueryKey,
            applicationId,
            initialClaimId,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
        ],
        () =>
            coreClaimClient.getClaimContinue(
                applicationId,
                initialClaimId,
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
    incidentDate?: Dayjs | undefined,
    isContinue?: boolean | undefined,
    incidentTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined,
    formatTypeId?: number | undefined,
    cusTomerTypeCode?: string | undefined,
    customerCode?: string | undefined,
    claimNo?: string | undefined
) => {
    return useQuery(
        [
            getCustomerBenefitDetailHalfQueryKey,
            policyCode,
            incidentDate,
            isContinue,
            incidentTypeId,
            coverageTypeId,
            medicalTypeId,
            causeOfIncidentId,
            formatTypeId,
            cusTomerTypeCode,
            customerCode,
            claimNo,
        ],
        () =>
            coreClaimClient.getCustomerBenefitDetailHalf(
                policyCode,
                incidentDate,
                isContinue,
                incidentTypeId,
                coverageTypeId,
                medicalTypeId,
                causeOfIncidentId,
                formatTypeId,
                cusTomerTypeCode,
                customerCode,
                claimNo
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

export const useGetCustomerClaimAdjudicationMonitor = (
    isSearch?: boolean,
    dateOption?: number | undefined,
    dateFrom?: dayjs.Dayjs | undefined,
    dateTo?: dayjs.Dayjs | undefined,
    isProductTypeId_PH?: boolean | undefined,
    isProductTypeId_PA?: boolean | undefined,
    decisionId?: number | undefined,
    searchOption?: number | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [
            getCustomerClaimAdjudicationMonitorQueryKey,
            dateOption,
            dateFrom,
            dateTo,
            isProductTypeId_PH,
            isProductTypeId_PA,
            decisionId,
            searchOption,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
        ],
        () =>
            coreClaimClient.getCustomerClaimAdjudicationMonitor(
                dateOption,
                dateFrom,
                dateTo,
                isProductTypeId_PH,
                isProductTypeId_PA,
                decisionId,
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

export const useGetClaimDetailConsider = (claimId: string, caseId: string) => {
    return useQuery(
        [getClaimDetailConsiderQueryKey, claimId, caseId],
        () => coreClaimClient.getClaimDetailConsider(claimId, caseId),
        {
            enabled: !!claimId && !!caseId,
            refetchOnWindowFocus: false,
        }
    );
};

/**
 * ภาพรวมการตรวจสอบเอกสาร / ผลการพิจารณา / รายการค่าใช้จ่ายของ Case
 * (GET /document/case/{caseId}/overview) — ป้อนตาราง "ตรวจสอบเอกสาร" ของหน้าพิจารณาเคลมโรงพยาบาล
 */
export const useGetCaseReviewOverview = (caseId?: string) => {
    return useQuery(
        [getCaseReviewOverviewQueryKey, caseId],
        () => coreClaimClient.getCaseReviewOverview(caseId as string),
        {
            enabled: !!caseId,
            refetchOnWindowFocus: false,
        }
    );
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

export const useGetPolicyBenefit = (
    productTypeId: number,
    applicationCode?: string | undefined,
    productId?: number | undefined,
    customerTypeCode?: string | undefined
) => {
    return useQuery(
        [getPolicyBenefitQueryKey, productTypeId, applicationCode, productId, customerTypeCode],
        () => coreClaimClient.getPolicyBenefit(productTypeId, applicationCode, productId, customerTypeCode),
        {
            enabled: !!productTypeId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useSaveClaimEditDraft = (
    onSuccessCallback?: (response: SaveClaimEditDraftDtoResponeServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((body?: SaveClaimEditDraftDtoRequest | undefined) => coreClaimClient.saveClaimEditDraft(body), {
        onSuccess: (response) => {
            invalidateClaimConsiderQueries(queryClient);
            if (!response.isSuccess)
                onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
            else onSuccessCallback?.(response);
        },
        onError: (error: Error) => {
            onErrorCallback?.(error.message);
        },
    });
};

//สร้าง claim ต่อเนื่อง
export const createContinuedClaim = (
    onSuccessCallback?: (response: CreateCoreClaimDtoResponseServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    return useMutation(
        (body?: CreateContinuedClaimDtoRequest | undefined) => coreClaimClient.createContinuedClaim(body),
        {
            onSuccess: (response) => {
                if (!response.isSuccess)
                    onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
                else onSuccessCallback?.(response);
            },
            onError: (error: Error) => {
                onErrorCallback?.(error.message);
            },
        }
    );
};

export const useUpsertClaimDecision = (
    onSuccessCallback?: (response: UpsertClaimDecisionDtoResponseServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (body?: UpsertClaimDecisionDtoRequest | undefined) => coreClaimClient.upsertClaimDecision(body),
        {
            onSuccess: (response) => {
                invalidateClaimConsiderQueries(queryClient);
                if (!response.isSuccess)
                    onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
                else onSuccessCallback?.(response);
            },
            onError: (error: Error) => {
                onErrorCallback?.(error.message);
            },
        }
    );
};

export const useApproveClaimDecision = (
    onSuccessCallback?: (response: UpsertClaimDecisionDtoResponseServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (body?: ApproveClaimDecisionDtoRequest | undefined) => coreClaimClient.approveClaimDecision(body),
        {
            onSuccess: (response) => {
                invalidateClaimConsiderQueries(queryClient);
                if (!response.isSuccess)
                    onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
                else onSuccessCallback?.(response);
            },
            onError: (error: Error) => {
                onErrorCallback?.(error.message);
            },
        }
    );
};

//api สําหรับ get claim ตั้งต้น detail ของ claim ต่อเนื่อง
export const useGetPreviousClaim = (claimId: string) => {
    return useQuery([getPreviousClaimQueryKey, claimId], () => coreClaimClient.getPreviousClaim(claimId), {
        enabled: !!claimId,
        refetchOnWindowFocus: false,
    });
};

export const useGetStandardMedicalExpenseByCase = (
    caseId: string,
    formatTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    isUseOften?: boolean | undefined,
    productTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined,
    productId?: number | undefined
) => {
    return useQuery(
        [
            getStandardMedicalExpenseByCaseQueryKey,
            caseId,
            formatTypeId,
            coverageTypeId,
            medicalTypeId,
            isUseOften,
            productTypeId,
            causeOfIncidentId,
            productId,
        ],
        () =>
            coreClaimClient.getStandardMedicalExpenseByCase(
                caseId,
                formatTypeId,
                coverageTypeId,
                medicalTypeId,
                isUseOften,
                productTypeId,
                causeOfIncidentId,
                productId
            ),
        {
            enabled: !!caseId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetHospitalClaimAdjudicationMonitor = (
    isSearch?: boolean,
    dateOption?: number | undefined,
    dateFrom?: dayjs.Dayjs | undefined,
    dateTo?: dayjs.Dayjs | undefined,
    isProductTypeId_PH?: boolean | undefined,
    isProductTypeId_PA?: boolean | undefined,
    decisionId?: number | undefined,
    searchOption?: number | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [
            getHospitalClaimAdjudicationMonitorQueryKey,
            dateOption,
            dateFrom,
            dateTo,
            isProductTypeId_PH,
            isProductTypeId_PA,
            decisionId,
            searchOption,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
        ],
        () =>
            coreClaimClient.getHospitalClaimAdjudicationMonitor(
                dateOption,
                dateFrom,
                dateTo,
                isProductTypeId_PH,
                isProductTypeId_PA,
                decisionId,
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

export const useGetDocumentByCaseId = (
    caseId: string,
    productTypeId?: number | undefined,
    claimSourceId?: number | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [
            getDocumentByCaseIdQueryKey,
            caseId,
            productTypeId,
            claimSourceId,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
        ],
        () =>
            coreClaimClient.getDocumentByCaseId(
                caseId,
                productTypeId,
                claimSourceId,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: !!caseId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetDCR = (
    applicationCode?: string | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [getDCRQueryKey, applicationCode, searchDetail, orderingField, ascendingOrder, page, recordsPerPage],
        () =>
            coreClaimClient.getDCR(applicationCode, searchDetail, orderingField, ascendingOrder, page, recordsPerPage),
        {
            enabled: !!applicationCode,
            refetchOnWindowFocus: true,
        }
    );
};

export const useGetClaimEditDraftRevision = (draftRevisionId?: string | undefined) => {
    return useQuery(
        [getClaimEditDraftRevisionQueryKey, draftRevisionId],
        () => coreClaimClient.getClaimEditDraftRevision(draftRevisionId),
        {
            enabled: !!draftRevisionId,
            refetchOnWindowFocus: false,
        }
    );
};
