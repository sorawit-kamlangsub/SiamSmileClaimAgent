import { Backdrop, Box, CircularProgress, TableCell, TableRow } from "@mui/material";
import { StandardDataTable } from "../../_common";
import useBankStatusCheckDataTableHook from "../hooks/BankStatusCheckDataTableHook";
import TransactionStatusDataTable from "./TransactionStatusDataTable";

const BankStatusCheckDataTable = () => {
    const {
        columns,
        getInquiryMonitorsData,
        getInquiryMonitorsIsLoading,
        paginated,
        setPaginated,
        sentToBankIsLoading,
    } = useBankStatusCheckDataTableHook();

    const renderExpandableRow = (rowData: any, rowMeta: any) => {
        const transactionId = getInquiryMonitorsData?.data?.[rowMeta.dataIndex]?.payTransferTransactionId;

        return (
            <TableRow sx={{ backgroundColor: "#F5F8FC" }}>
                <TableCell colSpan={rowData.length + 1}>
                    <h3>รายละเอียด</h3>
                    {transactionId && <TransactionStatusDataTable transactionId={transactionId} />}
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
                    name="payTransferHospitalClaim"
                    title=""
                    data={getInquiryMonitorsData?.data ?? []}
                    columns={columns}
                    isLoading={getInquiryMonitorsIsLoading}
                    color="primary"
                    paginated={paginated}
                    setPaginated={setPaginated}
                    options={{
                        expandableRows: true,
                        expandableRowsHeader: false,
                        expandableRowsOnClick: false,
                        renderExpandableRow,
                        onRowExpansionChange: () => {},
                    }}
                />
                <Backdrop open={sentToBankIsLoading} style={{ zIndex: 9999 }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </Box>
        </>
    );
};

export default BankStatusCheckDataTable;
