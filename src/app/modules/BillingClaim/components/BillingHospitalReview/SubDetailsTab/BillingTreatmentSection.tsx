import { Grid } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useFormikContext } from "formik";

import CollapsibleSection from "../../../../ClaimConsider/components/ConsiderHospitalDetails/SubDetailsTab/CollapsibleSection";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { PENDING_BE } from "../../../store/billingPendingFields";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

type BillingTreatmentSectionProps = {
    /** [IPD] แสดง AN + ข้อบ่งชี้การ Admit */
    showIpdFields?: boolean;
};

const procedureLabel = (value: boolean | undefined) => (value === undefined ? undefined : value ? "ใช่" : "ไม่ใช่");

/** Step 1 : "ข้อมูลการเข้ารับการรักษา" — Read-only ทั้งหมดตามสเปค (ข้อมูลจาก SmileConnect) */
const BillingTreatmentSection = ({ showIpdFields = false }: BillingTreatmentSectionProps) => {
    const { values } = useFormikContext<BillingReviewFormValues>();

    return (
        <CollapsibleSection icon={<LocalHospitalIcon sx={{ fontSize: 27 }} />} title="ข้อมูลการเข้ารับการรักษา">
            <Grid container spacing={2}>
                <CustomDisplayText label="HN" value={values.hn} />
                <CustomDisplayText label="VN" value={values.vn} />
                {showIpdFields && (
                    <>
                        <CustomDisplayText label="AN" value={values.an} />
                        {/* PENDING-BE: PENDING_BE_FIELDS.admitIndication */}
                        <CustomDisplayText label="ข้อบ่งชี้การ Admit" value={values.admitIndication || PENDING_BE} />
                    </>
                )}
                <CustomDisplayText label="โรคประจำตัว (U/D)" value={values.underlyingDiseaseDetail} xs={12} md={6} />
                <CustomDisplayText label="วิธีการรักษาพยาบาล" value={values.illnessDetail} xs={12} md={6} />
                <CustomDisplayText
                    label="ผลการตรวจ LAB, EKG, X-ray และอื่นๆ"
                    value={values.investigationResults}
                    xs={12}
                />
                {/* PENDING-BE: BillingMedicalDto ยังไม่มีฟิลด์ "รายละเอียดเพิ่มเติม" แยกจาก 3 ช่องข้างบน */}
                <CustomDisplayText label="รายละเอียดเพิ่มเติม" value={PENDING_BE} xs={12} />
                <CustomDisplayText label="มีการทำหัตถการหรือไม่" value={procedureLabel(values.isProcedurePerformed)} />
            </Grid>
        </CollapsibleSection>
    );
};

export default BillingTreatmentSection;
