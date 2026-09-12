import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { APIGW_CLAIM_FUND_API_URL } from "../../../Const";
import { encodeURLWithParams, PaginationDto } from "../_common";

const getRefundMonitor = "getRefundMonitorKey";
const getRefundDetail = "getRefundDetailKey";
const getRefundReasons = "getRefundReasonsKey";
const getRefundClaimTransaction = "getRefundClaimTransactionKey";
const getRefundTransferHistory = "getRefundTransferHistoryKey";
const getRefundDecreaseTransaction = "getRefundDecreaseTransactionKey";
const apiURL = `${APIGW_CLAIM_FUND_API_URL}`;

export type GetRefundMonitorFilterType = {
    branceId: number | undefined | null;
    refundStatusId: number | undefined | null;
    pagination: PaginationDto;
};

export const useGetRefundMonitorWithFilter = ({
    branceId,
    refundStatusId,
    pagination,
}: GetRefundMonitorFilterType) => {
    return useQuery([branceId, refundStatusId, pagination, getRefundMonitor], () =>
        getRefundMonitorData({ branceId, refundStatusId, pagination })
    );
};

const getRefundMonitorData = ({
    branceId = null,
    refundStatusId = null,
    pagination,
}: GetRefundMonitorFilterType) => {
    const formBody = {
        branceId,
        refundStatusId,
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
                throw res.data.message;
            }
        })
        .catch((err: Error) => {
            throw err.message;
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
                throw res.data.message;
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
                throw res.data.message;
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