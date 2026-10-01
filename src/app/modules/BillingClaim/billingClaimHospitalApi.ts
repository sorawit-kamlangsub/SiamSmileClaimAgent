import axios from "axios";
import { API_URL } from "../../../Const";

import { useQuery } from "@tanstack/react-query";
import { HospitalBillingClient } from "../../api/claimBillingApi.client";

const hospitalBillingClient = new HospitalBillingClient(API_URL, axios);

const getHospitalMonitorKey = ["getHospitalMonitor"];

export const useGetHospitalBillingClaimMonitor = (
    branchId?: number | undefined,
    reviewedByUserId?: number | undefined,
    claimSourceId?: number | undefined,
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
