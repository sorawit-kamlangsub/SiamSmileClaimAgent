import { Avatar, Backdrop, Box, CircularProgress, Divider, Grid, Paper, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

import SurveyQuestions from "./SurveyQuestions";
import useSurveyHook from "../hooks/useSurvey.hook";
import HeaderDetailBox from "./HeaderDetailBox";
import dayjs from "dayjs";
import { numberWithCommas } from "../../../functionHelpers";

const HeaderDetailSurveyBox = () => {
    const {
        formik,
        getAnswer,
        paymentDetailsData,
        surveyQuestionIsLoading,
        saveSurveyIsLoading,
        paymentDetailsIsLoading,
    } = useSurveyHook();

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ my: 1 }}>
                    <Paper
                        elevation={2}
                        sx={{ background: "#F5F9FF", display: "flex", p: 2, borderRadius: 3, boxShadow: 7 }}
                    >
                        <Grid container spacing={2} sx={{ py: 2 }}>
                            <Grid item xs={1}></Grid>
                            <Grid item xs={2} sm={2} md={2} lg={2}>
                                <PersonIcon sx={{ mt: 1.5, scale: 1.7, color: "#01579B" }} />
                            </Grid>
                            <Grid item xs={9} sm={9} md={9} lg={9} sx={{ pl: 4 }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                    ผู้ให้บริการ
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                    {paymentDetailsData?.data?.employee ?? "-"}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mt: 2 }}>
                    {!surveyQuestionIsLoading && <SurveyQuestions formik={formik} surveyQuestion={getAnswer} />}
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mx: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        รายละเอียด:
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <HeaderDetailBox
                        countItem={paymentDetailsData?.data?.countItem}
                        paymentDate={paymentDetailsData?.data?.paymentDate}
                        totalNetPaidAmount={paymentDetailsData?.data?.totalNetPaidAmount}
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
                                    {paymentDetailsData?.data?.customerName ?? "-"}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#797b7e" }}>
                                    วันที่เข้า รพ.:{" "}
                                    {paymentDetailsData?.data?.admissionDate
                                        ? dayjs(paymentDetailsData?.data?.admissionDate).format("DD/MM/YYYY")
                                        : "-"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "end" }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#01579B" }}>
                                    {numberWithCommas(paymentDetailsData?.data?.totalNetPaidAmount ?? 0)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Backdrop
                    open={surveyQuestionIsLoading || saveSurveyIsLoading || paymentDetailsIsLoading}
                    style={{ zIndex: 9999 }}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            </Grid>
        </Box>
    );
};

export default HeaderDetailSurveyBox;
