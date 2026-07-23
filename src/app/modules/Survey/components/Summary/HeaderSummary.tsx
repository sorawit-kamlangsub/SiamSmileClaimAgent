import { Box, Grid, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

const HeaderSummary = () => {
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
                        variant="h4"
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            fontWeight: "bold",
                            mb: 2,
                        }}
                    >
                        ขอขอบคุณ
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ display: "flex", alignItems: "flex-start", justifyContent: "center", fontWeight: "bold" }}
                    >
                        สำหรับความคิดเห็นของคุณ
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ display: "flex", alignItems: "flex-start", justifyContent: "center", fontWeight: "bold" }}
                    >
                        สยามสไมล์จะมุ่งมั่นพัฒนาการบริการให้ดียิ่งขึ้น
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            width: "100%",
                        }}
                    >
                        <Box sx={{ flex: 1, height: "2px", backgroundColor: "#2196F3" }} />
                        <FavoriteIcon sx={{ color: "#2196F3", fontSize: "1.8rem" }} />
                        <Box sx={{ flex: 1, height: "2px", backgroundColor: "#2196F3" }} />
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default HeaderSummary;
