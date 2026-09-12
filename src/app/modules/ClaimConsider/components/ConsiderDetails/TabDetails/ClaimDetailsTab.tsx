import { Alert, AlertTitle, Box, Button, Grid, Snackbar } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import StepToggleBar from "./SubDetailsTab/StepToggleBar";
import RecordClaimData from "./SubDetailsTab/RecordClaimData";
import DraftViewingBanner from "./SubDetailsTab/DraftViewingBanner";
import ContinuousClaimBanner from "../../ConsiderHospitalDetails/SubDetailsTab/ContinuousClaimBanner";
import {
    GetClaimDetailConsiderDtoResponse,
    GetCustomerDetailByIdDtoResponse,
} from "../../../../../api/coreClaimApi.client";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import ConsiderSection from "./SubDetailsTab/ConsiderSection";
import LoadingOverlay from "../../../../_common/components/CustomComponent/LoadingOverlay";
import ExpenseDetails from "./SubDetailsTab/ExpenseDetails";
import useClaimDetailActionHook from "../../../hooks/ClaimConsiderDetail/ClaimDetailActionHook";
import useConsiderDetailHook from "../../../hooks/ClaimConsiderDetail/ConsiderDetailHook";
import { FormikProvider } from "formik";
import ClaimSummary from "./SubDetailsTab/ClaimSummary";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { claimConsiderSelector, resetState } from "../../../store/claimConsiderSlice";
import useClaimStepCalculateHook from "../../../hooks/ClaimConsiderDetail/ClaimStepCalculateHook";
import ConfirmApproveClaimDialog from "./ConfirmApproveClaimDialog";
import { swalSuccess } from "../../../../_common";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/** หน้ารายการเคลมลูกค้า — path แม่ /consider/monitor เป็น Outlet เปล่า ต้องระบุ child customers */
const CONSIDER_MONITOR_PATH = "/consider/monitor";

type ClaimDetailsTabProps = {
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
    detail: GetClaimDetailConsiderDtoResponse | undefined;
};
const ClaimDetailsTab = ({ customerDetail, detail }: ClaimDetailsTabProps) => {
    const steps = [{ label: "บันทึกข้อมูลเคลม" }, { label: "รายละเอียดค่าใช้จ่าย" }, { label: "สรุปรายการเคลม" }];
    const [isCombinedWithMedicalAll, setIsCombinedWithMedicalAll] = useState(false);
    /** Modal "ยืนยันอนุมัติรายการ" ก่อนยิง /claim/decision/approve */
    const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
    /** มีค่า = แสดง toast อนุมัติสำเร็จ (เก็บเลขที่ Claim/Case ที่ได้จาก response) */
    const [approveResult, setApproveResult] = useState<{ claimNo?: string; caseNo?: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    /** ปิดงานบนหน้านี้แล้วกลับไปหน้ารายการ — ล้าง state ที่ค้างไว้ก่อนออกเสมอ ไม่ให้รั่วไปเคสถัดไป */
    const leaveToMonitor = () => {
        dispatch(resetState());
        navigate(`${CONSIDER_MONITOR_PATH}`);
    };

    /** ปิด toast อนุมัติ (หมดเวลาเอง หรือกดกากบาท) = รับทราบผลแล้ว → กลับหน้ารายการ */
    const handleApproveToastClose = () => {
        setApproveResult(undefined);
        leaveToMonitor();
    };

    const considerDetail = useConsiderDetailHook({ enableDraftOverlay: true });
    const {
        formik,
        incidentType,
        incidentTypeLoading,
        coverageType,
        medicalType,
        incidentTypeMappingLoading,
        isStep1Loading,
        decisionReason,
        decisionReasonLoading,
        attachedDocuments,
        setAttachedDocuments,
        continuousClaimRows,
        continuousClaimOpen,
        setContinuousClaimOpen,
        handleToggleContinuousClaim,
        handleSelectContinuousClaim,
        handleClearContinuousClaim,
    } = considerDetail;
    const { handleSaveDraft, handleConfirmConsider, handleApprove, isApproving } = useClaimDetailActionHook({
        ...considerDetail,
        isCombinedWithMedicalAll,
        // BE ตอบ isSuccess=false โดยไม่ throw จึงต้องขึ้น toast จาก callback นี้ ไม่ใช่หลัง await handleApprove
        onApproveSuccess: (response) => {
            setConfirmApproveOpen(false);
            setApproveResult({
                claimNo: response.data?.claimNo ?? detail?.claimNo,
                caseNo: response.data?.caseNo ?? detail?.caseNo,
            });
        },
        // swalSuccess ไม่ได้ปิด allowOutsideClick — คลิกนอกกล่องก็ถือว่าจบงานแล้ว จึงไม่เช็ค isConfirmed
        onConfirmConsiderSuccess: () => {
            swalSuccess("บันทึกผลพิจารณาสำเร็จ", "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว").then(() =>
                leaveToMonitor()
            );
        },
    });
    const continuousClaim = formik.values.continuousClaim;

    const { filledItems, calculateResult } = useAppSelector(claimConsiderSelector);
    const { activeStep, setActiveStep, isLastStep, isCalculating, handleNext, handleBack } = useClaimStepCalculateHook({
        formik,
        customerDetail,
        filledItems,
        stepsLength: steps.length,
        paymentAmount: detail?.paymentAmount,
    });
    return (
        <>
            <FormikProvider value={formik}>
                <Box>
                    <StepToggleBar
                        steps={steps}
                        activeStep={activeStep}
                        onStepChange={setActiveStep}
                        // มีปุ่ม "ย้อนกลับ"/"ถัดไป" ด้านล่างควบคุม step อยู่แล้ว แถบนี้ให้เป็นแค่ progress
                        // indicator ไม่ต้องกดข้าม step เองได้
                        isStepClickable={() => false}
                    />

                    <Box sx={{ marginTop: "20px" }}>
                        <DraftViewingBanner />
                        {activeStep === 0 && (
                            <LoadingOverlay isLoading={isStep1Loading} message="กำลังโหลดข้อมูลเคลม...">
                                <Grid container spacing={2}>
                                    {continuousClaim && (
                                        <Grid item xs={12}>
                                            <ContinuousClaimBanner
                                                claim={continuousClaim}
                                                currentCaseNo={detail?.caseNo ?? ""}
                                                currentCaseStatus={detail?.claimStatusName ?? undefined}
                                                title="พิจารณาเคลมต่อเนื่อง - เคลมลูกค้า"
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12} sm={12} md={12} lg={12}>
                                        <RecordClaimData
                                            incidentType={incidentType}
                                            incidentTypeLoading={incidentTypeLoading}
                                            coverageType={coverageType}
                                            causeOfIncident={[]}
                                            medicalType={medicalType}
                                            incidentTypeMappingLoading={incidentTypeMappingLoading}
                                            continuousClaimRows={continuousClaimRows}
                                            continuousClaimOpen={continuousClaimOpen}
                                            onContinuousClaimOpenChange={setContinuousClaimOpen}
                                            onContinuousClaimToggle={handleToggleContinuousClaim}
                                            onContinuousClaimSelect={handleSelectContinuousClaim}
                                            onContinuousClaimClear={handleClearContinuousClaim}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={12} lg={12}>
                                        <DocumentScanTable
                                            productTypeId={customerDetail?.productTypeId ?? 0}
                                            Header="สแกนเอกสาร"
                                            aplicationCode={customerDetail?.policyCode ?? ""}
                                            documentType="เอกสารประกอบการพิจารณาเคลม"
                                            caseId={detail?.caseId}
                                            claimSourceId={detail?.claimSourceId}
                                            onAttachedDocumentsChange={setAttachedDocuments}
                                        />
                                    </Grid>
                                </Grid>
                            </LoadingOverlay>
                        )}
                        {activeStep === 1 && (
                            <div>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={12} lg={12}>
                                        <ExpenseDetails
                                            formik={formik}
                                            detailData={considerDetail.detailData}
                                            customerDetailData={considerDetail.customerDetailData}
                                        />
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                        {activeStep === 2 && (
                            <div>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={12} lg={12}>
                                        <ClaimSummary
                                            attachedDocuments={attachedDocuments}
                                            createdClaimDate={detail?.createdDate}
                                            isCombinedWithMedicalAll={isCombinedWithMedicalAll}
                                            onCombinedWithMedicalAllChange={setIsCombinedWithMedicalAll}
                                        />
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                        {!isLastStep && (
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <ConsiderSection
                                    productId={customerDetail?.productTypeId}
                                    aplicationCode={customerDetail?.policyCode ?? ""}
                                    decisionReason={decisionReason}
                                    decisionReasonLoading={decisionReasonLoading}
                                />
                            </Grid>
                        )}
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
                                {!isLastStep && (
                                    <>
                                        <Button variant="outlined" startIcon={<SaveAsIcon />} onClick={handleSaveDraft}>
                                            บันทึกแบบร่าง
                                        </Button>

                                        <Button
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            disabled={
                                                !formik.values.considerResult ||
                                                !formik.values.decisionReasonId ||
                                                !formik.values.decisionReasonDetail
                                            }
                                            onClick={() => handleConfirmConsider()}
                                            sx={{
                                                bgcolor: "#2E7D32",
                                                "&:hover": { bgcolor: "#1B5E20" },
                                            }}
                                        >
                                            ยืนยันบันทึกผลพิจารณา
                                        </Button>
                                        <Button
                                            variant="contained"
                                            endIcon={<ArrowForwardIcon />}
                                            onClick={handleNext}
                                            disabled={activeStep === 1 && isCalculating}
                                        >
                                            ถัดไป
                                        </Button>
                                    </>
                                )}

                                {isLastStep && (
                                    <Button
                                        variant="contained"
                                        startIcon={<CheckCircleIcon />}
                                        sx={{
                                            bgcolor: "#2E7D32",
                                            "&:hover": { bgcolor: "#1B5E20" },
                                        }}
                                        onClick={() => setConfirmApproveOpen(true)}
                                    >
                                        อนุมัติ
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </FormikProvider>

            <ConfirmApproveClaimDialog
                open={confirmApproveOpen}
                onClose={() => setConfirmApproveOpen(false)}
                onConfirm={handleApprove}
                claimNo={detail?.claimNo}
                caseNo={detail?.caseNo}
                approvedAmount={calculateResult?.medicalPay ?? 0}
                isLoading={isApproving}
            />

            <Snackbar
                open={!!approveResult}
                autoHideDuration={3000}
                onClose={(_event, reason) => {
                    // คลิกที่อื่นระหว่าง toast ยังอยู่ = ทำงานต่อบนหน้าจอ ไม่ใช่การปิด (spec ห้าม block)
                    if (reason === "clickaway") return;
                    handleApproveToastClose();
                }}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    icon={<CheckCircleIcon fontSize="inherit" />}
                    severity="success"
                    variant="outlined"
                    onClose={handleApproveToastClose}
                    sx={{ bgcolor: "#E8F5E9", borderColor: "#A5D6A7", color: "#1B5E20", boxShadow: 3 }}
                >
                    <AlertTitle sx={{ fontWeight: 700 }}>อนุมัติรายการสำเร็จ</AlertTitle>
                    <Box>
                        เลขที่ Claim : <b>{approveResult?.claimNo ?? "-"}</b>
                    </Box>
                    <Box>
                        เลขที่ Case : <b>{approveResult?.caseNo ?? "-"}</b>
                    </Box>
                </Alert>
            </Snackbar>
        </>
    );
};

export default ClaimDetailsTab;
