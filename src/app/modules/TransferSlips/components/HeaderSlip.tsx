import { Avatar, Grid, Theme, Typography, useMediaQuery } from "@mui/material";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import useGetPaymentDataHook from "../hooks/useGetPaymentData";

const HeaderSlip = () => {
    const breakpoint = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const { data } = useGetPaymentDataHook();
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: breakpoint ? "center" : "left" }}>
                    <img src="/Logo.png" alt="Logo" style={{ maxWidth: "150px", height: "auto" }} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ display: "flex", justifyContent: "center" }}>
                    <Avatar
                        sx={{ background: "#0458AD", boxShadow: 5, color: "#FFFFFF", scale: { xs: "1.5", md: "1.7" } }}
                    >
                        <RequestQuoteRoundedIcon sx={{ scale: "1.17" }} />
                    </Avatar>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "center" }}>
                    <Typography variant="h5" sx={{ color: "#0458AD" }}>
                        Payment Detail Complete Transaction Report
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "center" }}>
                    <Typography variant="h5" sx={{ color: "#0458AD", fontWeight: "bold" }}>
                        {data?.data?.paymentCode ?? "-"}
                    </Typography>
                </Grid>
            </Grid>
        </>
    );
};

export default HeaderSlip;
