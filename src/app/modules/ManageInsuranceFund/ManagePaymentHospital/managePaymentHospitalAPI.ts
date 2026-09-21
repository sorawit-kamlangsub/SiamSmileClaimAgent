import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL } from "../../../../Const";
import { encodeURLWithParams, swalWarning } from "../../_common";
import { getHistorySetting } from "./historySettingAPI";

const claimFundAPI_URL = `${API_CLAIM_FUND_URL}`;

export const getSettingMonitor = "getSettingMonitorKey";

type getSettingMonitorType = {
    searchDetail: string;
};

export const useGetHospitalMonitor = (searchDetail: string) => {
    return useQuery([getSettingMonitor, searchDetail], () => getSettingMonitorData({ searchDetail: searchDetail }), {
        // enabled: isSearch,
    });
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

type UpdateHospitalPayLoadType = {
    hospitalPaymentSettingId: string;
    autoPayDelayDays?: number | undefined;
    holdStatusId?: number | undefined;
    isAutoPay?: boolean | undefined;
};

export const useUpdateHospitalSetting = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: UpdateHospitalPayLoadType) => updateHospitalSetting(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getSettingMonitor]);
            queryClient.invalidateQueries([getHistorySetting]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getSettingMonitor]);
            queryClient.invalidateQueries([getHistorySetting]);
        },
    });
};

const updateHospitalSetting = (payload: UpdateHospitalPayLoadType) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/HospitalPaymentSetting/Finance/UpdateHospitalSetting`, {
        ...payload,
    });
    return axios
        .post(url, payload)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                throw Error(res.data.message);
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};
