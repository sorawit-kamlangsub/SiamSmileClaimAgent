import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIGW_CLAIM_FUND_API_URL, APIGW_URL } from "../../../Const";
import { encodeURLWithParams } from "../_common";

const claimFundAPI_URL = APIGW_CLAIM_FUND_API_URL;
const payTransferGWAPI_URL = `${APIGW_URL}/pay`;
const getInquiryMonitors = "getInquiryMonitorsKey";
const getInquiryDetailMonitor = "getInquiryDetailMonitorKey";

type GetInquiryMonitorsType = {
    searchDetail: string | undefined;
    page: number | undefined;
    recordsPerPage: number | undefined;
};

export const useGetInquiryMonitors = (payload: GetInquiryMonitorsType) => {
    return useQuery([getInquiryMonitors, payload], () => getInquiryMonitorsData(payload));
};

const getInquiryMonitorsData = (payload: GetInquiryMonitorsType) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/Inquiry/InquiryMonitors`, payload);
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

export const useGetInquiryDetailMonitors = (payload: getInquiryMonitorsDetailType) => {
    return useQuery(
        [getInquiryMonitors, getInquiryDetailMonitor, payload.payTransferTransactionId],
        () => getInquiryMonitorsDetailData(payload),
        {
            enabled: !!payload.payTransferTransactionId,
        }
    );
};

const getInquiryMonitorsDetailData = (payload: getInquiryMonitorsDetailType) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/Inquiry/InquiryDetail`, payload);
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

export const useSentToBank = (onSuccessCallBack: (response: any) => void, onErrorCallback: (error: string) => void) => {
    const queryClient = useQueryClient();
    return useMutation((payload: { refCode: string }) => sentToBankWithRefCode(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getInquiryMonitors]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getInquiryMonitors]);
        },
    });
};

const sentToBankWithRefCode = (payload: { refCode: string }) => {
    const url = `${payTransferGWAPI_URL}/PayTransfer/inquirytransectionbank`;
    return axios
        .post(url, payload)
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
