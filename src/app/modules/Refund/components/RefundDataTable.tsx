import { Grid, Paper, Theme, useMediaQuery } from "@mui/material";
import { ClaimFundStandardDataTable } from "../../_common";
import { useAppSelector } from "../../../../redux";
import useRefundDataTableHook from "../hooks/RefundDataTableHook";

const RefundDataTable = () => {
    const { searchMonitor } = useAppSelector((state) => state.refund);
    const isStatusSelected = !!searchMonitor.paymentStatusId;
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const { columns, getRefundMonitorData, isGetRefundLoading, pagination, setPaginated } =
        useRefundDataTableHook();
    return (
        <>
            <Grid container>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Paper elevation={2} sx={{ p: { xs: 1, md: 3 }, borderRadius: 3 }}>
                        <ClaimFundStandardDataTable
                            name="refund"
                            columns={columns}
                            data={getRefundMonitorData?.data ?? []}
                            color="primary"
                            paginated={pagination}
                            setPaginated={setPaginated}
                            isLoading={isStatusSelected ? isGetRefundLoading : false}
                            delayNoMatch={isStatusSelected}
                            options={{ responsive: isMobile ? "simple" : "standard" }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default RefundDataTable;