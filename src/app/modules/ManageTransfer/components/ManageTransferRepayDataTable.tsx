import { Box, TableCell, TableRow } from "@mui/material";
import { PaginationSortableDto, StandardDataTable } from "../../_common";
import { useState } from "react";
import useTransferRepayDataTableHook from "../hooks/TransferRepayDataTableHook";
import TransactionStatusDataTable from "../../BankStatus/components/TransactionStatusDataTable";

const renderExpandableRow = (rowData: any, _rowMeta: any) => {
    const colSpan = rowData.length + 1;

    return (
        <TableRow sx={{ backgroundColor: "#F5F8FC" }}>
            <TableCell colSpan={colSpan}>
                <h3>รายละเอียด</h3>
                <TransactionStatusDataTable transactionId="1" />
            </TableCell>
        </TableRow>
    );
};

const ManageTransferRepayDataTable = () => {
    const { columns, dataMock } = useTransferRepayDataTableHook();
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });

    return (
        <>
            <Box
                sx={{
                    "& .MuiTableBody-root .MuiTableRow-root > .MuiTableCell-root:first-of-type svg": {
                        color: "#000000 !important",
                    },
                }}
            >
                <StandardDataTable
                    name="repayClaimTable"
                    color="primary"
                    title=""
                    data={dataMock ?? []}
                    columns={columns}
                    paginated={paginated}
                    setPaginated={setPaginated}
                    options={{
                        expandableRows: true,
                        expandableRowsHeader: false,
                        expandableRowsOnClick: false,
                        renderExpandableRow: renderExpandableRow,
                    }}
                />
            </Box>
        </>
    );
};

export default ManageTransferRepayDataTable;
