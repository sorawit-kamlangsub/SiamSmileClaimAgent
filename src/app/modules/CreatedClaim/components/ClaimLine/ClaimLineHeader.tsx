import React, { useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../redux";
import { setHeader } from "../../store/claimLineSlice";
import { FormikDropdown } from "../../../_common";

const PATIENT_TYPE_OPTIONS = [
    { patientTypeId: 1, patientTypeName: "ผู้ป่วยนอก (Outpatient Clinic Nursing Service)" },
    { patientTypeId: 2, patientTypeName: "ผู้ป่วยในทั่วไป (Standard Care Inpatient Nursing Service)" },
    { patientTypeId: 3, patientTypeName: "ผู้ป่วยห้องสังเกตอาการ (Observe Room Nursing Service)" },
    { patientTypeId: 4, patientTypeName: "ผู้ป่วยผ่าตัดไม่ค้างคืน (Ambulatory Surgery Care Unit)" },
    { patientTypeId: 5, patientTypeName: "ผู้ป่วยที่บ้าน (Home Health Care Nursing Service)" },
];

const ClaimLineHeader: React.FC<{}> = () => {
    const dispatch = useAppDispatch();
    const formik = useFormik({
        initialValues: { patientType: 1 },
        validate: (v) => {
            const e: any = {};
            if (!v.patientType) e.patientType = "โปรดระบุ";
            return e;
        },
        onSubmit: (values) => {
            dispatch(setHeader({ patientType: values.patientType }));
        },
    });

    useEffect(() => {
        dispatch(setHeader({ patientType: formik.values.patientType }));
    }, []);

    return (
        <Box component="form" onSubmit={formik.handleSubmit}>
            {/* ── Search Bar ── */}
            <Grid container spacing={2} alignItems="flex-start" mb={1}>
                <Grid item xs={12} sm={4} md={3}>
                    <FormikDropdown
                        name="patientType"
                        label="ประเภทผู้ป่วย"
                        formik={formik}
                        data={PATIENT_TYPE_OPTIONS}
                        selectedCallback={() => {
                            formik.submitForm();
                        }}
                        firstItemText="-- เลือก --"
                        displayFieldName="patientTypeName"
                        valueFieldName="patientTypeId"
                        fullWidth
                        size="small"
                        required
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ClaimLineHeader;
