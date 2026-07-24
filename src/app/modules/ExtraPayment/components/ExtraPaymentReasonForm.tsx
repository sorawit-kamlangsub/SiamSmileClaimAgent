import React from "react";
import { Grid, TextField, Typography } from "@mui/material";
import { FormikProps } from "formik";
import { ExtraPaymentFormValues, ExtraPaymentReasonOption } from "../store/ExtraPayment.types";
import { FormikDropdown } from "../../_common";

const REMARK_MAX_LENGTH = 500;

interface ExtraPaymentReasonFormProps {
    formik: FormikProps<ExtraPaymentFormValues>;
    reasonOptions: ExtraPaymentReasonOption[];
}

export const ExtraPaymentReasonForm: React.FC<ExtraPaymentReasonFormProps> = ({ formik, reasonOptions }) => {
    const { values, setFieldValue } = formik;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <FormikDropdown
                    name="reasonId"
                    label="สาเหตุการโอนเพิ่ม"
                    required
                    fullWidth
                    formik={formik}
                    data={reasonOptions}
                    valueFieldName="id"
                    displayFieldName="labelTh"
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="หมายเหตุ (ถ้ามี)"
                    placeholder="ระบุรายละเอียดเพิ่มเติม"
                    value={values.remark}
                    onChange={(e) => setFieldValue("remark", e.target.value.slice(0, REMARK_MAX_LENGTH))}
                    inputProps={{ maxLength: REMARK_MAX_LENGTH }}
                />
                <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mt={0.5}>
                    {values.remark.length}/{REMARK_MAX_LENGTH} ตัวอักษร
                </Typography>
            </Grid>
        </Grid>
    );
};
