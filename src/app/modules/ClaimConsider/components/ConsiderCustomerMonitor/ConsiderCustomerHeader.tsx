import { Grid, Paper, Skeleton } from "@mui/material";
import ConsiderCustomerHeaderCard from "../_common/ConsiderCustomerHeaderCard";
import ConsiderHospitalHeaderCard from "../_common/ConsiderHospitalHeaderCard";
import { useGetDashboardCustomerConsider } from "../../../../api/coreClaimApi";
type ConsiderCustomerHeaderProps = {
    dashboardData: ReturnType<typeof useGetDashboardCustomerConsider>["data"];
    dashboardDataLoading: boolean;
};

const ConsiderCustomerHeader = ({ dashboardData, dashboardDataLoading }: ConsiderCustomerHeaderProps) => {
    const summary = dashboardData?.data?.[0];
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            border: "1px solid #E0E0E0",
                            borderRadius: "16px",
                            padding: { xs: "10px 12px", sm: "16px 20px" },
                            height: "100%",
                        }}
                    >
                        {dashboardDataLoading ? (
                            <Skeleton variant="rounded" sx={{ height: { xs: 76, sm: 120 } }} />
                        ) : (
                            <ConsiderCustomerHeaderCard
                                totalCustomerCount={summary?.customerTotalCount}
                                pendingRecordCount={summary?.customerWaitReceiveCount}
                                pendingPaymentCount={summary?.customerWaitPaymentCount}
                                cancelledCount={summary?.customerCancelCount}
                            />
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            border: "1px solid #E0E0E0",
                            borderRadius: "16px",
                            padding: { xs: "10px 12px", sm: "16px 20px" },
                            height: "100%",
                        }}
                    >
                        {dashboardDataLoading ? (
                            <Skeleton variant="rounded" sx={{ height: { xs: 76, sm: 120 } }} />
                        ) : (
                            <ConsiderHospitalHeaderCard
                                totalHospitalClaimCount={summary?.hospitalTotalCount}
                                checkingRightsCount={summary?.hospitalCheckEligibilityCount}
                                pendingConsiderationCount={summary?.hospitalWaitConsiderCount}
                                pendingBillingCount={summary?.hospitalRequestBillingCount}
                            />
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default ConsiderCustomerHeader;
