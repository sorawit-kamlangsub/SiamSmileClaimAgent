import React from "react";
import { Grid } from "@mui/material";
import { monitorSelector } from "../../store/monitorSlice";
import { useAppSelector } from "../../../../../redux";
import MonitorToolbar from "../../components/Monitor/MonitorToolbar";
import MonitorTable from "../../components/Monitor/MonitorTable";
import ClaimHistoryPH from "../../components/Monitor/ClaimHistoryPH";
import ClaimHistoryPA from "../../components/Monitor/ClaimHistoryPA";

const MonitorPage: React.FC = () => {
    const { selectedPolicy } = useAppSelector(monitorSelector);
    const productName = selectedPolicy?.productName;

    return (
        <Grid container>
            <Grid item xs={12}>
                <MonitorToolbar />
            </Grid>
            <Grid item xs={12}>
                <MonitorTable />
            </Grid>
            {selectedPolicy && (
                <Grid item xs={12} mt={3}>
                    {productName === "PH" && <ClaimHistoryPH />}
                    {productName === "PA" && <ClaimHistoryPA />}
                </Grid>
            )}
        </Grid>
    );
};

export default MonitorPage;
