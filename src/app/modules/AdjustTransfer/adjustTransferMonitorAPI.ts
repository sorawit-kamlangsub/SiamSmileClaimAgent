import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_CLAIM_FUND_URL } from "../../../Const";
import { encodeURLWithParams, PaginationSortableDto } from "../_common";

const apiURL = `${API_CLAIM_FUND_URL}/AdditionalTransfer`;

const getClaimAdjustMonitor = "getClaimAdjustMonitorKey";

export type GetClaimAdjustFilterType = {
    branceId: number | undefined | null;
    paymentStatusId: number | undefined | null;
    pagination: PaginationSortableDto;
};

export const useGetClaimAdjustMonitorWithFilter = ({
    branceId,
    paymentStatusId,
    pagination,
}: GetClaimAdjustFilterType) => {
    return useQuery([branceId, paymentStatusId, pagination, getClaimAdjustMonitor], () =>
        getClaimAdjustMonitorData({ branceId, paymentStatusId, pagination })
    );
};

const getClaimAdjustMonitorData = ({
    branceId = null,
    paymentStatusId = null,
    pagination,
}: GetClaimAdjustFilterType) => {
    const formBody = {
        branceId,
        paymentStatusId,
    };
    const url = encodeURLWithParams(`${apiURL}/AdditionalTransferMonitor`, {
        ...pagination,
    });
    return axios
        .post(url, formBody)
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
