import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL } from "../../../Const";
import { encodeURLWithParams, PaginationSortableDto } from "../_common";

const apiURL = `${API_CLAIM_FUND_URL}`;

const getClaimByClaimOrCase = "getClaimByClaimOrCaseKey";

interface SearchClaimOrCasePayload extends PaginationSortableDto {
    searchDetail: string;
}

export const useSearchClaimOrCase = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: SearchClaimOrCasePayload) => searchClaimByClaimOrCase(payload), {
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

const searchClaimByClaimOrCase = (payload: SearchClaimOrCasePayload) => {
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
