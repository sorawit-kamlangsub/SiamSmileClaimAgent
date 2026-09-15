import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { APIGW_URL } from "../../../../Const";
import { useBranchByUserPermission } from "../../_common/branchPermission";

const getBranch = "getBranchKey";
const getPaymentStatus = "getPaymentStatusKey";
const coreClaimURL = `${APIGW_URL}/claim/core`;

export const useGetBranch = () => {
    const branchQuery = useQuery([getBranch], () => getBranchData());
    const filteredBranches = useBranchByUserPermission(branchQuery.data?.data);
    return {
        ...branchQuery,
        data: branchQuery.data ? { ...branchQuery.data, data: filteredBranches } : branchQuery.data,
    };
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

export const useGetPaymentStatus = (enabled = true) => {
    return useQuery([getPaymentStatus], () => getPaymentStatusData(), { enabled });
};

const getPaymentStatusData = () => {
    const url = `${coreClaimURL}/ClaimFund/Masters/GetPaymentStatuses`;

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
