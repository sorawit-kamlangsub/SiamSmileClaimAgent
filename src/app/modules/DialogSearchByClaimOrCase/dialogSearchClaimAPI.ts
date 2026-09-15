import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIGW_CLAIM_FUND_API_URL } from "../../../Const";
import { encodeURLWithParams, PaginationSortableDto } from "../_common";

const apiURL = `${APIGW_CLAIM_FUND_API_URL}`;
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
            if (!response?.isSuccess) {
                onErrorCallback(response?.message || response?.exceptionMessage || "เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getClaimByClaimOrCase]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error?.message || "เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง");
            queryClient.invalidateQueries([getClaimByClaimOrCase]);
        },
    });
};

const searchClaimByClaimOrCase = (payload: SearchClaimOrCasePayload) => {
    const url = encodeURLWithParams(`${apiURL}/Setting/SearchClaimOrCase`, payload);
    return axios
        .get(url)
        .then((res) => {
            return res.data;
        });
};
