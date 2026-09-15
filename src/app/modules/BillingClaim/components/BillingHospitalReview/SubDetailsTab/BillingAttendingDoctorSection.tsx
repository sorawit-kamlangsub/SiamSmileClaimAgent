import { Grid } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import { useFormikContext } from "formik";

import CollapsibleSection from "../../../../ClaimConsider/components/ConsiderHospitalDetails/SubDetailsTab/CollapsibleSection";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

/** Step 1 : "แพทย์เจ้าของไข้" — Read-only ทั้งหมดตามสเปค (ข้อมูลจาก SmileConnect) */
const BillingAttendingDoctorSection = () => {
    const { values } = useFormikContext<BillingReviewFormValues>();

    return (
        <CollapsibleSection icon={<BadgeIcon sx={{ fontSize: 27 }} />} title="แพทย์เจ้าของไข้">
            <Grid container spacing={2}>
                <CustomDisplayText label="เลขใบประกอบวิชาชีพเวชกรรม" value={values.medicalLicenseNo} />
                <CustomDisplayText label="แพทย์ (ชื่อ-สกุล)" value={values.physicianName} xs={12} sm={6} md={8} />
            </Grid>
        </CollapsibleSection>
    );
};

export default BillingAttendingDoctorSection;
