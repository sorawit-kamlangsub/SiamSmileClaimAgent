import { useMemo, useState } from "react";
import TransactionClaimDetailHook from "../../../hooks/Adjust/TransactionClaimDetailHook";
import { PaginationResultDto, PaginationSortableDto, StandardDataTable } from "../../../../_common";
import { Paper } from "@mui/material";

type ClamTransactionDataTableProps = {
    caseId: string;
};
const ClamTransactionDataTable = ({ caseId }: ClamTransactionDataTableProps) => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { columns, historyTransactionData, isHistoryTransactionLoading } = TransactionClaimDetailHook({ caseId });

    const startIndex = ((paginated.page ?? 0) - 1) * (paginated.recordsPerPage ?? 0);
    const pagedClaimData = (historyTransactionData?.data ?? []).slice(
        startIndex,
        startIndex + (paginated.recordsPerPage ?? 0)
    );

    const paginationResult: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: historyTransactionData?.length ?? 0,
            totalAmountPages: Math.ceil((historyTransactionData?.length ?? 0) / (paginated.recordsPerPage ?? 0)) || 0,
            currentPage: paginated.page,
            recordsPerPage: paginated.recordsPerPage,
            pageIndex: (paginated.page ?? 0) - 1 < 0 ? 0 : (paginated.page ?? 1) - 1,
        }),
        [historyTransactionData, paginated]
    );
    return (
        <>
            <Paper elevation={2} sx={{ borderRadius: "8px" }}>
                <StandardDataTable
                    name="historyTransferClaim"
                    title=""
                    data={pagedClaimData ?? []}
                    columns={columns}
                    paginated={paginationResult}
                    setPaginated={setPaginated}
                    isLoading={isHistoryTransactionLoading}
                    color="grey"
                />
            </Paper>
        </>
    );
};

export default ClamTransactionDataTable;
