import { useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import StepToggleBar from "./SubDetailsTab/StepToggleBar";
import RecordClaimData from "./SubDetailsTab/RecordClaimData";

const ClaimDetailsTab = () => {
    const steps = [{ label: "บันทึกข้อมูลเคลม" }, { label: "รายละเอียดค่าใช้จ่าย" }, { label: "สรุปรายการเคลม" }];
    const [activeStep, setActiveStep] = useState(0);
    // Furthest step the user has unlocked by successfully completing the
    // one before it — drives which step headers are clickable.
    const [furthestStep, setFurthestStep] = useState(0);

    const isLastStep = activeStep === steps.length - 1;

    const handleNext = () => {
        // TODO: run this step's formik validation / submit before advancing.
        // e.g. const errors = await formik.validateForm();
        //      if (Object.keys(errors).length > 0) return;

        const next = Math.min(activeStep + 1, steps.length - 1);
        setActiveStep(next);
        setFurthestStep((prev) => Math.max(prev, next));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleFinish = () => {
        // TODO: final submit
    };

    return (
        <>
            <Box>
                <StepToggleBar
                    steps={steps}
                    activeStep={activeStep}
                    onStepChange={setActiveStep}
                    isStepClickable={(index) => index <= furthestStep}
                />

                <Box sx={{ marginTop: "20px" }}>
                    {activeStep === 0 && (
                        <div>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <Box
                                        sx={{
                                            backgroundColor: "#EAF4FC",
                                            borderLeft: "4px solid #1565C0",
                                            borderRadius: "4px",
                                            padding: "12px 16px",
                                            p: 1,
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                            บันทึกข้อมูลเคลม
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <RecordClaimData />
                                </Grid>
                            </Grid>
                        </div>
                    )}
                    {activeStep === 1 && <div>{/* ฟอร์มรายละเอียดค่าใช้จ่าย */}</div>}
                    {activeStep === 2 && <div>{/* สรุปรายการเคลม */}</div>}
                </Box>

                <Grid container justifyContent="space-between" sx={{ marginTop: "24px" }}>
                    <Grid item>
                        <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0}>
                            ย้อนกลับ
                        </Button>
                    </Grid>
                    <Grid item>
                        {isLastStep ? (
                            <Button variant="contained" onClick={handleFinish}>
                                ยืนยัน
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={handleNext}>
                                ถัดไป
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default ClaimDetailsTab;
