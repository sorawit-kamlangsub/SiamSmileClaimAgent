import { Box, Grid, Paper } from "@mui/material";
import HeaderSlip from "../components/HeaderSlip";
import BackgroundBlue from "../../../../../public/BackgroundBlue.png";
import FooterSlip from "../components/FooterSlip";
import { useEffect } from "react";
import ContentDetail from "../components/ContentDetail";
import PaymentDataTable from "../components/PaymentDataTable";

const TransferSlipPage = () => {
    useEffect(() => {
        const prevHtml = document.documentElement.style.overflow;
        const prevBody = document.body.style.overflow;
        const isMobile = window.innerWidth < 600;
        if (!isMobile) {
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.documentElement.style.overflow = prevHtml;
            document.body.style.overflow = prevBody;
        };
    }, []);

    return (
        <Box
            sx={(theme) => ({
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100vh",
                zIndex: theme.zIndex.drawer + 2,
                backgroundImage: `url(${BackgroundBlue})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                margin: 0,
                padding: 3,
                boxSizing: "border-box",
                overflow: { xs: "auto", sm: "auto", md: "hidden" },
            })}
        >
            <Grid container>
                <Box sx={{ width: "100%", display: "flex", height: { xs: "auto", md: "93%" } }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            m: 1,
                            boxShadow: 6,
                            overflow: "auto",
                            borderRadius: 5,
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                        }}
                    >
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <HeaderSlip />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <ContentDetail />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <PaymentDataTable />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
                <Box></Box>
                <Box sx={{ width: "100%", display: "flex", height: { xs: "auto", md: "7%" } }}>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ display: "inline-flex" }}>
                        <FooterSlip />
                    </Grid>
                </Box>
            </Grid>
        </Box>
    );
};

export default TransferSlipPage;
