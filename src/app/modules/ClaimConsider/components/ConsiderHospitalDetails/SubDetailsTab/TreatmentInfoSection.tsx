import { Grid } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useFormikContext } from "formik";

import CollapsibleSection from "./CollapsibleSection";
import { FormikTextField } from "../../../../_common";
import { HospitalConsiderValues } from "../../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";

/**
 * Section "ข้อมูลการเข้ารับการรักษา"
 * RC-005 5.2 ตัด VN / AN / โรคประจำตัว / ข้อบ่งชี้ / วิธีการรักษา / ผล LAB / หัตถการ ออกแล้ว
 * เหลือ HN + รายละเอียดเพิ่มเติม (ReservationRemark จาก SmileConnect — DFUAT-070 เดิมใช้ชื่อ "หมายเหตุ(ถ้ามี)")
 * ค่าเริ่มต้นมาจาก SmileConnect ผ่าน GetClaimDetailConsider ยังแก้ไขต่อได้
 */
const TreatmentInfoSection = () => {
    const formik = useFormikContext<HospitalConsiderValues>();

    return (
        <CollapsibleSection title="ข้อมูลการเข้ารับการรักษา" icon={<LocalHospitalIcon sx={{ fontSize: 27 }} />}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3} data-field-name="hn">
                    <FormikTextField name="hn" label="HN" formik={formik} size="small" fullWidth required />
                </Grid>
                <Grid item xs={12}>
                    <FormikTextField
                        name="reservationRemark"
                        label="รายละเอียดเพิ่มเติม"
                        formik={formik}
                        size="small"
                        multiline
                        rows={2}
                        fullWidth
                    />
                </Grid>
            </Grid>
        </CollapsibleSection>
    );
};

export default TreatmentInfoSection;
