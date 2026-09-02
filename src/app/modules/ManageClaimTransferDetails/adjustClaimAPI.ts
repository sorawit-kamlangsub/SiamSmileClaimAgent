import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL } from "../../../Const";
import { encodeURLWithParams } from "../_common";

const apiURL = `${API_CLAIM_FUND_URL}`;

const getAdjustDetail = "getClaimAdjustDetailKey";
const getAdjustReasonOptions = "getAdjustReasonOptionsKey";
const getTransferHistory = "getTransferHistoryKey";

/**
 * Fetches everything needed to render the adjust-detail page: the summary
 * header, the item rows (for the editable table), the receiving account,
 * and the reason dropdown options — keyed off caseId.
 */
export const useGetClaimAdjustDetail = (caseId: string) => {
    return useQuery([getAdjustDetail, caseId], () => getClaimAdjustDetail(caseId), { enabled: !!caseId });
};

const getClaimAdjustDetail = (caseId: string) => {
    const url = encodeURLWithParams(`${apiURL}/AdditionalTransfer/AdditionalTransferDetails`, { caseId });
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

export interface SaveClaimAdjustPayload {
    clNo: string;
    items: { caseId: string; additionalAmount: number }[];
    accountNo: string;
    reason: string;
    note: string;
}

export const useSaveClaimAdjust = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: SaveClaimAdjustPayload) => saveClaimAdjust(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }
            queryClient.invalidateQueries([getAdjustDetail]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
        },
    });
};

const saveClaimAdjust = (payload: SaveClaimAdjustPayload) => {
    return axios
        .post(`${apiURL}/Claim/SaveClaimAdjust`, payload)
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

export const useGetAdjustReasonOptions = () => {
    return useQuery([getAdjustReasonOptions], () => getAdjustReasonOptionsData());
};

const getAdjustReasonOptionsData = () => {
    const url = `${apiURL}/Masters/GetAdjustmentReasons`;
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

export const useGetTransferHistory = (caseId: string) => {
    return useQuery([getTransferHistory, caseId], () => getTransferHistoryData(caseId), { enabled: !!caseId });
};

const getTransferHistoryData = (caseId: string) => {
    const url = encodeURLWithParams(`${apiURL}/AdditionalTransfer/GetClaimTransactions`, { caseId });
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
