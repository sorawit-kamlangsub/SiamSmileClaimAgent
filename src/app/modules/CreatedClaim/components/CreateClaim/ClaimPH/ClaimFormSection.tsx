import React from "react";
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Grid,
    InputAdornment,
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

// ─── Claim type constants ─────────────────────────────────────────────────────
const CLAIM_TYPE = {
    IPD: 2,
    OPD: 3,
    DAY_SURGERY: 4,
    DEATH_CASE: 5,
    DISABILITY: 6,
} as const;

const OPD_SUB_TYPE = {
    ILLNESS: 2,
    ACCIDENT: 3,
} as const;

const IPD_SUB_TYPE = {
    ILLNESS: 2,
    ACCIDENT: 3,
} as const;

const CLAIM_TYPE_LABEL: Record<number, string> = {
    [CLAIM_TYPE.IPD]: "IPD",
    [CLAIM_TYPE.OPD]: "OPD",
    [CLAIM_TYPE.DAY_SURGERY]: "Day Case Surgery",
    [CLAIM_TYPE.DEATH_CASE]: "DeathClaim",
    [CLAIM_TYPE.DISABILITY]: "สูญเสียอวัยวะ / ทุพพลภาพ",
};

const OPD_SUB_TYPE_LABEL: Record<number, string> = {
    [OPD_SUB_TYPE.ILLNESS]: "โรคทั่วไป",
    [OPD_SUB_TYPE.ACCIDENT]: "อุบัติเหตุ",
};

const IPD_SUB_TYPE_LABEL: Record<number, string> = {
    [IPD_SUB_TYPE.ILLNESS]: "โรคทั่วไป",
    [IPD_SUB_TYPE.ACCIDENT]: "อุบัติเหตุ",
};

interface Props {
    onNext: () => void;
}

const ClaimFormSection: React.FC<Props> = ({ onNext }) => {
    const { formik } = useClaimPHForm({ onNext });
    const { values, errors, touched, setFieldValue } = formik;

    const handleSubmit = async () => {
        const errs = await formik.validateForm();
        if (Object.keys(errs).length > 0) {
            formik.setTouched(Object.keys(errs).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
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
                    <Grid container spacing={2}>
                        {/* ── ผู้รับเอกสาร / ผู้ให้บริการ / เจ้าของรถ ── */}
                        <Grid item xs={12}>
                            <Grid item xs={12} sm={6} md={4} mb={1.5}>
                                <DocumentRecipientTypeDropDown
                                    firstItemText="-- เลือก --"
                                    formik={formik}
                                    name="documentReceiver"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} mb={1.5}>
                                <UserAutocompleteApi
                                    firstItemText="-- เลือก --"
                                    formik={formik}
                                    name="serviceProvider"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormikDropdown
                                    label="เจ้าของรถ"
                                    data={[{ value: "006 - 00000 - คุณสำนักงาน - (-)" }]}
                                    firstItemText="-- เลือก --"
                                    displayFieldName="value"
                                    valueFieldName="value"
                                    formik={formik}
                                    name="carOwner"
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>

                        {/* ── ลักษณะการเคลม ── */}
                        <Grid item xs={12}>
                            <FormLabel error={touched.claimType && !!errors.claimType}>ลักษณะการเคลม *</FormLabel>
                            <RadioGroup
                                value={values.claimType ?? ""}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setFieldValue("claimType", val);
                                    setFieldValue("claimTypeLabel", CLAIM_TYPE_LABEL[val] ?? ""); // เพิ่ม
                                    setFieldValue("opdSubType", undefined);
                                    setFieldValue("opdSubTypeLabel", ""); // เพิ่ม
                                    setFieldValue("ipdSubType", undefined);
                                    setFieldValue("dateIn", dayjs());
                                    formik.setFieldTouched("claimType", true, true);
                                    formik.setFieldTouched("opdSubType", false, true);
                                    formik.setFieldTouched("ipdSubType", false, true);
                                }}
                            >
                                {/* OPD (3) */}
                                <FormControlLabel value={CLAIM_TYPE.OPD} control={<Radio size="small" />} label="OPD" />
                                {values.claimType === CLAIM_TYPE.OPD && (
                                    <Box pl={4}>
                                        <RadioGroup
                                            row
                                            value={values.opdSubType ?? ""}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setFieldValue("opdSubType", val);
                                                setFieldValue("opdSubTypeLabel", OPD_SUB_TYPE_LABEL[val] ?? ""); // เพิ่ม
                                                formik.setFieldTouched("opdSubType", true, true);
                                            }}
                                        >
                                            <FormControlLabel
                                                value={OPD_SUB_TYPE.ILLNESS}
                                                control={<Radio size="small" />}
                                                label="โรคทั่วไป"
                                            />
                                            <FormControlLabel
                                                value={OPD_SUB_TYPE.ACCIDENT}
                                                control={<Radio size="small" />}
                                                label="อุบัติเหตุ"
                                            />
                                        </RadioGroup>
                                        {touched.opdSubType && errors.opdSubType && (
                                            <FormHelperText error>{errors.opdSubType}</FormHelperText>
                                        )}
                                    </Box>
                                )}

                                {/* IPD (2) */}
                                <FormControlLabel value={CLAIM_TYPE.IPD} control={<Radio size="small" />} label="IPD" />
                                {values.claimType === CLAIM_TYPE.IPD && (
                                    <Box pl={4}>
                                        <RadioGroup
                                            row
                                            value={values.ipdSubType ?? ""}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setFieldValue("ipdSubType", val);
                                                setFieldValue("ipdSubTypeLabel", IPD_SUB_TYPE_LABEL[val] ?? "");
                                                formik.setFieldTouched("ipdSubType", true, false);
                                            }}
                                        >
                                            <FormControlLabel
                                                value={IPD_SUB_TYPE.ILLNESS}
                                                control={<Radio size="small" />}
                                                label="ค่ารักษาพยาบาล"
                                            />
                                            <FormControlLabel
                                                value={IPD_SUB_TYPE.ACCIDENT}
                                                control={<Radio size="small" />}
                                                label="ค่าชดเชย (เบิกจากที่อื่น)"
                                            />
                                        </RadioGroup>
                                        {touched.ipdSubType && errors.ipdSubType && (
                                            <FormHelperText error>{errors.ipdSubType}</FormHelperText>
                                        )}
                                    </Box>
                                )}

                                {/* Day Case Surgery (4) */}
                                <FormControlLabel
                                    value={CLAIM_TYPE.DAY_SURGERY}
                                    control={<Radio size="small" />}
                                    label="Day Case Surgery"
                                />

                                {/* Death Case (5) */}
                                <FormControlLabel
                                    value={CLAIM_TYPE.DEATH_CASE}
                                    control={<Radio size="small" />}
                                    label="DeathClaim"
                                />

                                {/* Disability (6) */}
                                <FormControlLabel
                                    value={CLAIM_TYPE.DISABILITY}
                                    control={<Radio size="small" />}
                                    label="สูญเสียอวัยวะ / ทุพพลภาพ"
                                />
                            </RadioGroup>

                            {touched.claimType && errors.claimType && (
                                <FormHelperText error>{errors.claimType}</FormHelperText>
                            )}
                        </Grid>

                        {/* ── วันที่เกิดเหตุ ── */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <FormikDatePicker
                                name="incidentDate"
                                label="วันที่เกิดเหตุ"
                                formik={formik}
                                slotProps={{ textField: { size: "small" } }}
                                maxDate={dayjs()}
                                required
                            />
                        </Grid>

                        {/* ── วันที่เข้ารพ. (IPD + OPD) ── */}
                        {(values.claimType === CLAIM_TYPE.IPD || values.claimType === CLAIM_TYPE.OPD) && (
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <FormikDatePicker
                                    name="dateIn"
                                    label="วันที่เข้ารพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs() || formik.values.dateOut}
                                    required
                                />
                            </Grid>
                        )}

                        {/* ── วันที่ออกรพ. (IPD เท่านั้น) ── */}
                        {values.claimType === CLAIM_TYPE.IPD && (
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <FormikDatePicker
                                    name="dateOut"
                                    label="วันที่ออกรพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    minDate={formik.values.dateIn}
                                    maxDate={dayjs()}
                                    required
                                />
                            </Grid>
                        )}

                        {/* ── Coverage box ── */}
                        {(values.claimType === CLAIM_TYPE.IPD || values.claimType === CLAIM_TYPE.OPD) && (
                            <Grid item xs={12}>
                                {values.claimType === CLAIM_TYPE.OPD && (
                                    <Grid item xs={12} md={6} lg={4}>
                                        <CoverageBox items={OPD_COVERAGE_ITEMS} planCode="662" />
                                    </Grid>
                                )}
                                {values.claimType === CLAIM_TYPE.IPD && (
                                    <Grid item xs={12} md={6} lg={4}>
                                        <CoverageBox items={IPD_COVERAGE_ITEMS} planCode="662" />
                                    </Grid>
                                )}
                            </Grid>
                        )}

                        {/* ── ปุ่มคำนวณวงเงิน (IPD เท่านั้น) ── */}
                        {values.claimType === CLAIM_TYPE.IPD && (
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
                </Box>
            </CustomPaper>

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
