import { Grid } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { FormikTextField } from "../../../../_common";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

/** Step 1 : "แพทย์เจ้าของไข้" — bind `medical.medicalLicenseNo` / `medical.physicianName` */
const BillingAttendingDoctorSection = ({ readOnly = false }: { readOnly?: boolean }) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const readOnlySx = readOnly ? { "& > *": { pointerEvents: "none" } } : undefined;

    return (
        <CustomPaper sx={readOnlySx}>
            <HeadingWithColor icon={<BadgeIcon sx={{ fontSize: 27 }} />} text="แพทย์เจ้าของไข้" color="blue" />
            <Grid container spacing={2} p={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <FormikTextField
                        name="medicalLicenseNo"
                        label="เลขใบประกอบวิชาชีพเวชกรรม"
                        formik={formik}
                        size="small"
                        fullWidth
                        inputProps={{ inputMode: "numeric", maxLength: 50 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={8}>
                    <FormikTextField
                        name="physicianName"
                        label="แพทย์ (ชื่อ-สกุล)"
                        formik={formik}
                        size="small"
                        fullWidth
                        inputProps={{ maxLength: 255 }}
                    />
                </Grid>
            </Grid>
        </CustomPaper>
    );
};

export default BillingAttendingDoctorSection;
