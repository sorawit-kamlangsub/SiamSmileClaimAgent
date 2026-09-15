import { useParams } from "react-router-dom";
import { useGetClaimTransactionLog } from "../../../../api/coreClaimApi";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import { useMemo, useState } from "react";

const useClaimTransactionHook = () => {
    const { id } = useParams();
    const claimId = id ? atob(id) : undefined;
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { data: transaction, isLoading: transactionLoading } = useGetClaimTransactionLog(
        claimId ?? "",
        undefined,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );
    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: transaction?.totalAmountRecords ?? 0,
            totalAmountPages: transaction?.totalAmountPages ?? 0,
            currentPage: transaction?.currentPage ?? 0,
            recordsPerPage: transaction?.recordsPerPage ?? 0,
            pageIndex: transaction?.pageIndex ?? 0,
        }),
        [transaction]
    );
    return {
        transaction,
        transactionLoading,
        pagination,
        setPaginated,
    };
};

export default useClaimTransactionHook;
