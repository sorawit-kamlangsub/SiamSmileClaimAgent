import { Grid } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import BillingInfoField from "./BillingInfoField";
import { formatDateString } from "../../../../../functionHelpers";
import useBillingClaimLabels, {
    BillingClaimBeLabels,
} from "../../../hooks/BillingHospitalReview/BillingClaimLabelsHook";
import { PENDING_BE } from "../../../store/billingPendingFields";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

type BillingClaimInfoSectionProps = {
    hospitalName?: string;
    /** `detail.submittedDate` (ISO string) — "วันที่แจ้ง" อิงข้อมูลจาก SmileConnect */
    submittedDate?: string;
    /** [IPD] แสดงวันนอน IPD/ICU/รวม */
    showStayDays?: boolean;
    /** ชื่อความคุ้มครอง/ประเภทการรักษา/การวินิจฉัยที่ BE ส่งมาที่ root ของ `BillingDetailDto` */
    beLabels?: BillingClaimBeLabels;
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
    beLabels,
}: BillingClaimInfoSectionProps) => {
    const { values } = useFormikContext<BillingReviewFormValues>();
    const labels = useBillingClaimLabels(values, beLabels);
    const totalStayDays = (values.ipdDays || 0) + (values.icuDays || 0);

    return (
        <CustomPaper>
            <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="รายละเอียดเคลม" color="blue" />
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <BillingInfoField label="เหตุของการเคลม" value={labels.incidentTypeName} />
                <BillingInfoField label="ประเภทความคุ้มครอง" value={labels.coverageTypeName} />
                <BillingInfoField label="ประเภทการรักษา" value={labels.medicalTypeName} />
                <BillingInfoField label="วันที่แจ้ง" value={fmtDate(submittedDate)} />
                {/* PENDING-BE: PENDING_BE_FIELDS.documentCompleteDate — default วันนี้จนกว่า BE จะส่งค่ามา */}
                <BillingInfoField
                    label="วันที่เอกสารครบ"
                    value={values.documentCompleteDate ? values.documentCompleteDate.format("DD/MM/BBBB") : PENDING_BE}
                />
                <BillingInfoField label="วันที่เกิดเหตุ" value={fmtDate(values.occurrenceDate?.toString())} />
                <BillingInfoField label="เวลาที่เกิดเหตุ" value={fmtTime(values.occurrenceTime?.toString())} />
                <BillingInfoField label="วันที่เข้า รพ." value={fmtDate(values.admissionDate?.toString())} />
                <BillingInfoField label="เวลาที่เข้า รพ." value={fmtTime(values.admissionTime?.toString())} />
                <BillingInfoField label="วันที่ออก รพ." value={fmtDate(values.dischargeDate?.toString())} />
                <BillingInfoField label="เวลาที่ออก รพ." value={fmtTime(values.dischargeTime?.toString())} />
                {showStayDays && (
                    <>
                        <BillingInfoField label="จำนวนวันนอน IPD" value={`${values.ipdDays} วัน`} />
                        <BillingInfoField label="จำนวนวันนอน ICU" value={`${values.icuDays} วัน`} />
                        <BillingInfoField label="จำนวนวันนอนรวม" value={`${totalStayDays} วัน`} />
                    </>
                )}
                {/* IPD : แถวนี้มีแค่ วันนอน ICU / วันนอนรวม / สถานพยาบาล → ขยายสถานพยาบาลเป็นครึ่งแถวให้เต็มพอดี */}
                <BillingInfoField label="สถานพยาบาล" value={hospitalName} md={showStayDays ? 6 : 3} />
                <BillingInfoField
                    label="อาการสำคัญ"
                    value={values.chiefComplaintId_selectedText || labels.chiefComplaintName}
                    xs={12}
                    md={6}
                />
                <BillingInfoField label="การวินิจฉัย 1" value={labels.diagnosis1Name} xs={12} md={6} />
                <BillingInfoField label="การวินิจฉัย 2" value={labels.diagnosis2Name} xs={12} md={6} />
                <BillingInfoField label="การวินิจฉัย 3" value={labels.diagnosis3Name} xs={12} md={6} />
                {/* การวินิจฉัย 4-6 : แสดงเฉพาะเมื่อ BE ส่งมา (เคลมส่วนใหญ่มีไม่เกิน 3) */}
                {labels.diagnosis4Name && (
                    <BillingInfoField label="การวินิจฉัย 4" value={labels.diagnosis4Name} xs={12} md={6} />
                )}
                {labels.diagnosis5Name && (
                    <BillingInfoField label="การวินิจฉัย 5" value={labels.diagnosis5Name} xs={12} md={6} />
                )}
                {labels.diagnosis6Name && (
                    <BillingInfoField label="การวินิจฉัย 6" value={labels.diagnosis6Name} xs={12} md={6} />
                )}
                <BillingInfoField label="รายละเอียด" value={values.note} xs={12} md={6} />
            </Grid>
        </CustomPaper>
    );
};

export default BillingClaimInfoSection;
