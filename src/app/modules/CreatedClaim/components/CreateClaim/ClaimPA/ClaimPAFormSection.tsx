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
} from "@mui/material";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { useClaimPAForm } from "../../../hooks/CreateClaim/ClaimPA/useClaimPAForm";
import { FormikDropdown, FormikTextField, FormikTextNumber, FormikAutocomplete } from "../../../../_common";
import FormikDatePicker from "../../../../_common/components/CustomFormik/FormikDatePicker";

interface Props {
    onNext: () => void;
}

// field ที่แสดงตาม claimType
const showAdmitDate = (t: string) => ["OPD", "IPD", "DayCaseSurgery"].includes(t);
const showDischargeDate = (t: string) => ["IPD", "DayCaseSurgery"].includes(t);
const showAmountAndSymptom = (t: string) => ["OPD", "IPD", "DayCaseSurgery"].includes(t);

const ClaimPAFormSection: React.FC<Props> = ({ onNext }) => {
    const { formik } = useClaimPAForm({ onNext });
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
                <HeadingWithColor text="บันทึกข้อมูลเคลม" color="blue" />
                <Box component="form" onSubmit={formik.handleSubmit} p={2}>
                    <Grid container spacing={2}>
                        {/* ── ผู้รับเอกสาร ── */}
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormikDropdown
                                        label="ผู้รับเอกสาร"
                                        name="documentReceiver"
                                        formik={formik}
                                        data={[
                                            { value: "ผู้ให้บริการ" },
                                            { value: "FCNT (สกลนคร)" },
                                            { value: "Pivot" },
                                        ]}
                                        firstItemText="-- เลือก --"
                                        displayFieldName="value"
                                        valueFieldName="value"
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormikDropdown
                                        label="ผู้ให้บริการ"
                                        name="serviceProvider"
                                        formik={formik}
                                        data={[{ value: "06590 - นางสาวมัญฑิตา โลวักษา" }]}
                                        firstItemText="-- เลือก --"
                                        displayFieldName="value"
                                        valueFieldName="value"
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormikDropdown
                                        label="เจ้าของรถ"
                                        name="carOwner"
                                        formik={formik}
                                        data={[{ value: "006 - 00000 - คุณสำนักงาน - (-)" }]}
                                        firstItemText="-- เลือก --"
                                        displayFieldName="value"
                                        valueFieldName="value"
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* ── ลักษณะการเคลม ── */}
                        <Grid item xs={12}>
                            <FormLabel error={touched.claimType && !!errors.claimType}>ลักษณะการเคลม *</FormLabel>
                            <RadioGroup
                                value={values.claimType}
                                onChange={(e) => {
                                    setFieldValue("claimType", e.target.value);
                                    setFieldValue("opdSubType", "");
                                    setFieldValue("admitDate", null);
                                    setFieldValue("dischargeDate", null);
                                }}
                            >
                                {/* OPD */}
                                <FormControlLabel value="OPD" control={<Radio size="small" />} label="OPD" />
                                {values.claimType === "OPD" && (
                                    <Box pl={4}>
                                        <RadioGroup
                                            row
                                            value={values.opdSubType}
                                            onChange={(e) => setFieldValue("opdSubType", e.target.value)}
                                        >
                                            <FormControlLabel
                                                value="ค่ารักษา"
                                                control={<Radio size="small" />}
                                                label="ค่ารักษา"
                                            />
                                            <FormControlLabel
                                                value="ค่าชดเชย"
                                                control={<Radio size="small" />}
                                                label="ค่าชดเชย"
                                            />
                                        </RadioGroup>
                                    </Box>
                                )}

                                {/* IPD */}
                                <FormControlLabel value="IPD" control={<Radio size="small" />} label="IPD" />
                                {values.claimType === "IPD" && (
                                    <Box pl={4}>
                                        <RadioGroup
                                            row
                                            value={values.opdSubType}
                                            onChange={(e) => setFieldValue("opdSubType", e.target.value)}
                                        >
                                            <FormControlLabel
                                                value="ค่ารักษา"
                                                control={<Radio size="small" />}
                                                label="ค่ารักษา"
                                            />
                                            <FormControlLabel
                                                value="ค่าชดเชย"
                                                control={<Radio size="small" />}
                                                label="ค่าชดเชย"
                                            />
                                        </RadioGroup>
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
                                    label="สูญเสียอวัยวะ/ทุพพลภาพ"
                                />
                            </RadioGroup>
                            {touched.claimType && errors.claimType && (
                                <FormHelperText error>{errors.claimType}</FormHelperText>
                            )}
                        </Grid>

                        {/* ── วันที่เกิดเหตุ (แสดงทุก claimType) ── */}
                        {values.claimType && (
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <FormikDatePicker
                                    name="incidentDate"
                                    label="วันที่เกิดเหตุ"
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    required
                                />
                            </Grid>
                        )}

                        {/* ── วันที่เข้า รพ. (OPD, IPD, DayCaseSurgery) ── */}
                        {showAdmitDate(values.claimType) && (
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <FormikDatePicker
                                    name="admitDate"
                                    label="วันที่เข้า รพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    required
                                />
                            </Grid>
                        )}

                        {/* ── วันที่ออก รพ. (IPD, DayCaseSurgery) ── */}
                        {showDischargeDate(values.claimType) && (
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <FormikDatePicker
                                    name="dischargeDate"
                                    label="วันที่ออก รพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    required
                                />
                            </Grid>
                        )}

                        {/* ── จำนวนเงิน + ระบุอาการ (OPD, IPD, DayCaseSurgery) ── */}
                        {showAmountAndSymptom(values.claimType) && (
                            <>
                                <Grid item xs={12} sm={6} md={4} lg={3}>
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
                                        <FormControlLabel
                                            value="อื่นๆ"
                                            control={<Radio size="small" />}
                                            label="อื่นๆ"
                                        />
                                    </RadioGroup>
                                </Grid>

                                {values.symptomType === "ระบุอาการ" && (
                                    <Grid item xs={12} lg={9}>
                                        <FormikAutocomplete
                                            name="chiefComplain"
                                            label="อาการสำคัญ"
                                            formik={formik}
                                            data={[{ value: "ไข้หวัดใหญ่" }, { value: "อุบัติเหตุ" }]}
                                            valueFieldName="value"
                                            displayFieldName="value"
                                            size="small"
                                            required
                                        />
                                    </Grid>
                                )}

                                {values.symptomType === "อื่นๆ" && (
                                    <Grid item xs={12} lg={9}>
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
                            </>
                        )}
                    </Grid>
                </Box>
            </CustomPaper>

            <Grid display="flex" justifyContent="flex-end" mt={1} mb={5}>
                <Button
                    variant="contained"
                    size="medium"
                    color="primary"
                    disabled={formik.isSubmitting}
                    onClick={handleSubmit}
                >
                    ถัดไป
                </Button>
            </Grid>
        </>
    );
};

export default ClaimPAFormSection;
