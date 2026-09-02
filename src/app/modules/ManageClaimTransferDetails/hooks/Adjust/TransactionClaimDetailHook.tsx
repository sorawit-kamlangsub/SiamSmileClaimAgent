import dayjs from "dayjs";
import { MUIDataTableColumn } from "mui-datatables";
import { useGetTransferHistory } from "../../adjustClaimAPI";
import { Box } from "@mui/material";
import { numberWithCommas } from "../../../../functionHelpers";
type TransactionClaimDetailHookProps = {
    caseId: string;
};

const TransactionClaimDetailHook = ({ caseId }: TransactionClaimDetailHookProps) => {
    const { data: historyTransactionData, isLoading: isHistoryTransactionLoading } = useGetTransferHistory(caseId);
    const columns: MUIDataTableColumn[] = [
        {
            name: "transactionDate",
            label: "วันที่ทำรายการ",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (rowIndex) => {
                    const formatDate = historyTransactionData?.data?.[rowIndex]?.transactionDate
                        ? dayjs(historyTransactionData?.data?.[rowIndex]?.transactionDate).format("DD/MM/YYYY HH:mm:ss")
                        : "-";
                    return formatDate;
                },
            },
        },
        {
            name: "claimTransactionTypeName",
            label: "ประเภทรายการ",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "createdByFullName",
            label: "ผู้ทำรายการ",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "amountTotal",
            label: "จำนวนเงิน",
            options: {
                filter: false,
                sort: false,
                customHeadRender: (columnMeta) => {
                    return (
                        <Box
                            sx={{
                                textAlign: "end",
                                p: 2,
                                width: "100%",
                                borderBottom: "1px solid #E0E0E0", // match the other header cells
                                boxSizing: "border-box",
                            }}
                        >
                            {columnMeta.label}
                        </Box>
                    );
                },
                customBodyRenderLite: (rowIndex) => {
                    const amount = historyTransactionData?.data?.[rowIndex]?.amountTotal ?? 0;
                    return <Box sx={{ textAlign: "end" }}>{numberWithCommas(amount)}</Box>;
                },
            },
        },
    ];
    return { columns, historyTransactionData, isHistoryTransactionLoading };
};

export default TransactionClaimDetailHook;
