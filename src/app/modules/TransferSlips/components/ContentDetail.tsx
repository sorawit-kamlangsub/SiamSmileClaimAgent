import { Avatar, Box, Divider, Grid, Paper, Theme, Typography, useMediaQuery } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PortraitIcon from "@mui/icons-material/Portrait";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PrintIcon from "@mui/icons-material/Print";
import AccessTimeFilledOutlinedIcon from "@mui/icons-material/AccessTimeFilledOutlined";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import useGetPaymentDataHook from "../hooks/useGetPaymentData";
import { numberWithCommas } from "../../../functionHelpers";
import dayjs from "dayjs";

const ContentDetail = () => {
    const breakpoint = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const { data } = useGetPaymentDataHook();
    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Grid container>
                <Paper
                    elevation={3}
                    sx={{
                        m: 2,
                        p: 1,
                        overflow: "auto",
                        boxShadow: 7,
                        display: breakpoint ? "inline" : "flex",
                        width: "100%",
                        borderRadius: 5,
                    }}
                >
                    <Grid item xs={12} sm={12} md={6} lg={6} sx={{ p: breakpoint ? 2 : 3 }}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        mb: breakpoint ? 2 : 0,
                                    }}
                                >
                                    <Avatar sx={{ background: "#0458AD", boxShadow: 5, color: "#FFFFFF" }}>
                                        <AccountBalanceWalletIcon />
                                    </Avatar>
                                    <Typography sx={{ color: "#0458AD", fontWeight: "bold" }}>Account No :</Typography>
                                    <br></br>
                                    <Typography>{data?.data?.accountNo}</Typography>
                                </Box>
                                <Divider orientation="horizontal" />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        mt: breakpoint ? 2 : 0,
                                        mb: breakpoint ? 2 : 0,
                                    }}
                                >
                                    <Avatar sx={{ background: "#0458AD", boxShadow: 5, color: "#FFFFFF" }}>
                                        <PortraitIcon sx={{ fontSize: "32px" }} />
                                    </Avatar>
                                    <Typography sx={{ color: "#0458AD", fontWeight: "bold" }}>
                                        Name Mapping Account No :
                                    </Typography>
                                    <br></br>
                                    <Typography>{data?.data?.accountName}</Typography>
                                </Box>
                                <Divider orientation="horizontal" />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        mt: breakpoint ? 2 : 0,
                                        mb: breakpoint ? 2 : 0,
                                    }}
                                >
                                    <Avatar sx={{ background: "#0458AD", boxShadow: 5, color: "#FFFFFF" }}>
                                        <AccountBalanceIcon />
                                    </Avatar>
                                    <Typography sx={{ color: "#0458AD", fontWeight: "bold" }}>Bank :</Typography>
                                    <br></br>
                                    <Typography>{data?.data?.bankName}</Typography>
                                </Box>
                                <Divider orientation="horizontal" />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        mt: breakpoint ? 2 : 0,
                                        mb: breakpoint ? 2 : 0,
                                    }}
                                >
                                    <Avatar sx={{ background: "#0458AD", boxShadow: 5, color: "#FFFFFF" }}>
                                        <PaymentsIcon />
                                    </Avatar>
                                    <Typography sx={{ color: "#0458AD", fontWeight: "bold" }}>
                                        Net Transaction Amount :
                                    </Typography>
                                    <br></br>
                                    <Typography>{numberWithCommas(data?.data?.totalNetPaidAmount ?? 0)}</Typography>
                                </Box>
                                <Divider orientation="horizontal" />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Divider orientation="vertical" sx={{ display: breakpoint ? "none" : "block", mr: 2, pr: 2 }} />

                    <Grid item xs={12} sm={12} md={6} lg={6} sx={{ p: breakpoint ? 2 : 3 }}>
                        <Grid container spacing={1} sx={{ display: "flex", flexDirection: "row", height: "100%" }}>
                            <Grid item xs={12} sm={12} md={12} lg={12} sx={{ height: "50%" }}>
                                <Grid container sx={{ display: "flex", height: "100%" }}>
                                    <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={5}
                                        lg={5}
                                        sx={{ display: breakpoint ? "inline" : "flex", height: "100%" }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                width: "100%",
                                                height: "100%",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: breakpoint ? 2 : 5,
                                                    mb: breakpoint ? 2 : 0,
                                                    alignItems: breakpoint ? "" : "center",
                                                    justifyContent: breakpoint ? "" : "center",
                                                    height: "100%",
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        background: "#0458AD",
                                                        boxShadow: 5,
                                                        color: "#FFFFFF",
                                                        scale: { xs: "1", md: "1.7" },
                                                    }}
                                                >
                                                    <CalendarMonthIcon sx={{ scale: "1.1" }} />
                                                </Avatar>
                                                <Box>
                                                    <Typography
                                                        sx={{ color: "#0458AD", fontWeight: "bold", fontSize: "18px" }}
                                                    >
                                                        Debit Date :
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "16px" }}>
                                                        {data?.data?.paymentDate
                                                            ? dayjs(data?.data?.paymentDate).format("MM/DD/YYYY")
                                                            : "-"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider orientation="horizontal" sx={{ mt: "auto" }} />
                                        </Box>
                                    </Grid>

                                    <Divider
                                        orientation="vertical"
                                        sx={{ display: breakpoint ? "none" : "block", mr: 3, pr: 3 }}
                                    />

                                    <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={5}
                                        lg={5}
                                        sx={{ display: breakpoint ? "inline" : "flex", height: "100%" }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                width: "100%",
                                                height: "100%",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: breakpoint ? 2 : 5,
                                                    mt: breakpoint ? 2 : 0,
                                                    mb: breakpoint ? 2 : 0,
                                                    alignItems: breakpoint ? "" : "center",
                                                    justifyContent: breakpoint ? "" : "center",
                                                    height: "100%",
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        background: "#0458AD",
                                                        boxShadow: 5,
                                                        color: "#FFFFFF",
                                                        scale: { xs: "1", md: "1.7" },
                                                    }}
                                                >
                                                    <PrintIcon sx={{ scale: "1.2" }} />
                                                </Avatar>
                                                <Box>
                                                    <Typography
                                                        sx={{ color: "#0458AD", fontWeight: "bold", fontSize: "18px" }}
                                                    >
                                                        Print Date :
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "16px" }}>
                                                        {data?.data?.printDate
                                                            ? dayjs(data?.data?.printDate).format("DD/MM/YYYY")
                                                            : "-"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider orientation="horizontal" sx={{ mt: "auto" }} />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={12} sm={12} md={12} lg={12} sx={{ height: "50%" }}>
                                <Grid container sx={{ display: "flex", height: "100%" }}>
                                    <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={5}
                                        lg={5}
                                        sx={{ display: breakpoint ? "inline" : "flex", height: "100%" }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                width: "100%",
                                                height: "100%",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: breakpoint ? 2 : 5,
                                                    mt: breakpoint ? 2 : 0,
                                                    mb: breakpoint ? 2 : 0,
                                                    alignItems: breakpoint ? "" : "center",
                                                    justifyContent: breakpoint ? "" : "center",
                                                    height: "100%",
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        background: "#0458AD",
                                                        boxShadow: 5,
                                                        color: "#FFFFFF",
                                                        scale: { xs: "1", md: "1.7" },
                                                    }}
                                                >
                                                    <AccessTimeFilledOutlinedIcon sx={{ scale: "1.1" }} />
                                                </Avatar>
                                                <Box>
                                                    <Typography
                                                        sx={{ color: "#0458AD", fontWeight: "bold", fontSize: "18px" }}
                                                    >
                                                        Debit Time :
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "16px" }}>
                                                        {data?.data?.paymentDate
                                                            ? dayjs(data?.data?.paymentDate).format("HH:mm:ss")
                                                            : "-"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider
                                                orientation="horizontal"
                                                sx={{ display: breakpoint ? "block" : "none" }}
                                            />
                                        </Box>
                                    </Grid>

                                    <Divider
                                        orientation="vertical"
                                        sx={{ display: breakpoint ? "none" : "block", mr: 3, pr: 3 }}
                                    />

                                    <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={5}
                                        lg={5}
                                        sx={{ display: breakpoint ? "inline" : "flex", height: "100%" }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                width: "100%",
                                                height: "100%",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: breakpoint ? 2 : 5,
                                                    mt: breakpoint ? 2 : 0,
                                                    mb: breakpoint ? 2 : 0,
                                                    alignItems: breakpoint ? "" : "center",
                                                    justifyContent: breakpoint ? "" : "center",
                                                    height: "100%",
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        background: "#0458AD",
                                                        boxShadow: 5,
                                                        color: "#FFFFFF",
                                                        scale: { xs: "1", md: "1.7" },
                                                    }}
                                                >
                                                    <ViewTimelineIcon sx={{ scale: "1.1" }} />
                                                </Avatar>
                                                <Box>
                                                    <Typography
                                                        sx={{ color: "#0458AD", fontWeight: "bold", fontSize: "18px" }}
                                                    >
                                                        Print Time :
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "16px" }}>
                                                        {data?.data?.printDate
                                                            ? dayjs(data?.data?.printDate).format("HH:mm:ss")
                                                            : "-"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider
                                                orientation="horizontal"
                                                sx={{ display: breakpoint ? "block" : "none" }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Box>
    );
};

export default ContentDetail;
