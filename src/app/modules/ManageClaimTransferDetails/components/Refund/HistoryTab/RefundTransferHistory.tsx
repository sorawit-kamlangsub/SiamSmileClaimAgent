import { Box, Grid, Paper } from "@mui/material";
import { useState } from "react";
import dayjs from "dayjs";
import HistoryTableCard from "../../HistoryTransferTab/HistoryTableCard";
import { MUIDataTableColumn } from "mui-datatables";
import { PaginationSortableDto } from "../../../../_common";
import { numberWithCommas } from "../../../../../functionHelpers";
import { usePayTransferHistoryColumns } from "../../../hooks/HistoryTable/HistoryTransferHook";
import { useGetRefundDecreaseTransaction, useGetRefundTransferHistory } from "../../../../Refund/refundAPI";

const useRefundDecreaseColumns = (data: any[]): MUIDataTableColumn[] => [
    {
        name: "transactionDate",
        label: "วันที่ทำรายการ",
        options: {
            filter: false,
            sort: false,
            customBodyRenderLite: (rowIndex) => {
                const createdDate = data[rowIndex]?.transactionDate;
                return createdDate ? dayjs(createdDate).format("DD/MM/YYYY HH:mm:ss") : "-";
            },
        },
    },
    {
        name: "transactionTypeName",
        label: "ประเภทรายการ",
        options: { filter: false, sort: false },
    },
    {
        name: "decreaseAmount",
        label: "จำนวนเงิน",
options: {
            filter: false,
            sort: false,
            setCellHeaderProps: () => ({ align: "right" as const }),
            customBodyRenderLite: (rowIndex) => {
                const amount = data[rowIndex]?.decreaseAmount ?? 0;
                return <Box sx={{ textAlign: "end" }}>{numberWithCommas(amount)}</Box>;
            },
        },
    },
    {
        name: "description",
        label: "รายละเอียด",
        options: {
            filter: false,
            sort: false,
            customBodyRenderLite: (rowIndex) => data[rowIndex]?.description ?? "-",
        },
    },
];

type RefundTransferHistoryProps = {
    caseId: string;
};

const RefundTransferHistory = ({ caseId }: RefundTransferHistoryProps) => {
    const {
        data: transferHistoryRes,
        isLoading: isPayTransferLoading,
        isError: isPayTransferError,
        error: payTransferError,
    } = useGetRefundTransferHistory(caseId);
    const payTransferDetails = transferHistoryRes?.data?.payTransferDetails ?? [];

    const [payTransferPaginated, setPayTransferPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const [decreasePaginated, setDecreasePaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const {
        data: decreaseRes,
        isLoading: isDecreaseLoading,
        isError: isDecreaseError,
        error: decreaseError,
    } = useGetRefundDecreaseTransaction(caseId, decreasePaginated);
    const decreaseData = decreaseRes?.data ?? [];

    const payTransferColumns = usePayTransferHistoryColumns(payTransferDetails);
    const decreaseColumns = useRefundDecreaseColumns(decreaseData);

    return (
        <>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Paper elevation={2} sx={{ borderRadius: 4, p: 1 }}>
                        <HistoryTableCard
                            title="ประวัติการโอนเงิน"
                            name="payTransferHistory"
                            columns={payTransferColumns}
                            data={payTransferDetails}
                            paginated={payTransferPaginated}
                            setPaginated={setPayTransferPaginated}
                            color="primary"
                            isLoading={isPayTransferLoading}
                            isError={isPayTransferError}
                            error={payTransferError}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mt: 2 }}>
                    <Paper elevation={2} sx={{ borderRadius: 4, p: 1 }}>
                        <HistoryTableCard
                            title="ประวัติการคืนเงิน"
                            name="refundDecreaseHistory"
                            columns={decreaseColumns}
                            data={decreaseData}
                            paginated={decreasePaginated}
                            setPaginated={setDecreasePaginated}
                            color="primary"
                            isLoading={isDecreaseLoading}
                            isError={isDecreaseError}
                            error={decreaseError}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default RefundTransferHistory;