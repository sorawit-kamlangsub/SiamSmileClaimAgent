import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL } from "../../../../Const";
import { encodeURLWithParams } from "../../_common";

const claimFundAPI_URL = `${API_CLAIM_FUND_URL}/api`;

export const getHistorySetting = "getHistorySettingKey";

export const useGetHistoryHospitalSetting = (hospitalPaymentSettingId: string) => {
    return useQuery(
        [getHistorySetting, hospitalPaymentSettingId],
        () => getHistoryHospitalSetting(hospitalPaymentSettingId),
        { enabled: !!hospitalPaymentSettingId }
    );
};

const getHistoryHospitalSetting = (hospitalPaymentSettingId: string) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/HospitalPaymentSetting/Finance/GetHistories`, {
        hospitalPaymentSettingId,
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
