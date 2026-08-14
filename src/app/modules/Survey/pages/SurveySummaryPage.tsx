import { Avatar, Box, Button, Divider, Grid, Paper, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BackgroundM from "../../../../../public/BackgroundM.png";
import HeaderDetailBox from "../components/HeaderDetailBox";
import HeaderSummary from "../components/Summary/HeaderSummary";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPaymentDetails } from "../surveyAPI";
import dayjs from "dayjs";
import { numberWithCommas } from "../../../functionHelpers";

const PdfFileIcon = ({ size = 40 }: { size?: number }) => (
    <svg width={size} height={size * 0.75} viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M0 0 H90 L130 40 V220 Q130 230 120 230 H10 Q0 230 0 220 V10 Q0 0 10 0 Z"
            fill="#FFF"
            transform="scale(0.6)"
        />
        <path d="M90 0 L130 40 H100 Q90 40 90 30 Z" fill="#FFF" transform="scale(0.6)" />
        <rect x="10" y="150" width="110" height="46" rx="4" fill="#E53935" transform="scale(0.6)" />
        <text x="65" y="180" textAnchor="middle" fontSize="26" fontWeight="700" fill="#fff" transform="scale(0.6)">
            PDF
        </text>
    </svg>
);

const SurveySummaryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data } = useGetPaymentDetails(id);

    return (
        <Box
            sx={(theme) => ({
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100vh",
                zIndex: theme.zIndex.drawer + 2,
                backgroundImage: `url(${BackgroundM})`,
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
                <Box>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mx: 2, pb: 7 }}>
                        <HeaderSummary />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <HeaderDetailBox
                            countItem={data?.data?.countItem}
                            paymentDate={data?.data?.paymentDate}
                            totalNetPaidAmount={data?.data?.totalNetPaidAmount}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mt: 2 }}>
                        <Paper
                            elevation={2}
                            sx={{ background: "#F5F9FF", display: "flex", p: 2, borderRadius: 3, boxShadow: 7 }}
                        >
                            <Grid container spacing={2} sx={{ py: 2 }}>
                                <Grid item xs={1}></Grid>
                                <Grid item xs={2} sm={2} md={2} lg={2}>
                                    <Avatar
                                        sx={{
                                            background: "#E4F0FE",
                                            boxShadow: 5,
                                            color: "#0458AD",
                                            scale: { xs: "1", md: "1.7" },
                                        }}
                                    >
                                        <PersonIcon sx={{ scale: "1.1", color: "#01579B" }} />
                                    </Avatar>
                                </Grid>
                                <Grid item xs={9} sm={9} md={9} lg={9} sx={{ whiteSpace: "pre-line" }}>
                                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                        {data?.data?.customerName ?? "-"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#797b7e" }}>
                                        วันที่เข้า รพ.:{" "}
                                        {data?.data?.admissionDate
                                            ? dayjs(data?.data?.admissionDate).format("DD/MM/YYYY")
                                            : "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <Divider />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "end" }}>
                                    <Typography variant="body1" sx={{ fontWeight: "bold", color: "#01579B" }}>
                                        {numberWithCommas(data?.data?.totalNetPaidAmount ?? 0)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        sx={{ mt: 5, display: "flex", justifyContent: "center" }}
                    >
                        <Button
                            variant="contained"
                            sx={{
                                p: 0.7,
                                width: "45%",
                                background:
                                    "linear-gradient(to right, #086acc 0%, #157CD9 35%, #2B96EC 70%, #29ABE2 95%)",
                            }}
                            onClick={() => {
                                navigate(`/slip/${id}`);
                            }}
                        >
                            <PdfFileIcon size={30} />
                            <span
                                style={{ color: "#FFFFFF", fontWeight: "bold", textTransform: "none", marginLeft: 1 }}
                            >
                                ใบสรุปแจ้งการโอนเงิน
                            </span>
                        </Button>
                    </Grid>
                </Box>
            </Grid>
        </Box>
    );
};

export default SurveySummaryPage;
