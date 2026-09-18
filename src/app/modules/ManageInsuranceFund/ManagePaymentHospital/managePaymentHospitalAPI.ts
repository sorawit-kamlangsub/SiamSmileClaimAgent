import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL } from "../../../../Const";
import { encodeURLWithParams } from "../../_common";

const claimFundAPI_URL = `${API_CLAIM_FUND_URL}`;

export const getSettingMonitor = "getSettingMonitorKey";

type getSettingMonitorType = {
    searchDetail: string;
};

export const useGetHospitalMonitor = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ searchDetail }: getSettingMonitorType) => getSettingMonitorData({ searchDetail: searchDetail }),
        {
            onSuccess: (response) => {
                if (!response.isSuccess) {
                    onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
                } else {
                    onSuccessCallBack(response);
                }

                queryClient.invalidateQueries([getSettingMonitor]);
            },
            onError: (error: Error) => {
                onErrorCallback && onErrorCallback(error.message);
                queryClient.invalidateQueries([getSettingMonitor]);
            },
        }
    );
};

const getSettingMonitorData = ({ searchDetail }: getSettingMonitorType) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/HospitalPaymentSetting/Finance/HospitalSettingMonitor`, {
        searchDetail,
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
