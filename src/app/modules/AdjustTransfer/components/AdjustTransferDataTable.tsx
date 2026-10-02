import { Grid, Paper } from "@mui/material";
import { StandardDataTable } from "../../_common";
import useAdjustTransferDataTableHook from "../hooks/AdjustTransferDataTableHook";

const AdjustTransferDataTable = () => {
    const { columns, getClaimAdjustMonitorData, isGetClaimAdjustLoading, pagination, setPaginated } =
        useAdjustTransferDataTableHook();

    return (
        <>
            <Grid container>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <StandardDataTable
                            name="refund"
                            columns={columns}
                            data={getClaimAdjustMonitorData?.data ?? []}
                            color="primary"
                            paginated={pagination}
                            setPaginated={setPaginated}
                            isLoading={isGetClaimAdjustLoading}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default AdjustTransferDataTable;
