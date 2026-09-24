import axios from "axios";
import {
    ApproveClaimDecisionDtoRequest,
    BaseResponseServiceResponse,
    CalculateCaseClaimDtoRequest,
    CalculateCaseClaimDtoResponseServiceResponse,
    ClaimFundClient,
    CoreClaimClient,
    CreateContinuedClaimDtoRequest,
    CreateCoreClaimDtoResponseServiceResponse,
    CreateCoreClaimV2DtoRequest,
    GetClaimHistoryDtoResponseListServiceResponse,
    GetDocumentSubTypeDtoRequest,
    GetEmployeeClaimPaymentLimitResponseServiceResponse,
    IncreaseTransferLimitChangeStatusRequestDto,
    IncreaseTransferLimitChangeStatusResponseDtoServiceResponse,
    IncreaseTransferLimitMonitorRequestDto,
    SaveClaimEditDraftDtoRequest,
    SaveClaimEditDraftDtoResponeServiceResponse,
    UpdateBeneficiaryDtoRequest,
    UpsertClaimDecisionDtoRequest,
    UpsertClaimDecisionDtoResponseServiceResponse,
} from "./coreClaimApi.client";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import { API_URL } from "../../Const";

const coreClaimClient = new CoreClaimClient(API_URL, axios);
const claimFundClient = new ClaimFundClient(API_URL, axios);

const getCustomerSearchQueryKey = ["getCustomerSearch"];
const getCustomerDetailByIdQueryKey = ["getCustomerDetailById"];
const getCustomerBenefitDetailSearchQueryKey = ["getCustomerBenefitDetailSearch"];
const getClaimContinueQueryKey = ["getClaimContinue"];
const getDocumentSubTypeQueryKey = ["getDocumentSubType"];
const getClaimHistoryQueryKey = ["getClaimHistory"];
const getEmployeeClaimPaymentLimitQueryKey = ["getEmployeeClaimPaymentLimit"];
const getCustomerBankAccountQueryKey = ["getCustomerBankAccount"];
const getContactPersonQueryKey = ["getContactPerson"];
const getCaseByClaimIdQueryKey = ["getCaseByClaimId"];
const calculateCaseDisabilityQueryKey = ["calculateCaseDisability"];
const getCustomerBenefitDetailHalfQueryKey = ["getCustomerBenefitDetailHalf"];
const getCustomerSearchByPolicyCodeQueryKey = ["getCustomerSearchByPolicyCode"];
const getPolicyBenefitSheredQueryKey = ["getPolicyBenefitShered"];
const getDashboardCustomerConsiderQueryKey = ["getDashboardCustomerConsider"];
const getCustomerClaimAdjudicationMonitorQueryKey = ["getCustomerClaimAdjudicationMonitor"];
const getDashboardDeathAndDisabilityClaimConsiderQueryKey = ["getDashboardDeathAndDisabilityClaimConsider"];
const getDeathAndDisabilityClaimAdjudicationMonitorQueryKey = ["getDeathAndDisabilityClaimAdjudicationMonitor"];
const getDeathAndDisabilityClaimDetailConsiderQueryKey = ["getDeathAndDisabilityClaimDetailConsider"];
const getDeathAndDisabilityBeneficiaryQueryKey = ["getDeathAndDisabilityBeneficiary"];
const getCaseDisabilityBenefitByCaseIdQueryKey = ["getCaseDisabilityBenefitByCaseId"];
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

// ---- ขยายวงเงิน (ClaimFund / IncreaseTransfer) — ใช้จาก CodeGen (ClaimFundClient) เท่านั้น ----
const getIncreaseTransferLimitMonitorsQueryKey = ["getIncreaseTransferLimitMonitors"];
const getIncreaseTransferLimitDetailQueryKey = ["getIncreaseTransferLimitDetail"];
const getTransferApprovalStatusQueryKey = ["getTransferApprovalStatus"];
const getCaseTransferApprovalRejectReasonStatusQueryKey = ["getCaseTransferApprovalRejectReasonStatus"];

export const useGetTransferApprovalStatus = () => {
    return useQuery([getTransferApprovalStatusQueryKey], () => claimFundClient.getTransferApprovalStatus(), {
        refetchOnMount: "always",
        cacheTime: 0,
    });
};

export const useGetIncreaseTransferLimitMonitors = (
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined,
    filter?: IncreaseTransferLimitMonitorRequestDto,
    searchTrigger?: number,
    enabled?: boolean
) => {
    return useQuery(
        [
            getIncreaseTransferLimitMonitorsQueryKey,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
            filter,
            searchTrigger,
        ],
        () =>
            claimFundClient.increaseTransferLimitMonitors(
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage,
                filter
            ),
        {
            enabled: enabled ?? true,
            refetchOnMount: "always",
            cacheTime: 0,
        }
    );
};

export const useGetIncreaseTransferLimitDetail = (caseTransferApprovalId?: string) => {
    return useQuery(
        [getIncreaseTransferLimitDetailQueryKey, caseTransferApprovalId],
        () => claimFundClient.getIncreaseTransferLimitDetail(caseTransferApprovalId),
        {
            enabled: caseTransferApprovalId !== undefined && caseTransferApprovalId !== "",
            refetchOnMount: "always",
            cacheTime: 0,
        }
    );
};

export const useGetCaseTransferApprovalRejectReasonStatus = () => {
    return useQuery(
        [getCaseTransferApprovalRejectReasonStatusQueryKey],
        () => claimFundClient.getCaseTransferApprovalRejectReasonStatus(),
        {
            refetchOnMount: "always",
            cacheTime: 0,
        }
    );
};

export const useIncreaseTransferLimitChangeStatus = (
    onSuccessCallback?: (response: IncreaseTransferLimitChangeStatusResponseDtoServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (body: IncreaseTransferLimitChangeStatusRequestDto) => claimFundClient.increaseTransferLimitChangeStatus(body),
        {
            onSuccess: (response) => {
                if (!response.isSuccess)
                    onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
                else {
                    queryClient.invalidateQueries([getIncreaseTransferLimitMonitorsQueryKey], { refetchType: "all" });
                    queryClient.invalidateQueries([getIncreaseTransferLimitDetailQueryKey], { refetchType: "all" });
                    onSuccessCallback?.(response);
                }
            },
            onError: (error: Error) => {
                onErrorCallback?.(error.message);
            },
        }
    );
};

/**
 * ล้าง cache ของ query ที่ได้รับผลกระทบจากการบันทึก/พิจารณาเคลม (ใช้ร่วมกันทั้งเคลมลูกค้าและเคลม รพ.
 * เพราะ mutation ชุดนี้ใช้ผ่าน useClaimDetailActionHook เหมือนกันทั้งสอง flow)
 *
 * ทำไมต้องมี : global staleTime = 5 นาที ถ้าไม่ invalidate ผู้ใช้ที่บันทึกแล้วกลับเข้ารายการเดิม
 * ภายใน 5 นาทีจะเห็นข้อมูล "ก่อนบันทึก" จาก cache จนกว่าจะ refresh ทั้งหน้า
 *
 * ใช้ refetchType default ("active") ไม่ใช่ "none" — เดิมใช้ "none" โดยหวังว่า refetchOnMount default
 * จะยิงใหม่เองตอน mount รอบถัดไป แต่ query พวกนี้มัก active อยู่ต่อเนื่อง (ผู้ใช้ไม่ได้ unmount component
 * หลังกดบันทึก เช่น สลับ tab ในหน้าเดียวกัน) ทำให้ "รอบ mount ถัดไป" ไม่เกิดขึ้นจริง และข้อมูลเก่าค้างอยู่
 * "active" จะ refetch ทันทีเฉพาะ query ที่มีคน mount อยู่ตอนนี้ ส่วน query ที่ inactive จะแค่ mark stale
 * ตามปกติ (ไม่มี request เสียเปล่า)
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
    ].forEach((queryKey) => queryClient.invalidateQueries([queryKey]));
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

export const useGetCustomerDetailById = (customerDetailId: string | undefined) => {
    return useQuery(
        [getCustomerDetailByIdQueryKey, customerDetailId],
        () => coreClaimClient.getCustomerDetailById(customerDetailId as string),
        {
            enabled: !!customerDetailId,
            refetchOnWindowFocus: false,
        }
    );
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

/**
 * `alwaysFresh` (default false = พฤติกรรมเดิม cache ตลอดไปด้วย cacheTime/staleTime: Infinity — เหมาะกับ
 * master list ของ document type ทั่วไปที่ไม่เปลี่ยนตามเคส) — ต้องเปิดเป็น true สำหรับ documentTypeId ที่
 * endpoint คืน documentCode เฉพาะเคส (เช่น "ใบแจ้งปฏิเสธสินไหม") ไม่งั้นสอง case ที่ productTypeId ตรงกันจะ
 * ได้ documentCode เดิมค้างจาก cache ตลอดไป (เอกสารไม่ตรงเคสที่กำลังพิจารณาอยู่)
 */
/**
 * คืนฟังก์ชันล้าง cache ของ useGetDocumentType ตาม documentTypeId — ใช้กับตารางสแกนเอกสารที่ต้องแชร์ documentCode
 * ระหว่าง 2 component ในหน้าเดียว (cache ปกติ) แล้วล้างทิ้งตอนออกจากหน้า กัน documentCode ค้างไปเคสถัดไป
 */
export const useRemoveDocumentTypeCache = () => {
    const queryClient = useQueryClient();
    return (documentTypeId: number) =>
        queryClient.removeQueries({
            queryKey: [getDocumentSubTypeQueryKey],
            predicate: (query) =>
                (query.queryKey[1] as GetDocumentSubTypeDtoRequest | undefined)?.documentTypeId === documentTypeId,
        });
};

export const useGetDocumentType = (request: GetDocumentSubTypeDtoRequest, isEnabled?: boolean, alwaysFresh = false) => {
    return useQuery(
        [getDocumentSubTypeQueryKey, request],
        async () => {
            const response = await coreClaimClient.getDocumentSubType(request);
            return response;
        },
        {
            cacheTime: alwaysFresh ? 0 : Infinity,
            staleTime: alwaysFresh ? 0 : Infinity,
            enabled: !!(isEnabled && request.documentTypeId),
            refetchOnWindowFocus: false,
            refetchOnMount: alwaysFresh ? "always" : false,
        }
    );
};

export const useGetClaimContinue = (
    applicationId?: string | undefined,
    initialCaseId?: string | undefined,
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
            initialCaseId,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
        ],
        () =>
            coreClaimClient.getClaimContinue(
                applicationId,
                initialCaseId,
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
                undefined,
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

export const useGetEmployeeClaimPaymentLimit = (userId: number, requestedTransferAmount: number) => {
    return useQuery<GetEmployeeClaimPaymentLimitResponseServiceResponse, Error>(
        [getEmployeeClaimPaymentLimitQueryKey, userId, requestedTransferAmount],
        () => coreClaimClient.getEmployeeClaimPaymentLimit(userId, requestedTransferAmount),
        {
            refetchOnWindowFocus: false,
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
    customerDetailId?: string | undefined,
    bodyPartId?: number | undefined,
    standardMedicalExpenseId?: number | undefined
) => {
    return useQuery(
        [calculateCaseDisabilityQueryKey, customerDetailId, bodyPartId, standardMedicalExpenseId],
        () => coreClaimClient.calculateCaseDisability(customerDetailId, bodyPartId, standardMedicalExpenseId),
        {
            enabled: !!customerDetailId && !!bodyPartId && !!standardMedicalExpenseId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetCustomerBenefitDetailHalf = (
    policyCode?: string | undefined,
    incidentDate?: dayjs.Dayjs | undefined,
    isContinue?: boolean | undefined,
    incidentTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined,
    formatTypeId?: number | undefined,
    cusTomerTypeCode?: string | undefined,
    customerDetailId?: string | undefined,
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
            customerDetailId,
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
                customerDetailId,
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

// TODO(backend): GetPolicyBenefitSheredDtoResponse ที่ codegen ได้ตอนนี้ว่างเปล่า (schema ฝั่ง backend มีปัญหา)
// mock shape เดิมไว้ก่อนตรงนี้ — ลบ interface นี้แล้วใช้ GetPolicyBenefitSheredDtoResponse จาก client ตรงๆ ได้เลยเมื่อ backend แก้แล้ว + codegen ใหม่
export interface PolicyBenefitSheredItem {
    policyCode?: string;
    benefitId?: number;
    benefitCode?: string;
    productId?: number;
    benefitName?: string;
    maxPrice?: number;
    customerTypeCode?: string;
    shortBenefit?: string;
    fullBenefitDisplay?: string;
}

export const useGetPolicyBenefitShered = (
    applicaitonCode?: string | undefined,
    customerTypeCode?: string | undefined
) => {
    return useQuery(
        [getPolicyBenefitSheredQueryKey, applicaitonCode, customerTypeCode],
        () => coreClaimClient.getPolicyBenefitShered(applicaitonCode, customerTypeCode),
        {
            enabled: !!applicaitonCode && !!customerTypeCode,
            select: (res) => ({ ...res, data: res.data as unknown as PolicyBenefitSheredItem[] | undefined }),
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

export const useGetDashboardDeathAndDisabilityClaimConsider = (
    dateFrom?: dayjs.Dayjs | undefined,
    dateTo?: dayjs.Dayjs | undefined
) => {
    return useQuery(
        [getDashboardDeathAndDisabilityClaimConsiderQueryKey, dateFrom, dateTo],
        () => coreClaimClient.getDashboardDeathAndDisabilityClaimConsider(dateFrom, dateTo),
        {
            enabled: !!dateFrom && !!dateTo,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetDeathAndDisabilityClaimAdjudicationMonitor = (
    isSearch?: boolean,
    dateFrom?: dayjs.Dayjs | undefined,
    dateTo?: dayjs.Dayjs | undefined,
    isProductTypeId_PH?: boolean | undefined,
    isProductTypeId_PA?: boolean | undefined,
    claimTransactionTypeId?: number | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
) => {
    return useQuery(
        [
            getDeathAndDisabilityClaimAdjudicationMonitorQueryKey,
            dateFrom,
            dateTo,
            isProductTypeId_PH,
            isProductTypeId_PA,
            claimTransactionTypeId,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
        ],
        () =>
            coreClaimClient.getDeathAndDisabilityClaimAdjudicationMonitor(
                dateFrom,
                dateTo,
                isProductTypeId_PH,
                isProductTypeId_PA,
                claimTransactionTypeId,
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

export const useGetDeathAndDisabilityClaimDetailConsider = (claimId: string, caseId: string) => {
    return useQuery(
        [getDeathAndDisabilityClaimDetailConsiderQueryKey, claimId, caseId],
        () => coreClaimClient.getDeathAndDisabilityClaimDetailConsider(claimId, caseId),
        {
            enabled: !!claimId && !!caseId,
            refetchOnWindowFocus: false,
        }
    );
};

export const useGetDeathAndDisabilityBeneficiary = (claimId: string, caseId: string) => {
    return useQuery(
        [getDeathAndDisabilityBeneficiaryQueryKey, claimId, caseId],
        () => coreClaimClient.getDeathAndDisabilityBeneficiary(claimId, caseId),
        {
            enabled: !!claimId && !!caseId,
            refetchOnWindowFocus: false,
        }
    );
};

/** แก้ไขข้อมูลผู้รับผลประโยชน์ (POST /beneficiary/update) — สำเร็จแล้วโหลดรายการผู้รับผลประโยชน์ใหม่ */
export const useUpdateBeneficiary = (
    onSuccessCallback?: (response: BaseResponseServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((body: UpdateBeneficiaryDtoRequest) => coreClaimClient.updateBeneficiary(body), {
        onSuccess: (response) => {
            if (!response.isSuccess)
                onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
            else {
                queryClient.invalidateQueries([getDeathAndDisabilityBeneficiaryQueryKey], { refetchType: "all" });
                onSuccessCallback?.(response);
            }
        },
        onError: (error: Error) => {
            onErrorCallback?.(error.message);
        },
    });
};

export const useGetCaseDisabilityBenefitByCaseId = (
    caseId: string,
    productTypeId?: number | undefined,
    productId?: number | undefined,
    incidentTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined,
    policyCode?: string | undefined,
    customerTypeCode?: string | undefined,
    isEnabled = true
) => {
    return useQuery(
        [
            getCaseDisabilityBenefitByCaseIdQueryKey,
            caseId,
            productTypeId,
            productId,
            incidentTypeId,
            coverageTypeId,
            causeOfIncidentId,
            policyCode,
            customerTypeCode,
        ],
        () =>
            coreClaimClient.getCaseDisabilityBenefitByCaseId(
                caseId,
                productTypeId,
                productId,
                incidentTypeId,
                coverageTypeId,
                causeOfIncidentId,
                policyCode,
                customerTypeCode
            ),
        {
            enabled: isEnabled && !!caseId && !!productTypeId,
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
    productTypeId: number,
    formatTypeId?: number | undefined,
    coverageTypeId?: number | undefined,
    medicalTypeId?: number | undefined,
    causeOfIncidentId?: number | undefined,
    productId?: number | undefined,
    applicationCode?: string | undefined,
    customerTypeCode?: string | undefined
) => {
    return useQuery(
        [
            getStandardMedicalExpenseByCaseQueryKey,
            caseId,
            productTypeId,
            formatTypeId,
            coverageTypeId,
            medicalTypeId,
            causeOfIncidentId,
            productId,
            applicationCode,
            customerTypeCode,
        ],
        () =>
            coreClaimClient.getStandardMedicalExpenseByCase(
                caseId,
                productTypeId,
                formatTypeId,
                coverageTypeId,
                medicalTypeId,
                causeOfIncidentId,
                productId,
                applicationCode,
                customerTypeCode
            ),
        {
            enabled: !!caseId && !!productTypeId,
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
