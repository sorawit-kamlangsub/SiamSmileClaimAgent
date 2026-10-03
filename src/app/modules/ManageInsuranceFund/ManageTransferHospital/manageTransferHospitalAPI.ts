import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL } from "../../../../Const";
import { encodeURLWithParams, PaginationDto } from "../../_common";

const claimFundAPI_URL = `${API_CLAIM_FUND_URL}`;

const getHospitalTransferByStatusKey = "getHospitalTransferByStatus";

export type HospitalTransferMonitorType = {
    statusId: number | undefined;
    hospitalName: string;
    paginate: PaginationDto;
};

export type HospitalTransferMonitorResponse = {
    data: [
        {
            transferGroupId: string;
            transferGroupNo: string;
            insuranceCompanyCode: string;
            insuranceCompanyNameTH: string;
            branchCode: string;
            branchNameTH: string;
            billControlNo: string;
            caseId: string;
            caseNo: string;
            billSentDate: string;
            insuredName: string;
            hospitalId: number | undefined;
            hospitalName: string;
            amount: number | undefined;
            statusId: number | undefined;
            statusNameTH: string;
            statusCode: string;
            isSelectable: boolean;
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

export const useGetHospitalTransferMonitor = (
    onSuccessCallBack: (response: HospitalTransferMonitorResponse) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: HospitalTransferMonitorType) => hospitalTransferMonitorData(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getHospitalTransferByStatusKey]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getHospitalTransferByStatusKey]);
        },
    });
};

const hospitalTransferMonitorData = (payload: HospitalTransferMonitorType) => {
    const url = encodeURLWithParams(`${claimFundAPI_URL}/HospitalTransfer/v1/HospitalTransferMonitor`, {
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

type GenerateGroupTransferType = {
    hospitalId: number | undefined;
    transferId: string;
}[];

export const useGenerateGroupTransfer = (
    onSuccessCallBack: (response: any) => void,
    onErrorCallback: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((payload: GenerateGroupTransferType) => transferHospitalGenerate(payload), {
        onSuccess: (response) => {
            if (!response.isSuccess) {
                onErrorCallback(response.message || response.exceptionMessage || "Unknown error");
            } else {
                onSuccessCallBack(response);
            }

            queryClient.invalidateQueries([getHospitalTransferByStatusKey]);
        },
        onError: (error: Error) => {
            onErrorCallback && onErrorCallback(error.message);
            queryClient.invalidateQueries([getHospitalTransferByStatusKey]);
        },
    });
};

const transferHospitalGenerate = (payload: GenerateGroupTransferType) => {
    const url = `${claimFundAPI_URL}/HospitalTransfer/v1/CreatePaymentHospital`;
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
