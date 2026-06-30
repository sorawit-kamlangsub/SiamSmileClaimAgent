import React from "react";
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    FormControlLabel,
    Grid,
    InputAdornment,
    Paper,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { useClaimPHForm } from "../../../hooks/CreateClaim/ClaimPH/useClaimPHForm";
import { FormikDropdown, FormikTextField, FormikTextNumber } from "../../../../_common";
import FormikDatePicker from "../../../../_common/components/CustomFormik/FormikDatePicker";
import ArticleIcon from "@mui/icons-material/Article";
import CoverageBox from "./CoverageBox";
import { IPD_COVERAGE_ITEMS, OPD_COVERAGE_ITEMS } from "../../../store/mockClaimPH";
import CalculateIcon from "@mui/icons-material/Calculate";
import DocumentRecipientTypeDropDown from "../../../../_common/components/ClaimAgent/CustomDropdown/DocumentRecipientTypeDropDown";
import UserAutocompleteApi from "../../../../_common/components/ClaimAgent/CustomDropdown/UserAutocompleteApi";
import ChiefComplaintAutocomplete from "../../../../_common/components/ClaimAgent/CustomDropdown/ChiefComplaintAutocomplete";
import dayjs from "dayjs";
import ClaimTypeSelector from "../ClaimTypeSelector";
import ChipSelector from "../ChipSelector";
import OcrDocumentScanSection from "./OcrDocumentScanSection";
import UploadFileSharpIcon from "@mui/icons-material/UploadFileSharp";

// // ─── Claim type constants ─────────────────────────────────────────────────────
// const CLAIM_TYPE = {
//     IPD: 2,
//     OPD: 3,
//     DAY_SURGERY: 4,
//     DEATH_CASE: 5,
//     DISABILITY: 6,
// } as const;

// const OPD_SUB_TYPE = {
//     ILLNESS: 2,
//     ACCIDENT: 3,
// } as const;

// const IPD_SUB_TYPE = {
//     ILLNESS: 2,
//     ACCIDENT: 3,
// } as const;

// const CLAIM_TYPE_LABEL: Record<number, string> = {
//     [CLAIM_TYPE.IPD]: "IPD",
//     [CLAIM_TYPE.OPD]: "OPD",
//     [CLAIM_TYPE.DAY_SURGERY]: "Day Case Surgery",
//     [CLAIM_TYPE.DEATH_CASE]: "DeathClaim",
//     [CLAIM_TYPE.DISABILITY]: "สูญเสียอวัยวะ / ทุพพลภาพ",
// };

// const OPD_SUB_TYPE_LABEL: Record<number, string> = {
//     [OPD_SUB_TYPE.ILLNESS]: "โรคทั่วไป",
//     [OPD_SUB_TYPE.ACCIDENT]: "อุบัติเหตุ",
// };

// const IPD_SUB_TYPE_LABEL: Record<number, string> = {
//     [IPD_SUB_TYPE.ILLNESS]: "โรคทั่วไป",
//     [IPD_SUB_TYPE.ACCIDENT]: "อุบัติเหตุ",
// };

interface Props {
    onNext: () => void;
}

const ClaimFormSection: React.FC<Props> = ({ onNext }) => {
    const {
        formik,
        incidentType,
        coverageType,
        medicalType,
        causeOfAccident,
        zebraCarOwner,
        incidentTypeLoading,
        coverageTypeLoading,
        medicalTypeLoading,
        causeOfAccidentLoading,
        zebraCarOwnerLoading,
    } = useClaimPHForm({ onNext });
    const { values, errors, touched, setFieldValue } = formik;
    const isMedicalLoading = medicalTypeLoading || causeOfAccidentLoading;

    const handleSubmit = async () => {
        const errs = await formik.validateForm();
        if (Object.keys(errs).length > 0) {
            await formik.setTouched(Object.keys(errs).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
            return;
        }
        formik.submitForm();
    };

    return (
        <>
            <Backdrop open={formik.isSubmitting} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <CustomPaper>
                <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="บันทึกข้อมูลเคลม" color="blue" />
                <Box component="form" onSubmit={formik.handleSubmit} p={2}>
                    <CustomPaper>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Typography fontWeight={600} fontSize={16}>
                                        เหตุของการเคลม
                                        <Typography component="span" color="error">
                                            {" "}
                                            *
                                        </Typography>
                                    </Typography>
                                </Box>
                                <ClaimTypeSelector
                                    formik={formik}
                                    options={incidentType}
                                    idFieldName="incidentTypeId"
                                    nameFieldName="incidentTypeName"
                                    isLoading={incidentTypeLoading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Typography fontWeight={600} fontSize={16}>
                                        ประเภทความคุ้มครอง
                                        <Typography component="span" color="error">
                                            {" "}
                                            *
                                        </Typography>
                                    </Typography>
                                </Box>
                                {values.incidentTypeId ? (
                                    <ClaimTypeSelector
                                        formik={formik}
                                        options={coverageType}
                                        idFieldName="coverageTypeId"
                                        nameFieldName="coverageTypeName"
                                        isLoading={coverageTypeLoading}
                                    />
                                ) : (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            textAlign: "center",
                                            borderStyle: "dashed",
                                            color: "text.secondary",
                                            fontSize: 14,
                                        }}
                                    >
                                        กรุณาเลือกเหตุของการเคลมก่อน ระบบจะแสดงประเภทความคุ้มครองตามผลิตภัณฑ์ PH
                                    </Paper>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Typography fontWeight={600} fontSize={16}>
                                        {values.coverageTypeId === 4 || values.coverageTypeId === 5
                                            ? "สาเหตุการเสียชีวิต/สูญเสียอวัยวะ"
                                            : values.coverageTypeId === 2 || values.coverageTypeId === 3
                                            ? "ประเภทการรักษา"
                                            : "ตัวเลือกเพิ่มเติม"}
                                        <Typography component="span" color="error">
                                            {" "}
                                            *
                                        </Typography>
                                    </Typography>
                                </Box>
                                {values.coverageTypeId &&
                                (values.coverageTypeId === 2 || values.coverageTypeId === 3) ? (
                                    <ChipSelector
                                        formik={formik}
                                        idFieldName="medicalTypeId"
                                        nameFieldName="medicalTypeName"
                                        options={medicalType}
                                        isLoading={isMedicalLoading}
                                    />
                                ) : values.coverageTypeId &&
                                  (values.coverageTypeId === 4 || values.coverageTypeId === 5) ? (
                                    <ChipSelector
                                        formik={formik}
                                        idFieldName="causeOfIncidentId"
                                        nameFieldName="causeOfIncidentName"
                                        options={causeOfAccident}
                                        isLoading={causeOfAccidentLoading}
                                    />
                                ) : (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            textAlign: "center",
                                            borderStyle: "dashed",
                                            color: "text.secondary",
                                            fontSize: 14,
                                        }}
                                    >
                                        กรุณาเลือกประเภทความคุ้มครองก่อน
                                    </Paper>
                                )}
                            </Grid>
                            {/* ── ผู้รับเอกสาร / ผู้ให้บริการ / เจ้าของรถ ── */}
                            <Grid item xs={12} md={4}>
                                <DocumentRecipientTypeDropDown
                                    firstItemText="-- เลือก --"
                                    formik={formik}
                                    name="documentReceiver"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={4} mt={-1}>
                                <UserAutocompleteApi formik={formik} name="serviceProvider" fullWidth required />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormikDropdown
                                    label="เจ้าของรถ"
                                    data={zebraCarOwner?.data ?? []}
                                    firstItemText="-- เลือก --"
                                    valueFieldName="zebraId"
                                    displayFieldName="employeeFullName"
                                    formik={formik}
                                    name="carOwner"
                                    isLoading={zebraCarOwnerLoading}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            {/* ── วันที่เกิดเหตุ ── */}
                            <Grid item xs={12} sm={6} md={4}>
                                <FormikDatePicker
                                    name="incidentDate"
                                    label="วันที่เกิดเหตุ"
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs()}
                                    required
                                />
                            </Grid>

                            {(values.coverageTypeId === 2 || values.coverageTypeId === 3) && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormikDatePicker
                                        name="admissionDate"
                                        label="วันที่เข้า รพ."
                                        formik={formik}
                                        slotProps={{ textField: { size: "small" } }}
                                        maxDate={dayjs()}
                                        required
                                    />
                                </Grid>
                            )}
                            {(values.medicalTypeId === 2 || values.medicalTypeId === 6) && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormikDatePicker
                                        name="dischargeDate"
                                        label="วันที่ออก รพ."
                                        formik={formik}
                                        slotProps={{ textField: { size: "small" } }}
                                        maxDate={dayjs()}
                                        required
                                    />
                                </Grid>
                            )}
                            {(values.coverageTypeId === 4 || values.coverageTypeId === 5) && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormikDatePicker
                                        name="receiveDocDate"
                                        label="วันที่รับเอกสาร"
                                        formik={formik}
                                        slotProps={{ textField: { size: "small" } }}
                                        maxDate={dayjs()}
                                        required
                                    />
                                </Grid>
                            )}
                            {values.coverageTypeId === 5 && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormikDatePicker
                                        name="deathDate"
                                        label="วันที่เสียชีวิต"
                                        formik={formik}
                                        slotProps={{ textField: { size: "small" } }}
                                        maxDate={dayjs()}
                                        required
                                    />
                                </Grid>
                            )}

                            {/* ── Coverage box ── */}
                            {(values.medicalTypeId === 1 || values.medicalTypeId === 2) && (
                                <Grid item xs={12}>
                                    {values.medicalTypeId === 1 && (
                                        <Grid item xs={12}>
                                            <CoverageBox items={OPD_COVERAGE_ITEMS} planCode="662" />
                                        </Grid>
                                    )}
                                    {values.medicalTypeId === 2 && (
                                        <Grid item xs={12}>
                                            <CoverageBox items={IPD_COVERAGE_ITEMS} planCode="662" />
                                        </Grid>
                                    )}
                                </Grid>
                            )}

                            {/* ── ปุ่มคำนวณวงเงิน (IPD เท่านั้น) ── */}
                            {values.medicalTypeId === 2 && (
                                <Grid item xs={12} md={6} lg={4}>
                                    <Grid container justifyContent="center">
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            onClick={() => {}}
                                            startIcon={<CalculateIcon />}
                                            sx={{ width: { md: "50%", xs: "100%", sm: "30%" }, mb: 1 }}
                                        >
                                            เปิดโปรแกรมคำนวณวงเงิน
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}

                            {/* ── จำนวนเงิน ── */}
                            <Grid item xs={12}>
                                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                    <Grid item xs={12} sm={5.9} md={2.9}>
                                        <FormikTextNumber
                                            name="claimAmount"
                                            label="จำนวนเงิน"
                                            formik={formik}
                                            decimalScale={2}
                                            fixedDecimalScale
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                                            }}
                                            required
                                        />
                                    </Grid>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#c8a415",
                                            bgcolor: "#fdf6e3",
                                            px: 0.3,
                                            py: 0.3,
                                            fontWeight: "bold",
                                            whiteSpace: { xs: "normal", sm: "nowrap" },
                                        }}
                                    >
                                        *กรุณากรอกยอดเคลมที่ต้องการโอนทั้งหมด
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* ── ระบุอาการ / อื่นๆ ── */}
                            <Grid item xs={12}>
                                <RadioGroup
                                    row
                                    value={values.symptomType}
                                    onChange={(e) => setFieldValue("symptomType", e.target.value)}
                                >
                                    <FormControlLabel
                                        value="ระบุอาการ"
                                        control={<Radio size="small" />}
                                        label="ระบุอาการ"
                                    />
                                    <FormControlLabel value="อื่นๆ" control={<Radio size="small" />} label="อื่นๆ" />
                                </RadioGroup>
                            </Grid>

                            {/* ── อาการสำคัญ ── */}
                            {values.symptomType === "ระบุอาการ" && (
                                <Grid item xs={12} sm={12} md={12} lg={9}>
                                    <ChiefComplaintAutocomplete
                                        name="chiefComplain"
                                        formik={formik}
                                        size="small"
                                        required
                                    />
                                </Grid>
                            )}

                            {/* ── หมายเหตุ ── */}
                            {values.symptomType === "อื่นๆ" && (
                                <Grid item xs={12} sm={12} md={12} lg={9}>
                                    <FormikTextField
                                        name="remark"
                                        label="หมายเหตุ"
                                        formik={formik}
                                        size="small"
                                        multiline
                                        rows={2}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </CustomPaper>
                </Box>
            </CustomPaper>
            {values.incidentTypeId && (values.medicalTypeId === 1 || values.medicalTypeId === 2) && (
                <CustomPaper>
                    <HeadingWithColor
                        icon={<UploadFileSharpIcon sx={{ fontSize: 27 }} />}
                        text="แนบเอกสาร"
                        color="blue"
                    />
                    <OcrDocumentScanSection />
                </CustomPaper>
            )}

            <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mb={5}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        disabled={formik.isSubmitting}
                        onClick={handleSubmit}
                    >
                        ถัดไป
                    </Button>
                </Box>
            </Grid>
        </>
    );
};

export default ClaimFormSection;
