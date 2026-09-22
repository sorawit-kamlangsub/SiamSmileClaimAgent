import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { APIGW_CLAIM_FUND_API_URL } from "../../../Const";
import { encodeURLWithParams } from "../_common";

const apiURL = APIGW_CLAIM_FUND_API_URL;
const getRefundDataTable = "getRefundDataTableKey";
const getRefundTransactionDetail = "getRefundTransactionDetailKey";

type GetRefundMonitorsType = {
    searchDetail: string | undefined;
    page: number | undefined;
    recordsPerPage: number | undefined;
};

export const useRefundDataTable = (payload: GetRefundMonitorsType) => {
    return useQuery([getRefundDataTable, payload], () => getRefundMonitorsData(payload));
};

const getRefundMonitorsData = (payload: GetRefundMonitorsType) => {
    const url = encodeURLWithParams(`${apiURL}/FailTransfer/FailedPayTransferTransactionMonitor`, payload);
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

type getInquiryMonitorsDetailType = {
    payTransferTransactionId: string;
};

export const useGetRefundDetailMonitors = (payload: getInquiryMonitorsDetailType) => {
    return useQuery(
        [getRefundDataTable, getRefundTransactionDetail, payload.payTransferTransactionId],
        () => getRefundDetailMonitorsData(payload),
        {
            enabled: !!payload.payTransferTransactionId,
        }
    );
};

const getRefundDetailMonitorsData = (payload: getInquiryMonitorsDetailType) => {
    const url = encodeURLWithParams(`${apiURL}/FailTransfer/FailedPayTransferTransactionDetail`, payload);
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
