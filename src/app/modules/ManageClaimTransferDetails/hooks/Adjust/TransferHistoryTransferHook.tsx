import { useParams } from "react-router-dom";
import { useGetTransferHistory } from "../../adjustClaimAPI";
import { useMemo, useState } from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
const useTransferHistoryHook = () => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { id = "" } = useParams();
    const { data: transferHistoryData, isLoading: isTransferHistoryLoading } = useGetTransferHistory(id, paginated);

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: transferHistoryData?.totalAmountRecords ?? 0,
            totalAmountPages: transferHistoryData?.totalAmountPages ?? 0,
            currentPage: transferHistoryData?.currentPage ?? 0,
            recordsPerPage: transferHistoryData?.recordsPerPage ?? 0,
            pageIndex: transferHistoryData?.pageIndex ?? 0,
        }),
        [transferHistoryData]
    );

    return { transferHistoryData, pagination, setPaginated, isTransferHistoryLoading };
};

export default useTransferHistoryHook;
