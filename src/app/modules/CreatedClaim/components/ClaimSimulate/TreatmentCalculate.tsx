import React, { useEffect } from "react";
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useDaysCalculate } from "../../hooks/ClaimSimulate/useDaysCalculate";
import { FormikDropdown, FormikTextField } from "../../../_common";
import { CONTINUOUS_CLAIM_OPTIONS } from "../../store/mockClaimLine";
import ConfirmCalaulateModal from "./ConfirmCalaulateModal";
// import CaseTypeDropDown from "../../../_common/components/ClaimAgent/CustomDropdown/CaseTypeDropDown";
import FormikDateTimePicker from "../../../_common/components/CustomFormik/FormikDateTimePicker";
import FormikDatePicker from "../../../_common/components/CustomFormik/FormikDatePicker";
import { CustomTypographyWithOutGrid } from "../../../_common/components/CustomComponent/CustomTypographyWithOutGrid";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import dayjs from "dayjs";

interface Props {
    onBack?: () => void;
}

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "primary.main",
                color: "white",
                flexShrink: 0,
            }}
        >
            {icon}
        </Box>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {title}
        </Typography>
        <Divider sx={{ flex: 1 }} />
    </Stack>
);

// ─── Day summary card ─────────────────────────────────────────────────────────
const DaySummaryCard: React.FC<{
    label: string;
    value: number;
    color: string;
    disabled?: boolean;
}> = ({ label, value, color, disabled }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            textAlign: "center",
            border: "1px solid",
            borderColor: disabled ? "divider" : `${color}.light`,
            borderRadius: 2,
            bgcolor: disabled ? "action.disabledBackground" : `${color}.50`,
            opacity: disabled ? 0.7 : 1,
            transition: "all 0.2s",
        }}
    >
        <Typography variant="h4" fontWeight={700} color={disabled ? "text.disabled" : `${color}.main`}>
            {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>
    </Paper> 
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const TreatmentCalculate: React.FC<Props> = ({ onBack }) => {
    const {
        formik,
        openConfirm,
        isCalculating,
        daysCalculate,
        handleDateHappenChange,
        handleAdmitDateChange,
        handleDischargeDateChange,
        handleCalculate,
        handleContinuousChange,
        handleConfirm,
        handleCloseConfirm,
    } = useDaysCalculate();

    useEffect(() => {
        if (!formik.values.dateHappen || !formik.values.admitDate || !formik.values.dischargeDate) return;
        handleDateHappenChange(formik.values.dateHappen);
        handleAdmitDateChange(formik.values.admitDate);
        handleDischargeDateChange(formik.values.dischargeDate);
    }, [formik.values.admitDate, formik.values.dischargeDate, formik.values.dateHappen]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                component="form"
                onSubmit={formik.handleSubmit}
                sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, sm: 3 } }}
            >
                {/* ── Section 1: ข้อมูลผู้เอาประกัน ── */}
                <Paper
                    elevation={0}
                    sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
                >
                    <SectionHeader
                        icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />}
                        title="ข้อมูลผู้เอาประกัน"
                    />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                        <CustomTypographyWithOutGrid label="Application ID" value={daysCalculate.appId} />
                        <CustomTypographyWithOutGrid label="ชื่อผู้เอาประกัน" value={daysCalculate.customerName} />
                    </Stack>
                </Paper>
                {/* ── Section 1: ข้อมูลการรักษา ── */}
                <Paper
                    elevation={0}
                    sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
                >
                    <SectionHeader
                        icon={<MedicalServicesOutlinedIcon sx={{ fontSize: 18 }} />}
                        title="ข้อมูลการรักษา"
                    />
                    <Grid container spacing={2.5} alignItems="flex-start">
                        {/* ประเภทการรักษา */}
                        {/* <Grid item xs={12} sm={6} md={4}>
                            <CaseTypeDropDown
                                name="treatmentType"
                                formik={formik}
                                firstItemText="-- เลือก --"
                                fullWidth
                                size="small"
                                required
                                filterIds={[2, 4]}
                            />
                        </Grid> */}

                        {/* วันที่เกิดเหตุ */}
                        <Grid item xs={12} sm={6} md={4}>
                            <FormikDatePicker
                                name="dateHappen"
                                label="วันที่เกิดเหตุ"
                                formik={formik}
                                fullWidth
                                required
                                size="small"
                                maxDate={dayjs()}
                            />
                        </Grid>

                        {/* วันที่เข้า */}
                        <Grid item xs={12} sm={6} md={4}>
                            <FormikDateTimePicker
                                name="admitDate"
                                label="วันที่เข้า"
                                formik={formik}
                                fullWidth
                                required
                                size="small"
                                maxDate={dayjs()}
                            />
                        </Grid>

                        {/* วันที่ออก */}
                        <Grid item xs={12} sm={6} md={4}>
                            <FormikDateTimePicker
                                name="dischargeDate"
                                label="วันที่ออก"
                                formik={formik}
                                fullWidth
                                required
                                size="small"
                                maxDate={dayjs()}
                                minDate={formik.values.admitDate}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* ── Section 2: สรุปจำนวนวัน ── */}
                <Paper
                    elevation={0}
                    sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
                >
                    <SectionHeader icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />} title="สรุปจำนวนวัน" />

                    {/* Card summary */}
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={4}>
                            <DaySummaryCard label="วัน IPD" value={formik.values.ipdDays || 0} color="primary" />
                        </Grid>
                        <Grid item xs={4}>
                            <DaySummaryCard label="วัน ICU" value={formik.values.icuDays || 0} color="error" />
                        </Grid>
                        <Grid item xs={4}>
                            <DaySummaryCard
                                label="วันที่นอน"
                                value={formik.values.bedDays || 0}
                                color="success"
                                disabled
                            />
                        </Grid>
                    </Grid>

                    {/* Number inputs */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <FormikTextField
                                name="ipdDays"
                                label="จำนวนวัน IPD"
                                formik={formik}
                                size="small"
                                fullWidth
                                type="number"
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormikTextField
                                name="icuDays"
                                label="จำนวนวัน ICU"
                                formik={formik}
                                size="small"
                                fullWidth
                                type="number"
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormikTextField
                                name="bedDays"
                                label="จำนวนวันที่นอน"
                                formik={formik}
                                size="small"
                                fullWidth
                                type="number"
                                inputProps={{ min: 0 }}
                                disabled
                                sx={{ "& .MuiInputBase-input.Mui-disabled": { bgcolor: "#f5f5f5" } }}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* ── Section 3: เคลมต่อเนื่อง + Actions ── */}
                <Paper
                    elevation={0}
                    sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
                >
                    <Grid container spacing={2} alignItems="center">
                        {/* Checkbox เคลมต่อเนื่อง */}
                        <Grid item xs={12} sm="auto">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formik.values.isContinuous}
                                        onChange={(e) => handleContinuousChange(e.target.checked)}
                                        size="small"
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography variant="body2" fontWeight={500}>
                                        เป็นเคลมต่อเนื่องจาก
                                    </Typography>
                                }
                            />
                        </Grid>

                        {/* Dropdown ClaimNo */}
                        <Grid item xs={12} sm={5} md={4}>
                            <FormikDropdown
                                name="continuousFromClaimNo"
                                label="เลือก ClaimNo"
                                formik={formik}
                                data={CONTINUOUS_CLAIM_OPTIONS}
                                firstItemText="-- เลือก --"
                                displayFieldName="label"
                                valueFieldName="value"
                                fullWidth
                                size="small"
                                disabled={!formik.values.isContinuous}
                            />
                        </Grid>

                        {/* Spacer */}
                        <Grid item xs={12} sm />

                        {/* ปุ่มย้อนกลับ */}
                        <Grid item xs={12} sm="auto">
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="large"
                                startIcon={<ArrowBackIcon />}
                                onClick={onBack}
                                fullWidth
                                sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
                            >
                                ย้อนกลับ
                            </Button>
                        </Grid>

                        {/* ปุ่มคำนวณ */}
                        <Grid item xs={12} sm="auto">
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={
                                    isCalculating ? (
                                        <CircularProgress size={18} color="inherit" />
                                    ) : (
                                        <CalculateOutlinedIcon />
                                    )
                                }
                                onClick={handleCalculate}
                                disabled={isCalculating}
                                fullWidth
                                sx={{
                                    px: 4,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    boxShadow: 2,
                                    "&:hover": { boxShadow: 4 },
                                }}
                            >
                                {isCalculating ? "กำลังคำนวณ..." : "คำนวณ"}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            <ConfirmCalaulateModal open={openConfirm} onClose={handleCloseConfirm} onConfirm={handleConfirm} />
        </LocalizationProvider>
    );
};

export default TreatmentCalculate;
