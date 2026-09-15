import { CircularProgress } from "@mui/material";
import { PaginationSortableDto, StandardDataTable } from "../../_common";
import useRefundTransferTransactionDetailHook from "../hooks/RefundTransferTransactionDetailHook";
import { useState } from "react";

type RefundTransferTransactionProps = {
    transactionId: string;
};

const RepayTransferTransaction = ({ transactionId }: RefundTransferTransactionProps) => {
    const { columns, getRefundDetailData, getRefundDetailIsLoading } = useRefundTransferTransactionDetailHook({
        transactionId,
    });

    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });

    if (getRefundDetailIsLoading) {
        return <CircularProgress color="inherit" />;
    }

    const record = getRefundDetailData?.data;
    const tableData = record ? [record] : [];

    return (
        <>
            <StandardDataTable
                name="transactionStatus"
                title=""
                data={tableData ?? []}
                columns={columns}
                isLoading={getRefundDetailIsLoading}
                displayFooter={false}
                paginated={paginated}
                setPaginated={setPaginated}
            />
        </>
    );
};

export default RepayTransferTransaction;
