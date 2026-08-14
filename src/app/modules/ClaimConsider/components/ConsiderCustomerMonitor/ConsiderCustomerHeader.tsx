import { Grid, Paper } from "@mui/material";
import ConsiderCustomerHeaderCard from "../_common/ConsiderCustomerHeaderCard";
import ConsiderHospitalHeaderCard from "../_common/ConsiderHospitalHeaderCard";

const ConsiderCustomerHeader = () => {
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            border: "1px solid #E0E0E0",
                            borderRadius: "16px",
                            padding: "16px 20px",
                            height: "100%",
                        }}
                    >
                        <ConsiderCustomerHeaderCard />
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            border: "1px solid #E0E0E0",
                            borderRadius: "16px",
                            padding: "16px 20px",
                            height: "100%",
                        }}
                    >
                        <ConsiderHospitalHeaderCard />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default ConsiderCustomerHeader;
