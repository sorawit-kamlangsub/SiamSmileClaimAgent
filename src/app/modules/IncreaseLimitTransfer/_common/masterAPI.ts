import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL, APIGW_URL } from "../../../../Const";

const getBranch = "getBranchKey";
const getPaymentStatus = "getPaymentStatusKey";

const coreClaimURL = `${APIGW_URL}/claim/core`;
const ClaimFundMasterURL = `${API_CLAIM_FUND_URL}/api/ClaimFund/Masters`;

export const useGetBranch = () => {
    return useQuery([getBranch], () => getBranchData());
};

const getBranchData = () => {
    const url = `${coreClaimURL}/Masters/branch`;

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

export const useGetPaymentStatus = () => {
    return useQuery([getPaymentStatus], () => getPaymentStatusData());
};

const getPaymentStatusData = () => {
    const url = `${ClaimFundMasterURL}/GetPaymentStatuses`;

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
