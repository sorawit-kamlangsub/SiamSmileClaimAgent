import { Grid, Paper, Typography } from "@mui/material";

const RecordClaimData = () => {
    return (
        <>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            รายละเอียดเคลม
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
};

export default RecordClaimData;
