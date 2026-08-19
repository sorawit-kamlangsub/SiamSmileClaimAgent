import { Box, TableCell, TableRow } from "@mui/material";
import { useState } from "react";
import { PaginationSortableDto, StandardDataTable } from "../../_common";
import useBankStatusCheckDataTableHook from "../hooks/BankStatusCheckDataTableHook";
import TransactionStatusDataTable from "./TransactionStatusDataTable";

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

const BankStatusCheckDataTable = () => {
    const { columns, dataMock } = useBankStatusCheckDataTableHook();
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
                    name="payTransferHospitalClaim"
                    title=""
                    data={dataMock ?? []}
                    columns={columns}
                    color="primary"
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

export default BankStatusCheckDataTable;
