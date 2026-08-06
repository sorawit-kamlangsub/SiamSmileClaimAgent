import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_CLAIM_FUND_URL } from "../../Const";

const claimFundAPI_URL = `${API_CLAIM_FUND_URL}/api`;

const createTransferKey = "createTransfer";

const createTransfer = (payload: any) => {
    const url = `${claimFundAPI_URL}/Transfer/v1/CreateTransfer`;
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

export const useCreateTransfer = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: any) => createTransfer(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([createTransferKey]);
        },
    });
};

export const getEncryptText = (
    receivingBankAccountNo: string,
    receivingPhoneNumber: string,
    receivingBankAccountName: string
) => {
    const url = `${claimFundAPI_URL}/Transfer/v1/EncryptText`;

    return axios
        .post(url, {
            receivingBankAccountNo,
            receivingPhoneNumber,
            receivingBankAccountName,
        })
        .then((res) => {
            if (!res.data.accountNoResult || !res.data.bankAccountNameResult || !res.data.phoneNumberResult) {
                throw new Error("EncryptText response is invalid");
            }

            return res.data;
        });
};
