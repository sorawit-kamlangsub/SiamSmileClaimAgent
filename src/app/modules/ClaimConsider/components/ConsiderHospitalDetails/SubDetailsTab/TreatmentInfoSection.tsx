import { Grid, Typography } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useFormikContext } from "formik";

import CollapsibleSection from "./CollapsibleSection";
import { FormikRadioGroup, FormikTextField } from "../../../../_common";
import { HospitalConsiderValues } from "../../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";

const procedureOptions = [
    { id: "yes", name: "ใช่" },
    { id: "no", name: "ไม่ใช่" },
];

/**
 * Section "ข้อมูลการเข้ารับการรักษา"
 * ค่าเริ่มต้นของทุก Field มาจาก SmileConnect (ตอนนี้เป็น Mock)
 */
const TreatmentInfoSection = () => {
    const formik = useFormikContext<HospitalConsiderValues>();

    return (
        <CollapsibleSection title="ข้อมูลการเข้ารับการรักษา" icon={<LocalHospitalIcon sx={{ fontSize: 27 }} />}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <FormikTextField name="hn" label="HN" formik={formik} size="small" fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormikTextField name="vn" label="VN" formik={formik} size="small" fullWidth required />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <FormikTextField
                        name="underlyingDisease"
                        label="โรคประจำตัว (U/D)"
                        formik={formik}
                        size="small"
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormikTextField
                        name="treatmentMethod"
                        label="วิธีการรักษาพยาบาล"
                        formik={formik}
                        size="small"
                        multiline
                        rows={2}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormikTextField
                        name="labResult"
                        label="ผลการตรวจ LAB, EKG, X-ray และอื่นๆ"
                        formik={formik}
                        size="small"
                        multiline
                        rows={2}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormikTextField
                        name="additionalDetail"
                        label="รายละเอียดเพิ่มเติม"
                        formik={formik}
                        size="small"
                        multiline
                        rows={2}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography fontWeight={600} fontSize={16}>
                        มีการทำหัตถการหรือไม่{" "}
                        <Typography component="span" color="error">
                            *
                        </Typography>
                    </Typography>
                    <FormikRadioGroup name="hasProcedure" data={procedureOptions} formik={formik} row />
                </Grid>
            </Grid>
        </CollapsibleSection>
    );
};

export default TreatmentInfoSection;
