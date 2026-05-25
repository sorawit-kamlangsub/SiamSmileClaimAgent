import React, { useEffect, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, Grid } from "@mui/material";
import { useFormik } from "formik";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { CONTINUOUS_CLAIM_OPTIONS, TREATMENT_TYPE_OPTIONS } from "../../store/mockClaimLine";
import { FormikDropdown, FormikTextField } from "../../../_common";
import FormikDatePicker from "../../../_common/components/CustomFormik/FormikDatePicker";
import { CustomTypographyWithOutGrid } from "../../../_common/components/CustomComponent/CustomTypographyWithOutGrid";
import { setDaysCalculate } from "../../store/claimLineSlice";
import ConfirmSaveClaimLineModal from "./ConfirmSaveClaimLineModal";

// const PA_URL = "https://ssspa.siamsmile.co.th/Modules/PA/frmApplicationDetail";

const DaysCalculate: React.FC = () => {
    const dispatch = useAppDispatch();
    const { daysCalculate } = useAppSelector((s) => s.claimline);
    const [openConfirm, setOpenConfirm] = useState(false);

    const formik = useFormik({
        initialValues: {
            treatmentType: daysCalculate.treatmentType,
            admitDate: daysCalculate.admitDate ? dayjs(daysCalculate.admitDate) : null,
            dischargeDate: daysCalculate.dischargeDate ? dayjs(daysCalculate.dischargeDate) : null,
            ipdDays: daysCalculate.ipdDays,
            icuDays: daysCalculate.icuDays,
            bedDays: daysCalculate.bedDays,
            isContinuous: daysCalculate.isContinuous,
            continuousFromClaimNo: daysCalculate.continuousFromClaimNo,
        },
        enableReinitialize: true,
        validate: (v) => {
            const e: any = {};
            if (!v.treatmentType) e.treatmentType = "โปรดระบุ";
            if (!v.admitDate) e.admitDate = "โปรดระบุ";
            if (!v.dischargeDate) e.dischargeDate = "โปรดระบุ";
            if (v.isContinuous && !v.continuousFromClaimNo) e.continuousFromClaimNo = "โปรดระบุ";
            return e;
        },
        onSubmit: (values) => {
            dispatch(
                setDaysCalculate({
                    treatmentType: values.treatmentType,
                    admitDate: values.admitDate ? dayjs(values.admitDate).format("YYYY-MM-DD") : "",
                    dischargeDate: values.dischargeDate ? dayjs(values.dischargeDate).format("YYYY-MM-DD") : "",
                    ipdDays: values.ipdDays,
                    icuDays: values.icuDays,
                    bedDays: values.bedDays,
                    isContinuous: values.isContinuous,
                    continuousFromClaimNo: values.continuousFromClaimNo,
                })
            );
        },
    });

    const handleCalculateDays = () => {
        const admit = formik.values.admitDate;
        const discharge = formik.values.dischargeDate;
        if (!admit || !discharge) return;
        const diff = dayjs(discharge).diff(dayjs(admit), "day");
        const ipdDays = diff > 0 ? diff : 0;
        formik.setFieldValue("ipdDays", ipdDays); // useEffect sync ให้เอง
        formik.setFieldValue("bedDays", ipdDays);
    };

    // sync ทุก field change ไปที่ redux ทันที
    const handleFieldChange = (field: string, value: any) => {
        formik.setFieldValue(field, value);
        dispatch(setDaysCalculate({ [field]: value }));
    };

    useEffect(() => {
        dispatch(
            setDaysCalculate({
                treatmentType: formik.values.treatmentType,
                admitDate: formik.values.admitDate ? dayjs(formik.values.admitDate).format("YYYY-MM-DD") : "",
                dischargeDate: formik.values.dischargeDate
                    ? dayjs(formik.values.dischargeDate).format("YYYY-MM-DD")
                    : "",
                ipdDays: formik.values.ipdDays,
                icuDays: formik.values.icuDays,
                bedDays: formik.values.bedDays,
                isContinuous: formik.values.isContinuous,
                continuousFromClaimNo: formik.values.continuousFromClaimNo,
            })
        );
    }, [formik.values]);

    const handleConfirm = () => {
        setOpenConfirm(false);
        alert("บันทึกสำเร็จ");
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box component="form" onSubmit={formik.handleSubmit}>
                {/* ── Row 1: AppID + ชื่อ ── */}
                <Grid container spacing={3} alignItems="center" mb={2.5}>
                    <Grid item xs={12} sm="auto">
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <CustomTypographyWithOutGrid label="ApplicationID" value={daysCalculate.appId} />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm="auto">
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <CustomTypographyWithOutGrid label="ชื่อผู้เอาประกัน" value={daysCalculate.customerName} />
                        </Box>
                    </Grid>
                </Grid>

                {/* ── Row 2: ประเภทการรักษา + วันเข้า + วันออก ── */}
                <Grid container spacing={2} alignItems="flex-start" mb={2}>
                    <Grid item xs={12} sm={4} md={4} lg={3}>
                        <FormikDropdown
                            name="treatmentType"
                            label="ประเภทการรักษา"
                            formik={formik}
                            data={TREATMENT_TYPE_OPTIONS}
                            firstItemText="-- เลือก --"
                            displayFieldName="CaseTypeName"
                            valueFieldName="CaseTypeId"
                            fullWidth
                            size="small"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={4} lg={3}>
                        <FormikDatePicker
                            name="admitDate"
                            label="วันที่เข้า"
                            formik={formik}
                            fullWidth
                            required
                            size="small"
                            // slotProps={{ textField: { size: "small", fullWidth: true, required: true } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={4} lg={3}>
                        <FormikDatePicker
                            name="dischargeDate"
                            label="วันที่ออก"
                            formik={formik}
                            fullWidth
                            required
                            size="small"
                            // slotProps={{ textField: { size: "small", fullWidth: true, required: true } }}
                        />
                    </Grid>
                    {/* <Grid item xs={12} sm={6} md={2} lg={1.5}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleCalculateDays}
                            sx={{ height: 40 }} // ให้สูงเท่า textfield size="small"
                        >
                            คำนวณวัน
                        </Button>
                    </Grid> */}
                </Grid>

                {/* ── Row 3: จำนวนวัน ── */}
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={6} sm={4} md={4} lg={3}>
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
                    <Grid item xs={6} sm={4} md={4} lg={3}>
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
                    <Grid item xs={6} sm={4} md={4} lg={3}>
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

                {/* ── Row 4: เป็นเคลมต่อเนื่องจาก ── */}
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm="auto">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formik.values.isContinuous}
                                    onChange={(e) => {
                                        handleFieldChange("isContinuous", e.target.checked);
                                        if (!e.target.checked) handleFieldChange("continuousFromClaimNo", "");
                                    }}
                                    size="small"
                                />
                            }
                            label="เป็นเคลมต่อเนื่องจาก"
                            sx={{ mr: 0 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6.9} md={5.6} lg={7.2} ml={1}>
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
                    <Grid item xs={12} sm={2} md={2} lg={1.5}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => {
                                handleCalculateDays();
                                setOpenConfirm(true);
                            }}
                            // sx={{ height: 40 }} // ให้สูงเท่า textfield size="small"
                            size="medium"
                        >
                            คำนวณ
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <ConfirmSaveClaimLineModal
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                onConfirm={handleConfirm}
            />
        </LocalizationProvider>
    );
};

export default DaysCalculate;
