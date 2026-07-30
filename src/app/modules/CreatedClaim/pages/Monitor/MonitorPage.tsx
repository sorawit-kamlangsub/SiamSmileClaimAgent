import React, { useEffect, useState } from "react";
import { Box, Grid, LinearProgress, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { monitorSelector, resetMonitor } from "../../store/monitorSlice";
import { useAppSelector } from "../../../../../redux";
import MonitorToolbar from "../../components/Monitor/MonitorToolbar";
import MonitorTable from "../../components/Monitor/MonitorTable";
import ClaimHistoryPH from "../../components/Monitor/ClaimHistoryPH";
import ClaimHistoryPA from "../../components/Monitor/ClaimHistoryPA";
import MonitorCard from "../../components/Monitor/MonitorCard";
import { useDispatch } from "react-redux";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { useMonitorTable } from "../../hooks/Monitor/useMonitorTable";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { RemainCreditLimit } from "../../components/Monitor/RemainCreditLimit";

type ViewMode = "card" | "table";
const MonitorPage: React.FC = () => {
    const dispatch = useDispatch();
    const toggleBtnSx = {
        "&.Mui-selected": {
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": { backgroundColor: "#024a85" },
        },
    };
    const { selectedPolicy } = useAppSelector(monitorSelector);
    const { customerDetailLoading } = useMonitorTable();
    const productTypeId = selectedPolicy?.productTypeId;
    const [view, setView] = useState<ViewMode>("table");
    useEffect(() => {
        return () => {
            dispatch(resetMonitor());
        };
    }, []);
    return (
        <Grid container>
            <Grid container justifyContent={"flex-End"} paddingTop={1} paddingBottom={3}>
                <Grid item>
                    <RemainCreditLimit />
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <MonitorToolbar />
            </Grid>
            <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mb={3}>
                    <ToggleButtonGroup value={view} exclusive onChange={(_, val) => val && setView(val)} size="small">
                        <ToggleButton value="card" sx={toggleBtnSx}>
                            <GridViewIcon fontSize="small" sx={{ mr: 0.5 }} />
                            Card View
                        </ToggleButton>
                        <ToggleButton value="table" color="primary" sx={toggleBtnSx}>
                            <TableRowsIcon fontSize="small" sx={{ mr: 0.5 }} />
                            Table View
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Grid>
            <Grid item xs={12}>
                {view === "table" ? <MonitorTable /> : <MonitorCard />}
            </Grid>
            {(selectedPolicy || customerDetailLoading) && (
                <Grid item xs={12} mt={3}>
                    {customerDetailLoading ? (
                        <>
                            <CustomPaper>
                                <LinearProgress sx={{ height: "5px" }} />
                            </CustomPaper>
                        </>
                    ) : (
                        <>
                            {productTypeId === 6 && <ClaimHistoryPH />}
                            {productTypeId === 26 && <ClaimHistoryPA />}
                        </>
                    )}
                </Grid>
            )}
        </Grid>
    );
};

export default MonitorPage;
