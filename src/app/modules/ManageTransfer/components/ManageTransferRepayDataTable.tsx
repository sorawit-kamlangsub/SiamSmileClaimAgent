import { Box, TableCell, TableRow } from "@mui/material";
import useTransferRepayDataTableHook from "../hooks/TransferRepayDataTableHook";
import { StandardDataTable } from "../../_common";
import RepayTransferTransaction from "./RepayTransferTransaction";

const ManageTransferRepayDataTable = () => {
    const { columns, refundDataTableData, refundDataTableIsLoading, paginated, setPaginated } =
        useTransferRepayDataTableHook();

    const renderExpandableRow = (rowData: any, rowMeta: any) => {
        const colSpan = rowData.length + 1;

        const transactionId = refundDataTableData?.data?.[rowMeta.dataIndex]?.payTransferTransactionId;

        return (
            <TableRow sx={{ backgroundColor: "#F5F8FC" }}>
                <TableCell colSpan={colSpan}>
                    <h3>รายละเอียด</h3>
                    {transactionId && <RepayTransferTransaction transactionId={transactionId} />}
                </TableCell>
            </TableRow>
        );
    };

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
                    data={refundDataTableData?.data ?? []}
                    columns={columns}
                    paginated={paginated}
                    setPaginated={setPaginated}
                    isLoading={refundDataTableIsLoading}
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
