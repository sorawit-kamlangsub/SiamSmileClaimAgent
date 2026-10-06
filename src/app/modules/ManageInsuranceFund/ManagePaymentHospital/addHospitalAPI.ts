import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL } from "../../../../Const";
import { encodeURLWithParams } from "../../_common";
import { getSettingMonitor } from "./managePaymentHospitalAPI";

const claimFundAPI_URL = `${API_CLAIM_FUND_URL}/api`;

const getHospitalName = "getHospitalNameKey";

type GetSettingMonitorType = {
    orgName: string;
};

type GetOrganizeDto = {
    orgId: number;
    orgName: string;
};

export const useGetHospitalName = (orgName: string) => {
    return useQuery([getHospitalName, orgName], () => getHospitalNameBySearch({ orgName: orgName }), {
        enabled: !!orgName,
        select: (data: GetOrganizeDto[]) => data.slice(0, 10),
    });
};

const getHospitalNameBySearch = ({ orgName }: GetSettingMonitorType) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/HospitalPaymentSetting/Finance/SearchHospital`, {
        orgName,
    });

    return axios.get(url).then((res) => {
        if (!res.data.isSuccess) {
            throw new Error(res.data.message || "ไม่สามารถค้นหาสถานพยาบาลได้");
        }

        return res.data.data as GetOrganizeDto[];
    });
};

type AddHospitalRequestType = {
    hospitalId: number;
    hospitalName: string;
    autoPayDelayDays: number;
    holdStatusId: number;
    isAutoPay: boolean;
};

export const useAddHospital = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: AddHospitalRequestType) => addHospital(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
                queryClient.invalidateQueries([getSettingMonitor]);
            } else {
                onSuccessCallBack(response);
                queryClient.invalidateQueries([getSettingMonitor]);
            }
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getSettingMonitor]);
        },
    });
};

const addHospital = (payload: AddHospitalRequestType) => {
    const url = `${claimFundAPI_URL}/HospitalPaymentSetting/Finance/AddHospitalSetting`;
    return axios
        .post(url, payload)
        .then((res) => {
            if (res.data) {
                if (res.data.isSuccess) {
                    return res.data;
                }
            } else {
                throw Error(res.data?.message);
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};
