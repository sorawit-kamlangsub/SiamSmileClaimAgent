import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../redux";
import { setHeader } from "../../store/claimLineSlice";
import MedicalTypeDropDown from "../../../_common/components/ClaimAgent/CustomDropdown/MedicalTypeDropDown";

const ClaimLineHeader: React.FC = () => {
    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues: { medicalType: 1 },
        validate: (v) => {
            const e: any = {};
            if (!v.medicalType) e.medicalType = "โปรดระบุ";
            return e;
        },
        onSubmit: (values) => {
            dispatch(setHeader({ medicalType: values.medicalType }));
        },
    });

    useEffect(() => {
        dispatch(setHeader({ medicalType: formik.values.medicalType }));
    }, []);

    return (
        <Grid container spacing={2} alignItems="flex-start" mb={1}>
            <Grid item xs={12} sm={4}>
                <MedicalTypeDropDown
                    name="medicalType"
                    formik={formik}
                    selectedCallback={(value) => {
                        dispatch(setHeader({ medicalType: value as number }));
                    }}
                    firstItemText="---- เลือก ----"
                    fullWidth
                    size="small"
                    required
                />
            </Grid>
        </Grid>
    );
};

export default ClaimLineHeader;
