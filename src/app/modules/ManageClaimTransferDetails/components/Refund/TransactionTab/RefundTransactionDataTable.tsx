import { Paper } from "@mui/material";
import { ClaimFundStandardDataTable } from "../../../../_common";
import RefundTransactionDataTableHook from "../../../hooks/Refund/RefundTransactionDataTableHook";

type RefundTransactionDataTableProps = {
    caseId: string;
};

const RefundTransactionDataTable = ({ caseId }: RefundTransactionDataTableProps) => {
    const {
        columns,
        transactionData,
        isTransactionLoading,
        isTransactionError,
        transactionError,
        pagination,
        setPaginated,
    } = RefundTransactionDataTableHook({ caseId });

    return (
        <Paper elevation={2} sx={{ borderRadius: "8px" }}>
            <ClaimFundStandardDataTable
                name="refundClaimTransaction"
                title=""
                data={transactionData?.data ?? []}
                columns={columns}
                paginated={pagination}
                setPaginated={setPaginated}
                isLoading={isTransactionLoading}
                isError={isTransactionError}
                error={transactionError}
                color="primary"
            />
        </Paper>
    );
};

export default RefundTransactionDataTable;