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
    TextField,
} from "@mui/material";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { useClaimPHForm } from "../../../hooks/CreateClaim/ClaimPH/useClaimPHForm";

interface Props {
    onNext: () => void;
}

const SimpleSelect = ({ label, value, onChange, options, error, helperText, disabled }: any) => (
    <TextField
        select
        fullWidth
        size="small"
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
        disabled={disabled}
        SelectProps={{ native: true }}
        InputLabelProps={{ shrink: true }}
    >
        <option value="">-- เลือก --</option>
        {options.map((o: string) => (
            <option key={o} value={o}>
                {o}
            </option>
        ))}
    </TextField>
);

const ClaimFormSection: React.FC<Props> = ({ onNext }) => {
    const { formik, isIncidentDateDisabled, lockedIncidentDate } = useClaimPHForm({ onNext });
    const { values, errors, touched, setFieldValue } = formik;

    return (
        <CustomPaper>
            <HeadingWithColor text="บันทึกข้อมูลเคลม" color="blue" />
            <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    {/* ผู้รับเอกสาร */}
                    <Grid item xs={12} sm={6} md={4}>
                        <SimpleSelect
                            label="ผู้รับเอกสาร *"
                            value={values.documentReceiver}
                            onChange={(e: any) => setFieldValue("documentReceiver", e.target.value)}
                            options={["ผู้ให้บริการ", "FCNT (สกลนคร)", "Pivot"]}
                            error={touched.documentReceiver && !!errors.documentReceiver}
                            helperText={touched.documentReceiver && errors.documentReceiver}
                        />
                    </Grid>

                    {/* ผู้ให้บริการ */}
                    <Grid item xs={12} sm={6} md={4}>
                        <SimpleSelect
                            label="ผู้ให้บริการ *"
                            value={values.serviceProvider}
                            onChange={(e: any) => setFieldValue("serviceProvider", e.target.value)}
                            options={["06590 - นางสาวมัญฑิตา โลวักษา"]}
                            error={touched.serviceProvider && !!errors.serviceProvider}
                            helperText={touched.serviceProvider && errors.serviceProvider}
                        />
                    </Grid>

                    {/* เจ้าของรถ */}
                    <Grid item xs={12} sm={6} md={4}>
                        <SimpleSelect
                            label="เจ้าของรถ *"
                            value={values.carOwner}
                            onChange={(e: any) => setFieldValue("carOwner", e.target.value)}
                            options={["006 - 00000 - คุณสำนักงาน - (-)"]}
                            error={touched.carOwner && !!errors.carOwner}
                            helperText={touched.carOwner && errors.carOwner}
                        />
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
                                        <TextField
                                            size="small"
                                            type="number"
                                            label="จำนวนคืน"
                                            disabled={!values.normalRoom}
                                            value={values.normalNights}
                                            onChange={(e) => setFieldValue("normalNights", Number(e.target.value))}
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
                                        <TextField
                                            size="small"
                                            type="number"
                                            label="จำนวน ICU"
                                            disabled={!values.icuRoom}
                                            value={values.icuNights}
                                            onChange={(e) => setFieldValue("icuNights", Number(e.target.value))}
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
                            <FormControlLabel value="DeathClaim" control={<Radio size="small" />} label="DeathClaim" />
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
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="วันที่เกิดเหตุ *"
                            InputLabelProps={{ shrink: true }}
                            disabled={isIncidentDateDisabled}
                            value={isIncidentDateDisabled ? lockedIncidentDate : values.incidentDate}
                            onChange={(e) => setFieldValue("incidentDate", e.target.value)}
                            error={touched.incidentDate && !!errors.incidentDate}
                            helperText={touched.incidentDate && errors.incidentDate}
                        />
                    </Grid>

                    {/* จำนวนเงิน */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            label="จำนวนเงิน"
                            value={values.claimAmount}
                            onChange={(e) => {
                                if (/^\d*\.?\d*$/.test(e.target.value)) setFieldValue("claimAmount", e.target.value);
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* ระบุอาการ / อื่นๆ */}
                    <Grid item xs={12}>
                        <RadioGroup
                            row
                            value={values.symptomType}
                            onChange={(e) => setFieldValue("symptomType", e.target.value)}
                        >
                            <FormControlLabel value="ระบุอาการ" control={<Radio size="small" />} label="ระบุอาการ" />
                            <FormControlLabel value="อื่นๆ" control={<Radio size="small" />} label="อื่นๆ" />
                        </RadioGroup>
                    </Grid>

                    {values.symptomType === "ระบุอาการ" && (
                        <Grid item xs={12} sm={8} md={6}>
                            <SimpleSelect
                                label="อาการสำคัญ *"
                                value={values.chiefComplain}
                                onChange={(e: any) => setFieldValue("chiefComplain", e.target.value)}
                                options={["โดนมาร์จรั่น", "ไข้หวัดใหญ่", "ประสงค์เบิกยาแก้ปวดหัว"]}
                                error={touched.chiefComplain && !!errors.chiefComplain}
                                helperText={touched.chiefComplain && errors.chiefComplain}
                            />
                        </Grid>
                    )}

                    {values.symptomType === "อื่นๆ" && (
                        <Grid item xs={12} sm={8} md={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="หมายเหตุ *"
                                multiline
                                rows={2}
                                value={values.remark}
                                onChange={(e) => setFieldValue("remark", e.target.value)}
                                error={touched.remark && !!errors.remark}
                                helperText={touched.remark && errors.remark}
                            />
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end">
                            <Button type="submit" variant="contained" color="primary" size="large">
                                ถัดไป
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </CustomPaper>
    );
};

export default ClaimFormSection;
