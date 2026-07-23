import { Backdrop, Box, CircularProgress, Grid, Typography } from "@mui/material";

import SurveyQuestions from "./SurveyQuestions";
import useSurveyHook from "../hooks/useSurvey.hook";
import HeaderDetailBox from "./HeaderDetailBox";

const HeaderDetailSurveyBox = () => {
    const { formik, getAnswer, surveyQuestionIsLoading, saveSurveyIsLoading } = useSurveyHook();

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mt: 2 }}>
                    {!surveyQuestionIsLoading && <SurveyQuestions formik={formik} surveyQuestion={getAnswer} />}
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mx: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        รายละเอียด:
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <HeaderDetailBox />
                </Grid>

                <Backdrop open={surveyQuestionIsLoading || saveSurveyIsLoading} style={{ zIndex: 9999 }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </Grid>
        </Box>
    );
};

export default HeaderDetailSurveyBox;
