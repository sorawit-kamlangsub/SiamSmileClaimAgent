import TransactionClaimDetailHook from "../../../hooks/Adjust/TransactionClaimDetailHook";
import { StandardDataTable } from "../../../../_common";
import { Paper } from "@mui/material";

type ClamTransactionDataTableProps = {
    caseId: string;
};
const ClamTransactionDataTable = ({ caseId }: ClamTransactionDataTableProps) => {
    const { columns, historyTransactionData, isHistoryTransactionLoading, pagination, setPaginated } =
        TransactionClaimDetailHook({ caseId });

    return (
        <>
            <Paper elevation={2} sx={{ borderRadius: "8px" }}>
                <StandardDataTable
                    name="historyTransferClaim"
                    title=""
                    data={historyTransactionData?.data ?? []}
                    columns={columns}
                    paginated={pagination}
                    setPaginated={setPaginated}
                    isLoading={isHistoryTransactionLoading}
                    color="grey"
                />
            </Paper>
        </>
    );
};

export default ClamTransactionDataTable;
