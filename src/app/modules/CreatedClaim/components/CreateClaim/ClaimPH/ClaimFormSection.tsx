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
import { FormikDropdown, FormikTextField, FormikTextNumber, FormikAutocomplete } from "../../../../_common";
import FormikDatePicker from "../../../../_common/components/CustomFormik/FormikDatePicker";
import ArticleIcon from "@mui/icons-material/Article";
import CoverageBox from "./CoverageBox";
import { IPD_COVERAGE_ITEMS, OPD_COVERAGE_ITEMS } from "../../../store/mockClaimPH";
import { IpdSubType } from "../../../store/claimPHSlice";
import CalculateIcon from "@mui/icons-material/Calculate";

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
                        <Grid item xs={12}>
                            {/* ผู้รับเอกสาร */}
                            <Grid item xs={12} sm={6} md={4} mb={1.5}>
                                <FormikDropdown
                                    label="ผู้รับเอกสาร"
                                    data={[{ value: "ผู้ให้บริการ" }, { value: "FCNT (สกลนคร)" }, { value: "Pivot" }]}
                                    firstItemText="-- เลือก --"
                                    displayFieldName="value"
                                    valueFieldName="value"
                                    formik={formik}
                                    name="documentReceiver"
                                    fullWidth
                                    required
                                />
                            </Grid>

                            {/* ผู้ให้บริการ */}
                            <Grid item xs={12} sm={6} md={4} mb={1.5}>
                                <FormikDropdown
                                    label="ผู้ให้บริการ"
                                    data={[{ value: "06590 - นางสาวมัญฑิตา โลวักษา" }]}
                                    firstItemText="-- เลือก --"
                                    displayFieldName="value"
                                    valueFieldName="value"
                                    formik={formik}
                                    name="serviceProvider"
                                    fullWidth
                                    required
                                />
                            </Grid>

                            {/* เจ้าของรถ */}
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

                        {/* ลักษณะการเคลม */}
                        <Grid item xs={12}>
                            <FormLabel error={touched.claimType && !!errors.claimType}>ลักษณะการเคลม *</FormLabel>
                            <RadioGroup
                                value={values.claimType}
                                onChange={(e) => {
                                    setFieldValue("claimType", e.target.value);
                                    setFieldValue("opdSubType", "");
                                    setFieldValue("ipdSubType", "");
                                    setFieldValue("admitDate", null);
                                    formik.setFieldTouched("claimType", true, false);
                                    formik.setFieldTouched("opdSubType", false, false);
                                    formik.setFieldTouched("ipdSubType", false, false);
                                }}
                            >
                                <FormControlLabel value="OPD" control={<Radio size="small" />} label="OPD" />
                                {values.claimType === "OPD" && (
                                    <Box pl={4}>
                                        <RadioGroup
                                            row
                                            value={values.opdSubType}
                                            onChange={(e) => {
                                                setFieldValue("opdSubType", e.target.value);
                                                formik.setFieldTouched("opdSubType", true, false); // ★
                                            }}
                                        >
                                            <FormControlLabel
                                                value="โรคทั่วไป"
                                                control={<Radio size="small" />}
                                                label="โรคทั่วไป"
                                            />
                                            <FormControlLabel
                                                value="อุบัติเหตุ"
                                                control={<Radio size="small" />}
                                                label="อุบัติเหตุ"
                                            />
                                        </RadioGroup>
                                        {errors.opdSubType && (
                                            <FormHelperText error>{errors.opdSubType}</FormHelperText>
                                        )}
                                    </Box>
                                )}

                                <FormControlLabel value="IPD" control={<Radio size="small" />} label="IPD" />
                                {values.claimType === "IPD" && (
                                    <Box pl={4}>
                                        <RadioGroup
                                            row
                                            value={values.ipdSubType}
                                            onChange={(e) => {
                                                setFieldValue("ipdSubType", e.target.value as IpdSubType);
                                                formik.setFieldTouched("ipdSubType", true, false); // ★
                                            }}
                                        >
                                            <FormControlLabel
                                                value="ค่ารักษาพยาบาล"
                                                control={<Radio size="small" />}
                                                label="ค่ารักษาพยาบาล"
                                            />
                                            <FormControlLabel
                                                value="ค่าชดเชย"
                                                control={<Radio size="small" />}
                                                label="ค่าชดเชย (เบิกจากที่อื่น)"
                                            />
                                        </RadioGroup>
                                        {touched.ipdSubType && errors.ipdSubType && (
                                            <FormHelperText error>{errors.ipdSubType}</FormHelperText>
                                        )}
                                    </Box>
                                )}

                                <FormControlLabel
                                    value="DayCaseSurgery"
                                    control={<Radio size="small" />}
                                    label="Day Case Surgery"
                                />
                                <FormControlLabel
                                    value="DeathClaim"
                                    control={<Radio size="small" />}
                                    label="DeathClaim"
                                />
                                <FormControlLabel
                                    value="LossOrDisability"
                                    control={<Radio size="small" />}
                                    label="สูญเสียอวัยวะ / ทุพพลภาพ"
                                />
                            </RadioGroup>

                            {touched.claimType && errors.claimType && (
                                <FormHelperText error>{errors.claimType}</FormHelperText>
                            )}
                        </Grid>

                        {/* วันที่เกิดเหตุ */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <FormikDatePicker
                                name="incidentDate"
                                label="วันที่เกิดเหตุ"
                                formik={formik}
                                slotProps={{ textField: { size: "small" } }}
                                required
                            />
                        </Grid>
                        {/* วันที่เข้ารพ. */}
                        {(values.claimType === "IPD" || values.claimType === "OPD") && (
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <FormikDatePicker
                                    name="dateIn"
                                    label="วันที่เข้ารพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    required
                                />
                            </Grid>
                        )}

                        {/* วันที่ออกรพ— เฉพาะ IPD */}
                        {values.claimType === "IPD" && (
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <FormikDatePicker
                                    name="dateOut"
                                    label="วันที่ออกรพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    required
                                />
                            </Grid>
                        )}
                        {(values.claimType === "IPD" || values.claimType === "OPD") && (
                            <Grid item xs={12}>
                                {/* ★ Coverage box */}
                                {values.claimType === "OPD" && (
                                    <Grid item xs={12} md={6} lg={4}>
                                        <CoverageBox items={OPD_COVERAGE_ITEMS} planCode="662" />
                                    </Grid>
                                )}
                                {values.claimType === "IPD" && (
                                    <Grid item xs={12} md={6} lg={4}>
                                        <CoverageBox items={IPD_COVERAGE_ITEMS} planCode="662" />
                                    </Grid>
                                )}
                            </Grid>
                        )}
                        {values.claimType === "IPD" && (
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

                        {/* จำนวนเงิน */}
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

                        {/* ระบุอาการ / อื่นๆ */}
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

                        {/* อาการสำคัญ */}
                        {values.symptomType === "ระบุอาการ" && (
                            <Grid item xs={12} sm={12} md={12} lg={9}>
                                <FormikAutocomplete
                                    name="chiefComplain"
                                    label="อาการสำคัญ"
                                    formik={formik}
                                    data={[
                                        { value: "โดนมาร์จรั่น" },
                                        { value: "ไข้หวัดใหญ่" },
                                        { value: "ประสงค์เบิกยาแก้ปวดหัว" },
                                    ]}
                                    valueFieldName="value"
                                    displayFieldName="value"
                                    size="small"
                                    required
                                />
                            </Grid>
                        )}

                        {/* หมายเหตุ */}
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
