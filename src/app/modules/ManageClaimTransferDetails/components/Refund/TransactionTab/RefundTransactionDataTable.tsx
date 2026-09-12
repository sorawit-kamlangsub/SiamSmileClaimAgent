import { Paper } from "@mui/material";
import { StandardDataTable } from "../../../../_common";
import RefundTransactionDataTableHook from "../../../hooks/Refund/RefundTransactionDataTableHook";

type RefundTransactionDataTableProps = {
    caseId: string;
};

const RefundTransactionDataTable = ({ caseId }: RefundTransactionDataTableProps) => {
    const { columns, transactionData, isTransactionLoading, pagination, setPaginated } =
        RefundTransactionDataTableHook({ caseId });

    return (
        <Paper elevation={2} sx={{ borderRadius: "8px" }}>
            <StandardDataTable
                name="refundClaimTransaction"
                title=""
                data={transactionData?.data ?? []}
                columns={columns}
                paginated={pagination}
                setPaginated={setPaginated}
                isLoading={isTransactionLoading}
                color="primary"
            />
        </Paper>
    );
};

export default RefundTransactionDataTable;