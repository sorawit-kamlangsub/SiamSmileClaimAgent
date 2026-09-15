import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { APIGW_CLAIM_FUND_API_URL } from "../../Const";

const claimFundAPI_URL = APIGW_CLAIM_FUND_API_URL;

const createTransferKey = "createTransfer";

const createPayment = (payload: any) => {
    const url = `${claimFundAPI_URL}/Transfer/v1/CreatePayment`;
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

export const useCreatePayment = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: any) => createPayment(payload), {
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
