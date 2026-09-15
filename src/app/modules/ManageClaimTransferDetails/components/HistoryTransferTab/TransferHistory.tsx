import { Backdrop, CircularProgress, Grid, Paper } from "@mui/material";
import HistoryTableCard from "./HistoryTableCard";
import useTransferHistoryHook from "../../hooks/Adjust/TransferHistoryTransferHook";
import { useState } from "react";
import { PaginationSortableDto } from "../../../_common";
import { usePayTransferHistoryColumns, useRefundHistoryColumns } from "../../hooks/HistoryTable/HistoryTransferHook";

const TransferHistory = () => {
    const { transferHistoryData, pagination, setPaginated, isTransferHistoryLoading } = useTransferHistoryHook();

    const payTransferDetails = transferHistoryData?.data?.payTransferDetails ?? [];
    const refundHistoryDetails = transferHistoryData?.data?.refundHistoryDetails ?? [];

    const [refundPaginated, setRefundPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });

    const payTransferColumns = usePayTransferHistoryColumns(payTransferDetails);
    const refundColumns = useRefundHistoryColumns(refundHistoryDetails);

    if (isTransferHistoryLoading) {
        return (
            <Backdrop open={isTransferHistoryLoading} style={{ zIndex: 9999 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

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
                            paginated={pagination}
                            setPaginated={setPaginated}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mt: 2 }}>
                    {/* TODO Wait for API */}
                    <Paper elevation={2} sx={{ borderRadius: 4, p: 1 }}>
                        <HistoryTableCard
                            title="ประวัติการคืนเงิน"
                            name="refundHistory"
                            columns={refundColumns}
                            data={refundHistoryDetails}
                            paginated={refundPaginated}
                            setPaginated={setRefundPaginated}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default TransferHistory;
