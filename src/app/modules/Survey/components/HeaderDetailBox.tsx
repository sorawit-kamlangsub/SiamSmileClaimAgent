import { Avatar, Box, Divider, Grid, Paper, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ListIcon from "@mui/icons-material/List";
import dayjs, { Dayjs } from "dayjs";
import { numberWithCommas } from "../../../functionHelpers";

type paymentDetails = {
    paymentDate: Dayjs | undefined;
    countItem: number | undefined;
    totalNetPaidAmount: number | undefined;
};

const HeaderDetailBox = ({ countItem, paymentDate, totalNetPaidAmount }: paymentDetails) => {
    return (
        <Paper elevation={2} sx={{ background: "#F5F9FF", display: "flex", p: 2, borderRadius: 3, boxShadow: 7 }}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <Box>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ pb: 1 }}>
                            <Grid container>
                                <Grid item xs={2} sm={2} md={2} lg={2} sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar
                                        sx={{
                                            background: "#E4F0FE",
                                            boxShadow: 5,
                                            color: "#0458AD",
                                            scale: { xs: "1", md: "1.7" },
                                        }}
                                    >
                                        <CalendarMonthIcon sx={{ scale: "1.1" }} />
                                    </Avatar>
                                </Grid>
                                <Grid item xs={10} sm={10} md={10} lg={10}>
                                    <Typography sx={{ color: "#797b7e" }}>วันที่โอนเงิน:</Typography>
                                    <Typography>
                                        {paymentDate ? dayjs(paymentDate).format("DD/MM/YYYY") : "-"}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider orientation="horizontal" sx={{ mt: 2 }} />
                        </Grid>
                        <Grid item xs={5.5} sm={5.5} md={5.5} lg={5.5}>
                            <Grid container>
                                <Grid item xs={4} sm={4} md={4} lg={4} sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar
                                        sx={{
                                            background: "#E4F0FE",
                                            boxShadow: 5,
                                            color: "#0458AD",
                                            scale: { xs: "1", md: "1.7" },
                                        }}
                                    >
                                        <ListIcon sx={{ scale: "1.1" }} />
                                    </Avatar>
                                </Grid>
                                <Grid item xs={8} sm={8} md={8} lg={8}>
                                    <Typography sx={{ color: "#797b7e" }}>จำนวนรายการ</Typography>
                                    <Typography>{countItem ?? 0} รายการ</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid
                            item
                            xs={1}
                            sm={1}
                            md={1}
                            lg={1}
                            sx={{ display: "flex", justifyContent: "center", px: 1 }}
                        >
                            <Divider orientation="vertical" sx={{}} />
                        </Grid>
                        <Grid item xs={5.5} sm={5.5} md={5.5} lg={5.5}>
                            <Grid container>
                                <Grid item xs={4} sm={4} md={4} lg={4} sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar
                                        sx={{
                                            background: "#E4F0FE",
                                            boxShadow: 5,
                                            color: "#0458AD",
                                            scale: { xs: "1", md: "1.7" },
                                        }}
                                    >
                                        <AccountBalanceWalletIcon sx={{ scale: "1.1" }} />
                                    </Avatar>
                                </Grid>
                                <Grid item xs={8} sm={8} md={8} lg={8}>
                                    <Typography sx={{ color: "#797b7e" }}>จำนวนเงินรวม</Typography>
                                    <Typography>{numberWithCommas(totalNetPaidAmount ?? 0)} บาท</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
        </Paper>
    );
};

export default HeaderDetailBox;
