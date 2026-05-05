import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { VITE_QUEUE_API_URL, VITE_QUEUE_REFETCH_INTERVAL } from "../../Const";

const getQueueCountByUserId = async (userId: number | undefined) => {
    let url_ = VITE_QUEUE_API_URL + "/user/{userId}/queue-count";
    if (userId === undefined || userId === null) throw new Error("The parameter 'userId' must be defined.");
    url_ = url_.replace("{userId}", encodeURIComponent("" + userId));
    url_ = url_.replace(/[?&]$/, "");

    const response = await axios.get<QueueCountDtoResponseServiceResponse>(url_);

    return { queueTotal: 0, queueNoticeTotal: 0, ...response.data.data };
};

export const useGetQueueCountByUserId = (userId: number | undefined) => {
    return useQuery(["templateLayout", "notification"], () => getQueueCountByUserId(userId), {
        refetchInterval: VITE_QUEUE_REFETCH_INTERVAL,
    });
};

const getQueueNotificationByUserId = async (userId: number | undefined) => {
    let url_ = VITE_QUEUE_API_URL + "/queue/notice?AssigneeId={userId}";
    if (userId === undefined || userId === null) throw new Error("The parameter 'userId' must be defined.");
    url_ = url_.replace("{userId}", encodeURIComponent("" + userId));
    url_ = url_.replace(/[?&]$/, "");

    const response = await axios.get<QueueNotificationDtoServiceResponse>(url_);

    return response.data.data;
};

export const useGetQueueNotificationByUserId = (userId: number | undefined, enable: boolean = false) => {
    return useQuery(["templateLayout", "notification", "detail"], () => getQueueNotificationByUserId(userId), {
        refetchInterval: VITE_QUEUE_REFETCH_INTERVAL,
        enabled: enable,
    });
};

export interface QueueCountDtoResponse {
    queueTotal?: number;
    queueNoticeTotal?: number;
}

export interface QueueCountDtoResponseServiceResponse {
    data?: QueueCountDtoResponse;
    isSuccess?: boolean;
    message?: string | undefined;
    code?: number | undefined;
    exceptionMessage?: any | undefined;
    serverDateTime?: dayjs.Dayjs;
    totalAmountRecords?: number | undefined;
    totalAmountPages?: number | undefined;
    currentPage?: number | undefined;
    recordsPerPage?: number | undefined;
    pageIndex?: number | undefined;
}

export interface QueueNotificationDtoResponse {
    queueNotificationId?: number;
    assigneeId?: number;
    assignee?: string;
    queueId?: string;
    fromSystemName?: string;
    textMessage?: string;
    url?: string;
    createdByUserId?: number;
    createdBy?: string;
    createdDate?: dayjs.Dayjs;
    updatedByUserId?: number;
    updateBy?: string;
    updatedDate?: dayjs.Dayjs;
    isReaded?: boolean;
    totalCount?: number;
}

export interface QueueNotificationDtoServiceResponse {
    data?: QueueNotificationDtoResponse[];
    isSuccess?: boolean;
    message?: string | undefined;
    code?: number | undefined;
    exceptionMessage?: any | undefined;
    serverDateTime?: dayjs.Dayjs;
    totalAmountRecords?: number | undefined;
    totalAmountPages?: number | undefined;
    currentPage?: number | undefined;
    recordsPerPage?: number | undefined;
    pageIndex?: number | undefined;
}
