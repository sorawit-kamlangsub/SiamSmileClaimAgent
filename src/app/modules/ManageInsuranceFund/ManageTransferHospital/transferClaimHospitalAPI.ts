import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL } from "../../../../Const";
import { encodeURLWithParams, swalWarning } from "../../_common";
import { HospitalTransferMonitorType } from "./manageTransferHospitalAPI";

const claimFundAPI_URL = `${API_CLAIM_FUND_URL}/api`;

const getHospitalPendingTransferByStatusKey = "getHospitalPendingTransferByStatus";

export type HospitalPendingTransferType = {
    data: [
        {
            paymentId: string;
            paymentCode: string;
            paymentDate: string;
            expectedPaymentDate: string | null;
            hospitalId: number;
            hospitalName: string | null;
            itemCount: number;
            amount: number;
            netAmount: number;
            toBank: string | null;
            toAccountNo: string | null;
            toAccountName: string | null;
            statusId: number;
            statusNameTH: string;
            statusCode: string;
            isSelectable: boolean;
            actionId: string;
        },
    ];
    isSuccess: boolean;
    message: string;
    code: number | undefined;
    exceptionMessage: string;
    serverDateTime: string;
    totalAmountRecords: number | undefined;
    totalAmountPages: number | undefined;
    currentPage: number | undefined;
    recordsPerPage: number | undefined;
    pageIndex: number | undefined;
};

export const useGetHospitalMonitorDataByStatus = (payload: HospitalTransferMonitorType) => {
    return useQuery(
        [getHospitalPendingTransferByStatusKey, payload],
        () => hospitalPendingTransferMonitorData(payload),
        {
            enabled: payload.statusId !== 1 && !!payload.statusId,
        }
    );
};
const hospitalPendingTransferMonitorData = (payload: HospitalTransferMonitorType) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/HospitalTransfer/v1/HospitalTransferStatusMonitor`, {
        Page: payload.paginate.page,
        RecordsPerPage: payload.paginate.recordsPerPage,
    });
    return axios
        .post(url, payload)
        .then((res) => {
            if (res.data) {
                if (res.data.isSuccess) {
                    return res.data;
                }
            } else {
                throw Error(res.data?.message);
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};

export const useTransferClaimHospitalNow = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((paymentId: string) => hospitalTransferPaymentNow(paymentId), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getHospitalPendingTransferByStatusKey]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getHospitalPendingTransferByStatusKey]);
        },
    });
};

const hospitalTransferPaymentNow = (paymentId: string) => {
    const url = `${claimFundAPI_URL}/HospitalTransfer/v1/TransferHospital`;
    return axios
        .post(url, { paymentId: paymentId })
        .then((res) => {
            if (res.data) {
                if (res.data?.isSuccess) {
                    return res.data;
                } else {
                    return swalWarning("แจ้งเตือน", res.data?.message);
                }
            }
        })
        .catch((err: Error) => {
            throw err.message;
        });
};
