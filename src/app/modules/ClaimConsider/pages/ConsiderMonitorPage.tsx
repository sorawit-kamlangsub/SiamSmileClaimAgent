import { Grid } from "@mui/material";
import ConsiderCustomerHeader from "../components/ConsiderCustomerMonitor/ConsiderCustomerHeader";
import ConsiderCustomerMonitorFilter from "../components/ConsiderCustomerMonitor/ConsiderCustomerMonitorFilter";
import ConsiderCustomerDataTable from "../components/ConsiderCustomerMonitor/ConsiderCustomerDataTable";

const ConsiderMonitorPage = () => {
    return (
        <>
            <Grid container spacing={2} sx={{ py: 2 }}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <ConsiderCustomerHeader />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ py: 2 }}>
                    <ConsiderCustomerMonitorFilter />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ py: 2 }}>
                    <ConsiderCustomerDataTable />
                </Grid>
            </Grid>
        </>
    );
};

export default ConsiderMonitorPage;
