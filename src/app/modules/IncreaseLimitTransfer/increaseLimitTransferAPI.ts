import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { APIGW_CLAIM_FUND_API_URL } from "../../../Const";
import { encodeURLWithParams, PaginationSortableDto } from "../_common";

const apiURL = `${APIGW_CLAIM_FUND_API_URL}/IncreaseTransfer`;
const getIncreaseTransferLimitMonitorsKey = "getIncreaseTransferLimitMonitorsKey";

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
