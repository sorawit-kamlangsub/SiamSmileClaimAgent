import { Box, Grid, Typography } from "@mui/material";

const HeaderSurvey = () => {
    return (
        <>
            <Grid container spacing={2} sx={{ pt: 4 }}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                        <img src="/Logo.png" alt="Logo" style={{ maxWidth: "300px", height: "auto" }} />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Typography
                        variant="body1"
                        sx={{ display: "flex", alignItems: "flex-start", justifyContent: "center", fontWeight: "bold" }}
                    >
                        แบบประเมินความพึงพอใจการให้บริการครั้งนี้
                    </Typography>
                </Grid>
            </Grid>
        </>
    );
};

export default HeaderSurvey;
