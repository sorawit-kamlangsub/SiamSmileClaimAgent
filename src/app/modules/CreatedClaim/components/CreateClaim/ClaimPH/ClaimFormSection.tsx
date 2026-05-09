import React from "react";
import {
    Box,
    Button,
    Checkbox,
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
import { useClaimPHForm } from "../../../hooks/CreateClaim/ClaimPH/useClaimPHForm";
import { FormikDropdown, FormikTextField, FormikTextNumber, FormikAutocomplete } from "../../../../_common";
import FormikDatePicker from "../../../../_common/components/CustomFormik/FormikDatePicker";

interface Props {
    onNext: () => void;
}

const ClaimFormSection: React.FC<Props> = ({ onNext }) => {
    const { formik, isIncidentDateDisabled } = useClaimPHForm({ onNext });
    const { values, errors, touched, setFieldValue } = formik;

    return (
        <>
            <CustomPaper>
                <HeadingWithColor text="บันทึกข้อมูลเคลม" color="blue" />
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
                                }}
                            >
                                <FormControlLabel value="OPD" control={<Radio size="small" />} label="OPD" />
                                {values.claimType === "OPD" && (
                                    <Box pl={4}>
                                        <RadioGroup
                                            row
                                            value={values.opdSubType}
                                            onChange={(e) => setFieldValue("opdSubType", e.target.value)}
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
                                    </Box>
                                )}

                                <FormControlLabel value="IPD" control={<Radio size="small" />} label="IPD" />
                                {values.claimType === "IPD" && (
                                    <Box pl={4} display="flex" flexDirection="column" gap={1}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={values.normalRoom}
                                                        onChange={(e) => setFieldValue("normalRoom", e.target.checked)}
                                                    />
                                                }
                                                label="ห้องปกติ"
                                            />
                                            <FormikTextField
                                                name="normalNights"
                                                label="จำนวนคืน"
                                                formik={formik}
                                                size="small"
                                                type="number"
                                                disabled={!values.normalRoom}
                                                inputProps={{ min: 0, step: 1 }}
                                                sx={{ width: 120 }}
                                            />
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={values.icuRoom}
                                                        onChange={(e) => setFieldValue("icuRoom", e.target.checked)}
                                                    />
                                                }
                                                label="ห้อง ICU"
                                            />
                                            <FormikTextField
                                                name="icuNights"
                                                label="จำนวน ICU"
                                                formik={formik}
                                                size="small"
                                                type="number"
                                                disabled={!values.icuRoom}
                                                inputProps={{ min: 0, step: 1 }}
                                                sx={{ width: 120 }}
                                            />
                                        </Box>
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

                        {/* วันที่เกิดเหตุ */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <FormikDatePicker
                                name="incidentDate"
                                label="วันที่เกิดเหตุ"
                                formik={formik}
                                disabled={isIncidentDateDisabled}
                                slotProps={{ textField: { size: "small" } }}
                                required
                            />
                        </Grid>

                        {/* จำนวนเงิน */}
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
                    <Button variant="contained" color="primary" size="medium" onClick={() => formik.handleSubmit()}>
                        ถัดไป
                    </Button>
                </Box>
            </Grid>
        </>
    );
};

export default ClaimFormSection;
