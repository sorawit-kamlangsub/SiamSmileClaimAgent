import dayjs from "dayjs";
import { MUIDataTableColumn } from "mui-datatables";
import { useGetTransactionHistory } from "../../adjustClaimAPI";
import { Box } from "@mui/material";
import { numberWithCommas } from "../../../../functionHelpers";
import { useMemo, useState } from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
type TransactionClaimDetailHookProps = {
    caseId: string;
};

const TransactionClaimDetailHook = ({ caseId }: TransactionClaimDetailHookProps) => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { data: historyTransactionData, isLoading: isHistoryTransactionLoading } = useGetTransactionHistory(
        caseId,
        paginated
    );

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: historyTransactionData?.totalAmountRecords ?? 0,
            totalAmountPages: historyTransactionData?.totalAmountPages ?? 0,
            currentPage: historyTransactionData?.currentPage ?? 0,
            recordsPerPage: historyTransactionData?.recordsPerPage ?? 0,
            pageIndex: historyTransactionData?.pageIndex ?? 0,
        }),
        [historyTransactionData]
    );

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
                setCellHeaderProps: () => ({ align: "right" as const }),
                customBodyRenderLite: (rowIndex) => {
                    const amount = historyTransactionData?.data?.[rowIndex]?.amountTotal ?? 0;
                    return <Box sx={{ textAlign: "end" }}>{numberWithCommas(amount)}</Box>;
                },
            },
        },
    ];
    return { columns, historyTransactionData, isHistoryTransactionLoading, pagination, setPaginated };
};

export default TransactionClaimDetailHook;
