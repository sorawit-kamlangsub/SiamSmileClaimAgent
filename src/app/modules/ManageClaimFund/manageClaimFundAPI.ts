import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIGW_CLAIM_FUND_API_URL } from "../../../Const";

const claimFundAPI_URL = APIGW_CLAIM_FUND_API_URL;
const getCurrentSettingHistoryKey = "getCurrentSetting";

export const useGetCurrentSettingHistory = () => {
    return useQuery([getCurrentSettingHistoryKey], () => getCurrentSettingData());
};

const getCurrentSettingData = () => {
    const url = `${claimFundAPI_URL}/Setting/GetCurrentSetting`;
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

export type ResponseUpdateSetting = {
    data: {
        paytransferSettingId: string;
    };
    isSuccess: boolean;
    message: string;
};

export const useUpdateSetting = (
    onSuccessCallBack: (response: ResponseUpdateSetting) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: { paytransferSettingId: string }) => updateSetting(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getCurrentSettingHistoryKey]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getCurrentSettingHistoryKey]);
        },
    });
};

const updateSetting = (payload: { paytransferSettingId: string }) => {
    const url = `${claimFundAPI_URL}/Setting/UpdateSettingAutoTransfer`;
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
