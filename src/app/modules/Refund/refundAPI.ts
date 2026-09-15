import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dayjs } from "dayjs";
import { APIGW_CLAIM_FUND_API_URL } from "../../../Const";
import { encodeURLWithParams, PaginationDto } from "../_common";

const getRefundMonitor = "getRefundMonitorKey";
const getRefundApproveMonitor = "getRefundApproveMonitorKey";
const getRefundDetail = "getRefundDetailKey";
const getRefundReasons = "getRefundReasonsKey";
const getRefundStatus = "getRefundStatusKey";
const getRefundClaimTransaction = "getRefundClaimTransactionKey";
const getRefundTransferHistory = "getRefundTransferHistoryKey";
const getRefundDecreaseTransaction = "getRefundDecreaseTransactionKey";
const apiURL = `${APIGW_CLAIM_FUND_API_URL}`;

export type GetRefundMonitorFilterType = {
    branceId: number | undefined | null;
    refundStatusId: number | undefined | null;
    pagination: PaginationDto;
    searchDetail?: string | undefined | null;
    transferDateFrom?: Dayjs | undefined | null;
    transferDateTo?: Dayjs | undefined | null;
    searchKey?: number;
    enabled?: boolean;
};

export const useGetRefundMonitorWithFilter = ({
    branceId,
    refundStatusId,
    pagination,
    searchDetail,
    searchKey,
    enabled,
}: GetRefundMonitorFilterType) => {
    return useQuery(
        [branceId, refundStatusId, pagination, searchDetail, searchKey, getRefundMonitor],
        () => getRefundMonitorData({ branceId, refundStatusId, pagination, searchDetail }),
        {
            enabled: enabled ?? !!refundStatusId,
            refetchOnMount: "always",
            cacheTime: 0,
        }
    );
};

const getRefundMonitorData = ({
    branceId = null,
    refundStatusId = null,
    pagination,
    searchDetail,
}: GetRefundMonitorFilterType) => {
    const formBody = {
        branceId,
        refundStatusId,
        ...(searchDetail ? { searchDetail } : {}),
    };
    const url = encodeURLWithParams(`${apiURL}/Refund/RefundMonitor`, {
        Page: pagination.page ?? 1,
        recordsPerPage: pagination.recordsPerPage ?? 10,
    });
    return axios
        .post(url, formBody)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                return { ...res.data, data: [] };
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};

export const useGetRefundApproveMonitorWithFilter = ({
    branceId,
    refundStatusId,
    pagination,
    searchDetail,
    transferDateFrom,
    transferDateTo,
    searchKey,
    enabled,
}: GetRefundMonitorFilterType) => {
    return useQuery(
        [
            branceId,
            refundStatusId,
            pagination,
            searchDetail,
            transferDateFrom,
            transferDateTo,
            searchKey,
            getRefundApproveMonitor,
        ],
        () =>
            getRefundApproveMonitorData({
                branceId,
                refundStatusId,
                pagination,
                searchDetail,
                transferDateFrom,
                transferDateTo,
            }),
        {
            enabled: enabled ?? !!refundStatusId,
            refetchOnMount: "always",
            cacheTime: 0,
        }
    );
};

const getRefundApproveMonitorData = ({
    branceId = null,
    refundStatusId = null,
    pagination,
    searchDetail,
    transferDateFrom,
    transferDateTo,
}: GetRefundMonitorFilterType) => {
    const formBody = {
        branceId,
        refundStatusId,
        ...(searchDetail ? { searchDetail } : {}),
        ...(transferDateFrom ? { fromDate: transferDateFrom.format("YYYY-MM-DD") } : {}),
        ...(transferDateTo ? { toDate: transferDateTo.format("YYYY-MM-DD") } : {}),
    };
    const url = encodeURLWithParams(`${apiURL}/Refund/RefundApproveMonitor`, {
        Page: pagination.page ?? 1,
        recordsPerPage: pagination.recordsPerPage ?? 10,
    });
    return axios
        .post(url, formBody, { timeout: 30000 })
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

export const useGetRefundDetail = (caseId: string) => {
    return useQuery([getRefundDetail, caseId], () => getRefundDetailData(caseId), { enabled: !!caseId });
};

const getRefundDetailData = (caseId: string) => {
    const url = encodeURLWithParams(`${apiURL}/Refund/SaveRefundDetails`, { caseId });
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                throw res.data.message;
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};

const getRefundTransferTypes = "getRefundTransferTypesKey";
export const useGetRefundTransferTypes = (adjustmentTypeId = 3) => {
    return useQuery([getRefundTransferTypes, adjustmentTypeId], () =>
        getRefundTransferTypesData(adjustmentTypeId)
    );
};

const getRefundTransferTypesData = (adjustmentTypeId: number) => {
    const url = `${apiURL}/Masters/GetAdjustmentReasons?adjustmentTypeId=${adjustmentTypeId}`;
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                throw res.data.message;
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};

export const useGetRefundReasons = () => {
    return useQuery([getRefundReasons], () => getRefundReasonsData());
};

const getRefundReasonsData = () => {
    const url = `${apiURL}/Masters/GetRefundReasons`;
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                throw res.data.message;
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};

export const useGetRefundStatus = (enabled = true) => {
    return useQuery([getRefundStatus], () => getRefundStatusData(), { enabled });
};

const getRefundStatusData = () => {
    const url = `${apiURL}/Masters/GetRefundStatus`;
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                throw res.data.message;
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};

export const useGetRefundClaimTransaction = (caseId: string, pagination: PaginationDto) => {
    return useQuery([getRefundClaimTransaction, caseId, pagination], () =>
        getRefundClaimTransactionData(caseId, pagination)
    );
};

const getRefundClaimTransactionData = (caseId: string, pagination: PaginationDto) => {
    const url = encodeURLWithParams(`${apiURL}/Refund/GetClaimTransaction`, {
        caseId,
        Page: pagination.page ?? 1,
        recordsPerPage: pagination.recordsPerPage ?? 10,
    });
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                return { ...res.data, data: [] };
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};

export const useGetRefundTransferHistory = (caseId: string) => {
    return useQuery([getRefundTransferHistory, caseId], () => getRefundTransferHistoryData(caseId), {
        enabled: !!caseId,
    });
};

const getRefundTransferHistoryData = (caseId: string) => {
    const url = encodeURLWithParams(`${apiURL}/Refund/TransferHistory`, { caseId });
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                return { ...res.data, data: { payTransferDetails: [] } };
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};

export const useGetRefundDecreaseTransaction = (caseId: string, pagination: PaginationDto) => {
    return useQuery([getRefundDecreaseTransaction, caseId, pagination], () =>
        getRefundDecreaseTransactionData(caseId, pagination)
    );
};

const getRefundDecreaseTransactionData = (caseId: string, pagination: PaginationDto) => {
    const url = encodeURLWithParams(`${apiURL}/Refund/GetDecreaseTransaction`, {
        caseId,
        Page: pagination.page ?? 1,
        recordsPerPage: pagination.recordsPerPage ?? 10,
    });
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                throw res.data.message;
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};

export interface CreateCaseRefundPayload {
    adjustmentTypeId: number;
    refundReasonId: number;
    cacseId: string;
    claimId?: string;
    refundDate: string;
    remark: string;
    decreaseAmount: number;
}

export const useCreateCaseRefund = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: CreateCaseRefundPayload) => createCaseRefund(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }
            queryClient.invalidateQueries([getRefundDetail]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
        },
    });
};

const createCaseRefund = (payload: CreateCaseRefundPayload) => {
    const url = `${apiURL}/Refund/CreateCaseRefund`;
    return axios
        .post(url, payload)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            }
            throw new Error(res.data.message ?? "");
        })
        .catch((err) => {
            const error = err as Error & { response?: { data?: { message?: string } } };
            throw new Error(error.response?.data?.message ?? error.message ?? "");
        });
};