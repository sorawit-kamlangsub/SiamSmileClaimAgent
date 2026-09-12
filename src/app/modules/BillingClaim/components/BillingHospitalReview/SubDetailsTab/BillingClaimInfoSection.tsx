import { Grid } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { formatDateString } from "../../../../../functionHelpers";
import useBillingClaimLabels from "../../../hooks/BillingHospitalReview/BillingClaimLabelsHook";
import { PENDING_BE } from "../../../store/billingPendingFields";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

type BillingClaimInfoSectionProps = {
    hospitalName?: string;
    /** `detail.submittedDate` (ISO string) — "วันที่แจ้ง" อิงข้อมูลจาก SmileConnect */
    submittedDate?: string;
    /** [IPD] แสดงวันนอน IPD/ICU/รวม */
    showStayDays?: boolean;
};

const fmtDate = (v: string | undefined) => formatDateString(v, "DD/MM/BBBB");
const fmtTime = (v: string | undefined) => formatDateString(v, "HH:mm");

/**
 * Step 1 : "รายละเอียดเคลม" — Read-only ทั้งหมดตามสเปค (ข้อมูลจาก SmileConnect)
 * bind ตรงกับ `BillingClaimDto` — ชื่อ (ไม่ใช่ ID) resolve ผ่าน `useBillingClaimLabels`
 */
const BillingClaimInfoSection = ({
    hospitalName,
    submittedDate,
    showStayDays = false,
}: BillingClaimInfoSectionProps) => {
    const { values } = useFormikContext<BillingReviewFormValues>();
    const labels = useBillingClaimLabels(values);
    const totalStayDays = (values.ipdDays || 0) + (values.icuDays || 0);

    return (
        <CustomPaper>
            <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="รายละเอียดเคลม" color="blue" />
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <CustomDisplayText label="เหตุของการเคลม" value={labels.incidentTypeName} />
                <CustomDisplayText label="ประเภทความคุ้มครอง" value={labels.coverageTypeName} />
                <CustomDisplayText label="ประเภทการรักษา" value={labels.medicalTypeName} />
                <CustomDisplayText label="วันที่แจ้ง" value={fmtDate(submittedDate)} />
                {/* PENDING-BE: PENDING_BE_FIELDS.documentCompleteDate — default วันนี้จนกว่า BE จะส่งค่ามา */}
                <CustomDisplayText
                    label="วันที่เอกสารครบ"
                    value={values.documentCompleteDate ? values.documentCompleteDate.format("DD/MM/BBBB") : PENDING_BE}
                />
                <CustomDisplayText label="วันที่เกิดเหตุ" value={fmtDate(values.occurrenceDate?.toString())} />
                <CustomDisplayText label="เวลาที่เกิดเหตุ" value={fmtTime(values.occurrenceTime?.toString())} />
                <CustomDisplayText label="วันที่เข้า รพ." value={fmtDate(values.admissionDate?.toString())} />
                <CustomDisplayText label="เวลาที่เข้า รพ." value={fmtTime(values.admissionTime?.toString())} />
                <CustomDisplayText label="วันที่ออก รพ." value={fmtDate(values.dischargeDate?.toString())} />
                <CustomDisplayText label="เวลาที่ออก รพ." value={fmtTime(values.dischargeTime?.toString())} />
                {showStayDays && (
                    <>
                        <CustomDisplayText label="จำนวนวันนอน IPD" value={`${values.ipdDays} วัน`} />
                        <CustomDisplayText label="จำนวนวันนอน ICU" value={`${values.icuDays} วัน`} />
                        <CustomDisplayText label="จำนวนวันนอนรวม" value={`${totalStayDays} วัน`} />
                    </>
                )}
                <CustomDisplayText label="สถานพยาบาล" value={hospitalName} />
                <CustomDisplayText label="อาการสำคัญ" value={values.chiefComplaintId_selectedText} xs={12} md={6} />
                <CustomDisplayText label="การวินิจฉัย 1" value={labels.diagnosis1Name} xs={12} md={6} />
                <CustomDisplayText label="การวินิจฉัย 2" value={labels.diagnosis2Name} xs={12} md={6} />
                <CustomDisplayText label="การวินิจฉัย 3" value={labels.diagnosis3Name} xs={12} md={6} />
                <CustomDisplayText label="รายละเอียด" value={values.note} xs={12} />
            </Grid>
        </CustomPaper>
    );
};

export default BillingClaimInfoSection;
