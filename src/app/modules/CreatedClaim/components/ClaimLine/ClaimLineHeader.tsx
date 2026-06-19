import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../redux";
import { setHeader } from "../../store/claimLineSlice";
import PatienttypeDropDown from "../../../_common/components/ClaimAgent/CustomDropdown/PatienttypeDropDown";

const ClaimLineHeader: React.FC = () => {
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
        <Grid container spacing={2} alignItems="flex-start" mb={1}>
            <Grid item xs={12} sm={4}>
                <PatienttypeDropDown
                    name="patientType"
                    formik={formik}
                    selectedCallback={(value) => {
                        dispatch(setHeader({ patientType: value as number }));
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
