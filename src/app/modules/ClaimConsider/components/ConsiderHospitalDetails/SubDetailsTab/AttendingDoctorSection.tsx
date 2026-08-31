import { Grid } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import { useFormikContext } from "formik";

import CollapsibleSection from "./CollapsibleSection";
import { FormikTextField } from "../../../../_common";
import { HospitalConsiderValues } from "../../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";

/** Section "แพทย์เจ้าของไข้" */
const AttendingDoctorSection = () => {
    const formik = useFormikContext<HospitalConsiderValues>();

    return (
        <CollapsibleSection title="แพทย์เจ้าของไข้" icon={<BadgeIcon sx={{ fontSize: 27 }} />}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <FormikTextField
                        name="doctorLicenseNo"
                        label="เลขใบประกอบวิชาชีพเวชกรรม"
                        formik={formik}
                        size="small"
                        fullWidth
                        required
                        inputProps={{ inputMode: "numeric" }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={8}>
                    <FormikTextField
                        name="doctorName"
                        label="แพทย์ (ชื่อ-สกุล)"
                        formik={formik}
                        size="small"
                        fullWidth
                        required
                    />
                </Grid>
            </Grid>
        </CollapsibleSection>
    );
};

export default AttendingDoctorSection;
