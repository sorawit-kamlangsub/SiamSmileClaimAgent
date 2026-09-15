import { Button, Grid, Icon, Paper, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FormikProps } from "formik";
import { FormikCheckboxGroup, FormikTextField } from "../../_common";

type SurveyProps = {
    formik: FormikProps<any>;
    surveyQuestion: any[];
};

type SurveyRatingType = {
    surveyAnswerId: number;
    answerId?: number;
    answerDetail: string;
    color?: string;
    icon?: string;
};

const SurveyQuestions = ({ formik, surveyQuestion }: SurveyProps) => {
    const answers = surveyQuestion?.[0]?.answers?.reverse().map((item: any) => {
        return item;
    });

    const moreAnswers = surveyQuestion?.[1]?.answers?.map((item: any) => {
        return item;
    });

    const reformattedAnswers: SurveyRatingType[] = answers?.map((item: any) => {
        switch (item?.answerId) {
            case 54:
                return {
                    surveyAnswerId: item?.surveyAnswerId,
                    answerId: item?.answerId,
                    answerDetail: `ควรปรับปรุง (${item?.answerDetail})`,
                    color: "#E5544D",
                    icon: "sentiment_dissatisfied",
                };

            case 55:
                return {
                    surveyAnswerId: item?.surveyAnswerId,
                    answerId: item?.answerId,
                    answerDetail: `พอใช้ (${item?.answerDetail})`,
                    color: "#F5A623",
                    icon: "sentiment_neutral",
                };

            case 56:
                return {
                    surveyAnswerId: item?.surveyAnswerId,
                    answerId: item?.answerId,
                    answerDetail: `ปานกลาง (${item?.answerDetail})`,
                    color: "#F7C948",
                    icon: "sentiment_neutral",
                };

            case 57:
                return {
                    surveyAnswerId: item?.surveyAnswerId,
                    answerId: item?.answerId,
                    answerDetail: `ดี (${item?.answerDetail})`,
                    color: "#2196F3",
                    icon: "sentiment_satisfied",
                };

            case 58:
                return {
                    surveyAnswerId: item?.surveyAnswerId,
                    answerId: item?.answerId,
                    answerDetail: `ดีมาก (${item?.answerDetail})`,
                    color: "#4CAF50",
                    icon: "sentiment_very_satisfied",
                };
        }
    });

    const filterLowRating = reformattedAnswers.filter((item) => {
        return item.answerId === 54 || item.answerId === 55;
    });

    const handleRatingChange = (_event: React.MouseEvent<HTMLElement>, newValue: number | null) => {
        if (newValue !== null) {
            const selected = reformattedAnswers?.find((item: any) => item?.surveyAnswerId === newValue);
            formik.setFieldValue("surveyRating", newValue);
            formik.setFieldValue("surveyAnswersId", selected?.surveyAnswerId);
        }
    };

    return (
        <>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, boxShadow: 7 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <Typography sx={{ mb: 2 }}>ระดับความพึงพอใจ</Typography>

                        <ToggleButtonGroup
                            orientation="vertical"
                            value={formik.values.surveyRating}
                            exclusive
                            onChange={handleRatingChange}
                            fullWidth
                            sx={{
                                gap: 2,
                            }}
                        >
                            {reformattedAnswers?.map((item) => (
                                <ToggleButton
                                    key={item?.surveyAnswerId}
                                    value={item?.surveyAnswerId}
                                    sx={{
                                        borderRadius: "999px !important",
                                        border: `1.5px solid ${item?.color} !important`,
                                        color: item?.color,
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        justifyContent: "flex-start",
                                        gap: 1.5,
                                        py: 1.2,
                                        px: 2,
                                        "&.Mui-selected": {
                                            backgroundColor: item?.color,
                                            color: "#fff",
                                            "&:hover": {
                                                backgroundColor: item?.color,
                                                opacity: 0.9,
                                            },
                                        },
                                        "&:hover": {
                                            backgroundColor: `${item?.color}1A`, // light tint
                                        },
                                    }}
                                >
                                    <Icon style={{ fontSize: "1.6rem" }}>{item?.icon}</Icon>
                                    {item?.answerDetail}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                        {filterLowRating
                            ?.map((item: any) => item.surveyAnswerId)
                            .includes(formik.values.surveyAnswersId) && (
                            <FormikCheckboxGroup
                                formik={formik}
                                name="surveySuggestions"
                                label="ข้อเสนอแนะเพิ่มเติม"
                                data={moreAnswers}
                                valueFieldName="surveyAnswerId"
                                displayFieldName="answerDetail"
                            />
                        )}
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <FormikTextField
                            formik={formik}
                            name="remarks"
                            label="ความคิดเห็นเพิ่มเติม (ถ้ามี)"
                            placeholder="โปรดระบุความคิดเห็นเพิ่มเติม (ถ้ามี)"
                            multiline
                            rows={5}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        sx={{ display: "flex", justifyContent: "center", mt: 2 }}
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
                                formik.submitForm();
                            }}
                        >
                            <Icon sx={{ color: "#FFFFFF", transform: "rotate(335deg)" }}>send</Icon>
                            <span
                                style={{ color: "#FFFFFF", fontWeight: "bold", textTransform: "none", marginLeft: 1 }}
                            >
                                ส่งแบบประเมิน
                            </span>
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
};

export default SurveyQuestions;
