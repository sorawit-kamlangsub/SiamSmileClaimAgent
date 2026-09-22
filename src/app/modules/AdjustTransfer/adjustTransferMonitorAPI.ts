import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { APIGW_CLAIM_FUND_API_URL } from "../../../Const";
import { encodeURLWithParams, PaginationSortableDto } from "../_common";

const apiURL = `${APIGW_CLAIM_FUND_API_URL}/AdditionalTransfer`;
const getClaimAdjustMonitor = "getClaimAdjustMonitorKey";
const getClaimAdditionalTransferAccountDetail = "getAdditionalTransferAccountDetailKey";

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

export const useGetAdditionalTransferAccountDetail = (paymentId: string) => {
    return useQuery(
        [getClaimAdditionalTransferAccountDetail, paymentId],
        () => getAdditionalTransferAccountDetailData(paymentId),
        { enabled: !!paymentId }
    );
};

const getAdditionalTransferAccountDetailData = (paymentId: string) => {
    const url = encodeURLWithParams(`${apiURL}/GetAdditionalTransferAccountDetail`, { paymentId });
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
