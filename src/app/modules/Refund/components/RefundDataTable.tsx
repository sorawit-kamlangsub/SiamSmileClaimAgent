import { Grid, Paper } from "@mui/material";
import { ClaimFundStandardDataTable } from "../../_common";
import useRefundDataTableHook from "../hooks/RefundDataTableHook";

const RefundDataTable = () => {
    const { columns, getRefundMonitorData, isGetRefundLoading, pagination, setPaginated } =
        useRefundDataTableHook();
    return (
        <>
            <Grid container>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <ClaimFundStandardDataTable
                            name="refund"
                            columns={columns}
                            data={getRefundMonitorData?.data ?? []}
                            color="primary"
                            paginated={pagination}
                            setPaginated={setPaginated}
                            isLoading={isGetRefundLoading}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default RefundDataTable;