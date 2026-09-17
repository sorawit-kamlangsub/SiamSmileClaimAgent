import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { APIGW_CLAIM_FUND_API_URL } from "../../../Const";
import { encodeURLWithParams, PaginationSortableDto } from "../_common";

const apiURL = `${APIGW_CLAIM_FUND_API_URL}/IncreaseTransfer`;
const getIncreaseTransferLimitMonitorsKey = "getIncreaseTransferLimitMonitorsKey";
const getIncreaseTransferLimitDetailKey = "getIncreaseTransferLimitDetailKey";

export type GetIncreaseTransferLimitMonitorsFilterType = {
    searchDetail?: string | undefined | null;
    searchKey?: number;
    enabled?: boolean;
    pagination: PaginationSortableDto;
};

export const useGetIncreaseTransferLimitMonitors = ({
    searchDetail,
    searchKey,
    enabled,
    pagination,
}: GetIncreaseTransferLimitMonitorsFilterType) => {
    return useQuery(
        [searchDetail, searchKey, pagination, getIncreaseTransferLimitMonitorsKey],
        () => getIncreaseTransferLimitMonitorsData({ searchDetail, pagination }),
        {
            enabled: enabled ?? true,
            refetchOnMount: "always",
            cacheTime: 0,
        }
    );
};

export type IncreaseTransferLimitDetailRejectReasonDto = {
    code?: string;
    name?: string;
};

export type IncreaseTransferLimitDetailDto = {
    caseId?: string;
    claimId?: string;
    claimNo?: string;
    caseNo?: string;
    insuredName?: string;
    amount?: number;
    currentLimitAmount?: number;
    usedLimitAmount?: number;
    remainingLimitAmount?: number;
    requestedIncreaseAmount?: number;
    newRemainingLimitAmount?: number;
    rejectReasons?: IncreaseTransferLimitDetailRejectReasonDto[];
};

export type IncreaseTransferLimitDetailResponse = {
    data?: IncreaseTransferLimitDetailDto;
    isSuccess?: boolean;
    message?: string;
    code?: number;
    exceptionMessage?: string | null;
};

export const useGetIncreaseTransferLimitDetail = (caseId?: string) => {
    return useQuery([caseId, getIncreaseTransferLimitDetailKey], () => getIncreaseTransferLimitDetailData(caseId), {
        enabled: caseId !== undefined && caseId !== "",
        refetchOnMount: "always",
        cacheTime: 0,
    });
};

const getIncreaseTransferLimitDetailData = (caseId?: string) => {
    const url = encodeURLWithParams(`${apiURL}/IncreaseTransferLimitDetail`, {
        caseId,
    });
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            }
            throw new Error(res.data.message ?? "");
        })
        .catch((err) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            throw error.response?.data?.message ?? error.message ?? "";
        });
};

const getIncreaseTransferLimitMonitorsData = ({
    searchDetail,
    pagination,
}: Omit<GetIncreaseTransferLimitMonitorsFilterType, "searchKey" | "enabled">) => {
    const url = encodeURLWithParams(`${apiURL}/IncreaseTransferLimitMonitors`, {
        searchDetail,
        orderingField: pagination.orderingField,
        ascendingOrder: pagination.ascendingOrder,
        Page: pagination.page ?? 1,
        recordsPerPage: pagination.recordsPerPage ?? 10,
    });
    return axios
        .get(url)
        .then((res) => {
            if (res.data.isSuccess) {
                return res.data;
            }
            throw new Error(res.data.message ?? "");
        })
        .catch((err) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            throw error.response?.data?.message ?? error.message ?? "";
        });
};
