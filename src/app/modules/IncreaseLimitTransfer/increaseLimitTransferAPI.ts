import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL, APIGW_CLAIM_FUND_API_URL } from "../../../Const";
import { ClaimFundClient } from "../../api/coreClaimApi.client";
import { encodeURLWithParams } from "../_common";

const apiURL = `${APIGW_CLAIM_FUND_API_URL}/IncreaseTransfer`;
const getIncreaseTransferLimitMonitorsKey = "getIncreaseTransferLimitMonitorsKey";
const getIncreaseTransferLimitDetailKey = "getIncreaseTransferLimitDetailKey";

// Monitor ขยายวงเงิน — เปลี่ยนจาก mock axios เป็น API จาก CodeGen (ClaimFundClient)
const claimFundClient = new ClaimFundClient(API_URL, axios);

export const useGetIncreaseTransferLimitMonitors = (
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined,
    enabled?: boolean
) => {
    return useQuery(
        [searchDetail, orderingField, ascendingOrder, page, recordsPerPage, getIncreaseTransferLimitMonitorsKey],
        () =>
            claimFundClient.increaseTransferLimitMonitors(
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: enabled ?? true,
            refetchOnMount: "always",
            cacheTime: 0,
        }
    );
};

export type IncreaseTransferLimitDetailRejectReasonDto = {
    code?: string;
    name?: string;
};

export type IncreaseTransferLimitDetailDto = {
    caseId?: string;
    claimId?: string;
    claimNo?: string;
    caseNo?: string;
    insuredName?: string;
    amount?: number;
    currentLimitAmount?: number;
    usedLimitAmount?: number;
    remainingLimitAmount?: number;
    requestedIncreaseAmount?: number;
    newRemainingLimitAmount?: number;
    rejectReasons?: IncreaseTransferLimitDetailRejectReasonDto[];
};

export type IncreaseTransferLimitDetailResponse = {
    data?: IncreaseTransferLimitDetailDto;
    isSuccess?: boolean;
    message?: string;
    code?: number;
    exceptionMessage?: string | null;
};

export const useGetIncreaseTransferLimitDetail = (caseId?: string) => {
    return useQuery([caseId, getIncreaseTransferLimitDetailKey], () => getIncreaseTransferLimitDetailData(caseId), {
        enabled: caseId !== undefined && caseId !== "",
        refetchOnMount: "always",
        cacheTime: 0,
    });
};

const getIncreaseTransferLimitDetailData = (caseId?: string) => {
    const url = encodeURLWithParams(`${apiURL}/IncreaseTransferLimitDetail`, {
        caseId,
    });
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            }
            throw new Error(res.data.message ?? "");
        })
        .catch((err) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            throw error.response?.data?.message ?? error.message ?? "";
        });
};

export type UpdateIncreaseTransferLimitStatusDtoRequest = {
    caseId?: string;
    claimId?: string;
    increaseTransferLimitStatusId?: number;
    /** draft: backend ยังไม่มี field นี้ (mock) — map จาก rejectReasonCode ของ dropdown ชั่วคราว */
    rejectReasonsId?: string | null;
};

export type UpdateIncreaseTransferLimitStatusDtoData = {
    isSuccess?: boolean;
    message?: string;
};

export type UpdateIncreaseTransferLimitStatusDtoServiceResponse = {
    data?: UpdateIncreaseTransferLimitStatusDtoData;
    isSuccess?: boolean;
    message?: string;
    code?: number;
    exceptionMessage?: string | null;
    serverDateTime?: string;
    totalAmountRecords?: number;
    totalAmountPages?: number;
    currentPage?: number;
    recordsPerPage?: number;
    pageIndex?: number;
};

const updateIncreaseTransferLimitStatus = (payload: UpdateIncreaseTransferLimitStatusDtoRequest) => {
    const url = `${apiURL}/UpdateIncreaseTransferLimitStatus`;
    return axios
        .post(url, payload)
        .then((res) => {
            if (res.data.isSuccess && res.data.data?.isSuccess !== false) {
                return res.data;
            }
            const isWarning = !!res.data.isSuccess && res.data.data?.isSuccess === false;
            const error = new Error(res.data.data?.message ?? res.data.message ?? "");
            (error as Error & { isWarning?: boolean }).isWarning = isWarning;
            throw error;
        })
        .catch((err) => {
            const error = err as Error & { response?: { data?: { message?: string } } };
            if (error.response) {
                throw new Error(error.response.data?.message ?? error.message ?? "");
            }
            throw error;
        });
};

export const useUpdateIncreaseTransferLimitStatus = (
    onSuccessCallback: (response: UpdateIncreaseTransferLimitStatusDtoServiceResponse) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (payload: UpdateIncreaseTransferLimitStatusDtoRequest) => updateIncreaseTransferLimitStatus(payload),
        {
            onSuccess: (response) => {
                onSuccessCallback(response);
                queryClient.invalidateQueries({
                    predicate: (query) => query.queryKey.includes(getIncreaseTransferLimitMonitorsKey),
                });
            },
            onError: (error: Error) => {
                onErrorCallback(error.message);
            },
        }
    );
};
