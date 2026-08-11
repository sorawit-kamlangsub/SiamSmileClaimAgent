import { Grid, Paper } from "@mui/material";

const ConsiderCustomerHeaderCard = () => {
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Paper elevation={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={6}></Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6}></Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Paper elevation={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={6}></Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6}></Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default ConsiderCustomerHeaderCard;
