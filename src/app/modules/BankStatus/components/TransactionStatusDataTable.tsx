import { useState } from "react";
import { PaginationSortableDto, StandardDataTable } from "../../_common";
import useTransactionStatusDataTableHook from "../hooks/TransactionStatusDataTableHook";

type TransactionStatusDataTableProps = {
    transactionId: string;
};

const TransactionStatusDataTable = ({ transactionId }: TransactionStatusDataTableProps) => {
    const { columns, dataMock } = useTransactionStatusDataTableHook();
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });
    return (
        <>
            <StandardDataTable
                name="transactionStatus"
                title=""
                data={dataMock ?? []}
                columns={columns}
                displayFooter={false}
                paginated={paginated}
                setPaginated={setPaginated}
            />
        </>
    );
};

export default TransactionStatusDataTable;
