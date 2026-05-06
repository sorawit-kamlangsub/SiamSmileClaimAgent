import axios, { AxiosResponse } from "axios";
import { encodeURLWithParams } from ".";

//#region Interfaces
export interface Callback<TResponse> {
    onSuccessCallback?: (response: TResponse) => void;
    onErrorCallback?: (error: string) => void;
}

export interface ClientHelpers {
    reactQuery: {
        response: {
            handleSuccess: <TResponse>(
                onSuccessCallback: Callback<TResponse>["onSuccessCallback"],
                onErrorCallback: Callback<any>["onErrorCallback"],
                response: TResponse & { isSuccess?: boolean; message?: string; exceptionMessage?: string }
            ) => void;
            handleError: (onErrorCallback: Callback<any>["onErrorCallback"], error: Error) => void;
        };
    };
    download: {
        toExcel: <TRequest extends Payload>(
            payload: TRequest,
            url: string,
            method?: "get" | "post"
        ) => Promise<AxiosResponse<Blob>>;
    };
}

//#region Private Interfaces
interface Payload {
    [key: string]: any;
}
//#endregion

//#endregion

//#region Private Methods
const cleanPayload = (payload: Payload): void => {
    for (const key in payload) {
        if (payload[key] === null || payload[key] === undefined) {
            delete payload[key];
        } else if (typeof payload[key] === "object") {
            cleanPayload(payload[key] as Payload);
        }
    }
};
//#endregion

//#region Core functions
/**
 * Process
 */
export const clientHelpers: ClientHelpers = {
    reactQuery: {
        response: {
            handleSuccess: <TResponse>(
                onSuccessCallback: Callback<TResponse>["onSuccessCallback"],
                onErrorCallback: Callback<any>["onErrorCallback"],
                response: TResponse & { isSuccess?: boolean; message?: string; exceptionMessage?: string }
            ) => {
                if (!response.isSuccess)
                    return onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
                else return onSuccessCallback?.(response);
            },
            handleError: (onErrorCallback: Callback<any>["onErrorCallback"], error: Error) => {
                return onErrorCallback?.(error.message || "Unknown error");
            },
        },
    },
    download: {
        toExcel: async <TRequest extends Payload>(
            payload: TRequest,
            url: string,
            method: "get" | "post" = "get" // พารามิเตอร์ใหม่สำหรับระบุเมธอด ค่าเริ่มต้นคือ 'get'
        ): Promise<AxiosResponse<Blob>> => {
            cleanPayload(payload);
            let response: Promise<AxiosResponse<Blob>>;

            if (method === "get") {
                const _url = encodeURLWithParams(url, payload);
                response = axios.get(`${_url}`, { responseType: "blob" });
            } else if (method === "post") {
                response = axios.post(url, payload, { responseType: "blob" });
            } else {
                throw new Error("Invalid method specified.");
            }

            return response
                .then((res: AxiosResponse<Blob>) => {
                    if (res.status === 200) {
                        return res;
                    } else {
                        throw Error(res.statusText);
                    }
                })
                .catch((err) => {
                    throw err;
                });
        },
    },
};
//#endregion
