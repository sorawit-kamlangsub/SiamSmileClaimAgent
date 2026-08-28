// CC690800000221
// CLPA690800000075

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL as API_CLAIM_FUND_URL } from "../../../Const";
import { encodeURLWithParams } from "../_common";

const apiURL = `${API_CLAIM_FUND_URL}/api`;

const getClaimByClaimOrCase = "getClaimByClaimOrCaseKey";

export const useSearchClaimOrCase = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: { searchDetail: string }) => searchClaimByClaimOrCase(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getClaimByClaimOrCase]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getClaimByClaimOrCase]);
        },
    });
};

const searchClaimByClaimOrCase = (payload: { searchDetail: string }) => {
    const url = encodeURLWithParams(`${apiURL}/Setting/SearchClaimOrCase`, payload);
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
