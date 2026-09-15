import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL, API_SURVEY_URL } from "../../../Const";
import { encodeURLWithParams } from "../_common";

const surveyAPI_URL = API_SURVEY_URL;
const claimFundAPI_URL = `${API_CLAIM_FUND_URL}/api`;

const getPayTransferTransactionIdKey = "getPayTransferTransactionId";
// const getSurveyIdKey = "getSurveyId";
const getSurveyKey = "getSurvey";
const getPaymentDetailsKey = "getPaymentDetails";

export const useGetPayTransferTransactionId = (payload: object) => {
    return useQuery([getPayTransferTransactionIdKey], () => getPayTransferTransactionData(payload));
};

const getPayTransferTransactionData = (payload: any) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/Notification/GetTransactionById`, payload);

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

type ResponseSurveyId = {
    data: {
        surveyId: number;
    };
    isSuccess: boolean;
};

export const useGetSurveyId = (
    onSuccessCallBack: (response: ResponseSurveyId) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation(() => getSurveyId(), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getPayTransferTransactionIdKey]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getPayTransferTransactionIdKey]);
        },
    });
};

const getSurveyId = () => {
    const url = `${claimFundAPI_URL}/Notification/GetSurveyId`;

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

export const useGetSurveyQuestion = (surveyToken: string) => {
    return useQuery([getSurveyKey], () => getSurveyQuestion(surveyToken), { enabled: !!surveyToken });
};

const getSurveyQuestion = (surveyToken: string) => {
    const url = `${surveyAPI_URL}/${surveyToken}`;

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

export const useSaveSurvey = (onSuccessCallBack: (response: any) => void, onErrorCallback: (error: string) => void) => {
    const queryClient = useQueryClient();
    return useMutation((payload: any) => saveSurvey(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            // queryClient.invalidateQueries([getPayTransferTransactionIdKey]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getPayTransferTransactionIdKey]);
        },
    });
};

const saveSurvey = (payload: any) => {
    const url = `${claimFundAPI_URL}/Notification/SaveSurveyFeedback`;
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

type UpdateSurveyType = {
    smStransactionId: string;
    surveyId: number;
};

export const useUpdateSurveyId = (onSuccessCallBack: (res: any) => void, onErrorCallback: (error: string) => void) => {
    const queryClient = useQueryClient();
    return useMutation((payload: UpdateSurveyType) => updateSurveyId(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getPayTransferTransactionIdKey]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getPayTransferTransactionIdKey]);
        },
    });
};

const updateSurveyId = (payload: UpdateSurveyType) => {
    const url = `${claimFundAPI_URL}/Notification/UpdateSMSTransactionSurvey`;
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

//NOTE - PaymentDetails
export const useGetPaymentDetails = (ref: string | undefined) => {
    return useQuery([getPaymentDetailsKey], () => getPaymentDetailsByRef(ref), { enabled: !!ref });
};

const getPaymentDetailsByRef = (ref: string | undefined) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/Transfer/v1/PaymentDetails`, { referenceCode: [ref] });

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
