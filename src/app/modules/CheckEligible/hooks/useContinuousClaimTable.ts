import React, { useMemo } from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../_common";
import { useGetClaimContinue } from "../../../api/coreClaimApi";

const useContinuousClaimTable = (applicationId?: string | undefined) => {
    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });

    const { data: claimContinueData, isLoading: claimContinueLoading } = useGetClaimContinue(
        applicationId,
        undefined,
        undefined,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: claimContinueData?.totalAmountRecords ?? 0,
            totalAmountPages: claimContinueData?.totalAmountPages ?? 0,
            currentPage: claimContinueData?.currentPage ?? 0,
            recordsPerPage: claimContinueData?.recordsPerPage ?? 0,
            pageIndex: claimContinueData?.pageIndex ?? 0,
        }),
        [claimContinueData]
    );

    return { claimContinueData, pagination, claimContinueLoading, paginated, setPaginated };
};

export default useContinuousClaimTable;
