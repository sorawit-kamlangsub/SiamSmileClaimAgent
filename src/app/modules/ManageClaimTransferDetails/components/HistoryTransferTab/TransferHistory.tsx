import { Backdrop, CircularProgress, Grid, Paper } from "@mui/material";
import HistoryTableCard from "./HistoryTableCard";
import useTransferHistoryHook from "../../hooks/Adjust/TransferHistoryTransferHook";
import { useState } from "react";
import { PaginationSortableDto } from "../../../_common";
import { usePayTransferHistoryColumns, useRefundHistoryColumns } from "../../hooks/HistoryTable/HistoryTransferHook";
import { useGetRefundDecreaseTransaction } from "../../../../api/coreClaimApi";
import { useParams } from "react-router-dom";

const TransferHistory = () => {
    const { transferHistoryData, pagination, setPaginated, isTransferHistoryLoading } = useTransferHistoryHook();
    const { id = "" } = useParams();

    const payTransferDetails = transferHistoryData?.data?.payTransferDetails ?? [];

    const [refundPaginated, setRefundPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const {
        data: refundHistoryResponse,
        isLoading: isRefundHistoryLoading,
        isError: isRefundHistoryError,
        error: refundHistoryError,
    } = useGetRefundDecreaseTransaction(id, refundPaginated);
    const refundHistoryDetails = refundHistoryResponse?.data ?? [];

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
                            color="primary"
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mt: 2 }}>
                    <Paper elevation={2} sx={{ borderRadius: 4, p: 1 }}>
                        <HistoryTableCard
                            title="ประวัติการคืนเงิน"
                            name="refundHistory"
                            columns={refundColumns}
                            data={refundHistoryDetails}
                            paginated={refundPaginated}
                            setPaginated={setRefundPaginated}
                            color="primary"
                            isLoading={isRefundHistoryLoading}
                            isError={isRefundHistoryError}
                            error={refundHistoryError}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default TransferHistory;
