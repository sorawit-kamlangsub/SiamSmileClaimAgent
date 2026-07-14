import { useState, useMemo } from "react";
import { useGetClaimHistory } from "../../../../api/coreClaimApi";
import { monitorSelector } from "../../store/monitorSlice";
import { useAppSelector } from "../../../../../redux";
import { GetClaimHistoryDtoResponse } from "../../../../api/coreClaimApi.client";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";

export const useClaimHistory = (appIdFromProp?: string) => {
    const { selectedPolicy } = useAppSelector(monitorSelector);
    const appId = selectedPolicy?.appId === undefined ? appIdFromProp : selectedPolicy.appId;
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 100,
    });
    const { data: claimHistoryData, isLoading } = useGetClaimHistory(
        appId,
        undefined,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );
    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: claimHistoryData?.totalAmountRecords ?? 0,
            totalAmountPages: claimHistoryData?.totalAmountPages ?? 0,
            currentPage: claimHistoryData?.currentPage ?? 0,
            recordsPerPage: claimHistoryData?.recordsPerPage ?? 0,
            pageIndex: claimHistoryData?.pageIndex ?? 0,
        }),
        [claimHistoryData]
    );

    return {
        claimHistoryData,
        setPaginated,
        pagination,
        isLoading,
    };
};
