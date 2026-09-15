import { Box, Grid } from "@mui/material";
import ClaimSearchFilterForm from "../_common/ClaimSearchFilterForm";
import ClaimDetailsDataTable from "../components/ClaimDetailsDataTable";

const IncreaseLimitTransfer = () => {
    const handleSummit = () => {};
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <ClaimSearchFilterForm onSubmit={handleSummit} />
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
                        <ClaimDetailsDataTable />
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default IncreaseLimitTransfer;
