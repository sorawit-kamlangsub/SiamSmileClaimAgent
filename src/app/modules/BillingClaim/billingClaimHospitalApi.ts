import axios from "axios";
import { API_URL } from "../../../Const";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    CreateBillingHospitalDto,
    GuidListServiceResponse,
    HospitalBillingClient,
} from "../../api/claimBillingApi.client";

const hospitalBillingClient = new HospitalBillingClient(API_URL, axios);

const getHospitalMonitorKey = ["getHospitalMonitor"];

export const useGetHospitalBillingClaimMonitor = (
    branchId?: number | undefined,
    reviewedByUserId?: number | undefined,
    claimSourceId?: number | undefined,
    searchTypeId?: number | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined,
    isSearch?: boolean
) => {
    return useQuery(
        [
            getHospitalMonitorKey,
            branchId,
            reviewedByUserId,
            claimSourceId,
            searchTypeId,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
            isSearch,
        ],
        () =>
            hospitalBillingClient.hospitalBillingClaimFundMonitor(
                branchId,
                reviewedByUserId,
                claimSourceId,
                searchTypeId,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        {
            enabled: !!isSearch,
        }
    );
};

export const useCreateHospitalBilling = (
    onSuccessCallback?: (response: GuidListServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    const queryClient = useQueryClient();
    return useMutation((body: CreateBillingHospitalDto) => hospitalBillingClient.createBillingHospital(body), {
        onSuccess: (response) => {
            if (!response.isSuccess)
                onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
            else {
                queryClient.invalidateQueries([getHospitalMonitorKey], { refetchType: "all" });
                onSuccessCallback?.(response);
            }
        },
        onError: (error: Error) => {
            onErrorCallback?.(error.message);
        },
    });
};
