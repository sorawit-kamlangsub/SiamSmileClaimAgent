import { Grid } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useFormikContext } from "formik";

import CollapsibleSection from "../../../../ClaimConsider/components/ConsiderHospitalDetails/SubDetailsTab/CollapsibleSection";
import BillingInfoField from "./BillingInfoField";
import { PENDING_BE } from "../../../store/billingPendingFields";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

type BillingTreatmentSectionProps = {
    /** [IPD] แสดง AN + ข้อบ่งชี้การ Admit */
    showIpdFields?: boolean;
    /** "รายละเอียดเพิ่มเติม" — `BillingDetailDto.reservationRemark` */
    reservationRemark?: string;
};

const procedureLabel = (value: boolean | undefined) => (value === undefined ? undefined : value ? "ใช่" : "ไม่ใช่");

/**
 * Step 1 : "ข้อมูลการเข้ารับการรักษา" — Read-only ทั้งหมดตามสเปค (ข้อมูลจาก SmileConnect)
 *
 * ลำดับ field ตามสเปคเดิม — กำหนดความกว้างให้แต่ละแถวเต็มพอดี :
 * - แถวแรก : HN / VN (+ AN / ข้อบ่งชี้การ Admit เมื่อ IPD) แบ่งเท่ากัน
 * - ข้อความยาว : ครึ่งแถว จับคู่ โรคประจำตัว | วิธีการรักษา, ผลการตรวจ | รายละเอียดเพิ่มเติม
 * - มีการทำหัตถการหรือไม่ : ปิดท้ายครึ่งแถว
 */
const BillingTreatmentSection = ({ showIpdFields = false, reservationRemark }: BillingTreatmentSectionProps) => {
    const { values } = useFormikContext<BillingReviewFormValues>();
    /** ความกว้างช่องแถวแรกบนจอ md+ : IPD 4 ช่อง = 3/12, ไม่ใช่ IPD 2 ช่อง = 6/12 */
    const firstRowMd = showIpdFields ? 3 : 6;

    return (
        <CollapsibleSection icon={<LocalHospitalIcon sx={{ fontSize: 27 }} />} title="ข้อมูลการเข้ารับการรักษา">
            <Grid container spacing={2}>
                <BillingInfoField label="HN" value={values.hn} md={firstRowMd} />
                <BillingInfoField label="VN" value={values.vn} md={firstRowMd} />
                {showIpdFields && (
                    <>
                        <BillingInfoField label="AN" value={values.an} md={firstRowMd} />
                        {/* PENDING-BE: PENDING_BE_FIELDS.admitIndication */}
                        <BillingInfoField
                            label="ข้อบ่งชี้การ Admit"
                            value={values.admitIndication || PENDING_BE}
                            md={firstRowMd}
                        />
                    </>
                )}
                <BillingInfoField
                    label="โรคประจำตัว (U/D)"
                    value={values.underlyingDiseaseDetail}
                    xs={12}
                    sm={12}
                    md={6}
                />
                <BillingInfoField label="วิธีการรักษาพยาบาล" value={values.illnessDetail} xs={12} sm={12} md={6} />
                <BillingInfoField
                    label="ผลการตรวจ LAB, EKG, X-ray และอื่นๆ"
                    value={values.investigationResults}
                    xs={12}
                    sm={12}
                    md={6}
                />
                <BillingInfoField label="รายละเอียดเพิ่มเติม" value={reservationRemark} xs={12} sm={12} md={6} />
                <BillingInfoField
                    label="มีการทำหัตถการหรือไม่"
                    value={procedureLabel(values.isProcedurePerformed)}
                    md={6}
                />
            </Grid>
        </CollapsibleSection>
    );
};

export default BillingTreatmentSection;
