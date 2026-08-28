import { useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import StepToggleBar from "./SubDetailsTab/StepToggleBar";
import RecordClaimData from "./SubDetailsTab/RecordClaimData";
import { GetCustomerDetailByIdDtoResponse } from "../../../../../api/coreClaimApi.client";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import ConsiderSection from "./SubDetailsTab/ConsiderSection";

type ClaimDetailsTabProps = {
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
};
const ClaimDetailsTab = ({ customerDetail }: ClaimDetailsTabProps) => {
    const steps = [{ label: "บันทึกข้อมูลเคลม" }, { label: "รายละเอียดค่าใช้จ่าย" }, { label: "สรุปรายการเคลม" }];
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);

    const isLastStep = activeStep === steps.length - 1;

    const handleNext = () => {
        const next = Math.min(activeStep + 1, steps.length - 1);
        setActiveStep(next);
        setFurthestStep((prev) => Math.max(prev, next));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSaveDraft = () => {
        // TODO: บันทึกแบบร่าง (ไม่ validate เต็มรูปแบบ)
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
                                    <RecordClaimData />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <DocumentScanTable
                                        productTypeId={customerDetail?.productTypeId ?? 0}
                                        Header="สแกนเอกสาร"
                                        aplicationCode={customerDetail?.policyCode ?? ""}
                                        documentType="เอกสารประกอบการพิจารณาเคลม"
                                    />
                                </Grid>
                            </Grid>
                        </div>
                    )}
                    {activeStep === 1 && <div>{/* ฟอร์มรายละเอียดค่าใช้จ่าย */}</div>}
                    {activeStep === 2 && <div>{/* สรุปรายการเคลม */}</div>}
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <ConsiderSection
                            productId={customerDetail?.productTypeId}
                            aplicationCode={customerDetail?.policyCode ?? ""}
                        />
                    </Grid>
                </Box>

                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                            disabled={activeStep === 0}
                        >
                            กลับ
                        </Button>
                    </Grid>

                    <Grid item>
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <Button variant="outlined" startIcon={<SaveAsIcon />} onClick={handleSaveDraft}>
                                บันทึกแบบร่าง
                            </Button>

                            {!isLastStep && (
                                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}>
                                    ถัดไป
                                </Button>
                            )}

                            {isLastStep && (
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleFinish}
                                    sx={{
                                        bgcolor: "#2E7D32",
                                        "&:hover": { bgcolor: "#1B5E20" },
                                    }}
                                >
                                    ยืนยันบันทึกผลพิจารณา
                                </Button>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default ClaimDetailsTab;
