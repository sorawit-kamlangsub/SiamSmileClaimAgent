import { Grid, Theme, Typography, useMediaQuery } from "@mui/material";

const HeaderSlip = () => {
    const breakpoint = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: breakpoint ? "center" : "left" }}>
                    <img src="/Logo.png" alt="Logo" style={{ maxWidth: "150px", height: "auto" }} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "center" }}>
                    <Typography variant="h5" sx={{ color: "#0458AD" }}>
                        Payment Detail Complete Transaction Report
                    </Typography>
                </Grid>
            </Grid>
        </>
    );
};

export default HeaderSlip;
