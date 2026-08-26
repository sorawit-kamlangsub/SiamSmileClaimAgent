import { Box, Grid } from "@mui/material";
import ClaimSearchFilterForm from "../../IncreaseLimitTransfer/_common/ClaimSearchFilterForm";
import RefundApproveDataTable from "../components/RefundApproveDataTable";

const RefundApprovePage = () => {
    const handleSearch = () => {};
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <ClaimSearchFilterForm onSubmit={handleSearch} />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <Box
                    sx={{
                        border: "1px solid #E0E0E0",
                        borderRadius: "12px",
                        padding: "20px",
                        backgroundColor: "#FFFFFF",
                    }}
                >
                    <RefundApproveDataTable />
                </Box>
            </Grid>
        </Grid>
    );
};

export default RefundApprovePage;
