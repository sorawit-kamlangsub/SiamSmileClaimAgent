import { useState } from "react";
import { PaginationSortableDto, StandardDataTable } from "../../_common";
import useTransactionStatusDataTableHook from "../hooks/TransactionStatusDataTableHook";
import { CircularProgress } from "@mui/material";

type TransactionStatusDataTableProps = {
    transactionId: string;
};

const TransactionStatusDataTable = ({ transactionId }: TransactionStatusDataTableProps) => {
    const { columns, getInquiryDetailData, getInquiryDetailIsLoading } = useTransactionStatusDataTableHook({
        transactionId,
    });

    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });

    if (getInquiryDetailIsLoading) {
        return <CircularProgress color="inherit" />;
    }

    const record = getInquiryDetailData?.data;
    const tableData = record ? [record] : [];

    return (
        <>
            <StandardDataTable
                name="transactionStatus"
                title=""
                data={tableData ?? []}
                columns={columns}
                isLoading={getInquiryDetailIsLoading}
                displayFooter={false}
                paginated={paginated}
                setPaginated={setPaginated}
            />
        </>
    );
};

export default TransactionStatusDataTable;
