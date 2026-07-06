import axios from "axios";
import CryptoJS from "crypto-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_SURVEY_URL } from "../../../Const";

const API_URL = API_SURVEY_URL;
const PATH = "/api/external/surveys";
const CLIENT_ID = "core-claim";
const HMAC_SECRET = "1GM2fD61/ZpEA44VSMoMZ3oKbWBGfSSqesBm8MkMOPk="; // ⚠️ see note below

const getSurveyKey = "getSurvey";

export const useGetSurvey = (onSuccessCallback: (response: any) => void, onErrorCallback: (error: string) => void) => {
    const queryClient = useQueryClient();
    console.log("HMAC_SECRET:", HMAC_SECRET);

    return useMutation((formId: number) => getSurveyData(formId), {
        onSuccess: (data) => {
            onSuccessCallback(data);
            queryClient.invalidateQueries([getSurveyKey]);
        },
        onError: (err: Error) => {
            onErrorCallback && onErrorCallback(err.message);
            queryClient.invalidateQueries([getSurveyKey]);
        },
    });
};

const generateNonce = (): string => {
    // C# uses Guid.ToString("N") -> 32 hex chars, no dashes
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
};

const generateHmacSignature = (nonce: string, body: string): string => {
    const raw = ["POST", PATH, nonce, body].join("\n");
    const hash = CryptoJS.HmacSHA256(raw, HMAC_SECRET);
    return CryptoJS.enc.Base64.stringify(hash);
};

const getSurveyData = (formId: number) => {
    const url = `${API_URL}`;
    const payload: string = JSON.stringify(formId);
    const nonce: string = generateNonce();
    const signature: string = generateHmacSignature(nonce, payload);

    return axios
        .post(url, formId, {
            headers: {
                "Content-Type": "application/json",
                "X-Client-Id": CLIENT_ID,
                "X-Nonce": nonce,
                "X-Signature": signature,
            },
        })
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            } else {
                throw res.data.message;
            }
        })
        .catch((err) => {
            throw err;
        });
};
