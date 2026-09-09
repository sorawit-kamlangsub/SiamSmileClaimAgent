import { Grid } from "@mui/material";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import ClaimSummaryStep3 from "../../../../ClaimConsider/components/ConsiderHospitalDetails/SubDetailsTab/ExpensesTabs/ClaimSummaryStep3";
import { formatDateString } from "../../../../../functionHelpers";
import useBillingClaimLabels from "../../../hooks/BillingHospitalReview/BillingClaimLabelsHook";
import useBillingExpenseHook from "../../../hooks/BillingHospitalReview/BillingExpenseHook";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";
import BillingScanDocumentTable, { BillingStep3DocumentRow } from "./BillingScanDocumentTable";

type BillingSummaryStep3Props = {
    hospitalName?: string;
    /** `detail.submittedDate` (ISO string) — "วันที่แจ้งเคลม" */
    submittedDate?: string;
    /** [IPD] แสดง "สรุปจำนวนวันนอน" (ผ่าน `ClaimSummaryStep3.stayDays`) */
    showStayDays?: boolean;
    /** PH + IPD/DayCase เท่านั้น (วันนี้เป็น false เสมอ — PENDING_BE_FIELDS.productTypeId) */
    allowSeparateCompensation?: boolean;
    /** Step 3 "สแกนเอกสาร" — ยังไม่มีรายการจาก BE (PENDING_BE_FIELDS.scanDocumentStep3) */
    scanDocumentRows?: BillingStep3DocumentRow[];
};

const fmtDate = (v: string | undefined) => formatDateString(v, "DD/MM/BBBB");
const fmtTime = (v: string | undefined) => formatDateString(v, "HH:mm");

/**
 * Step 3 : "สรุปรายการเคลม" — Read-only ทั้งหมด
 *
 * ส่วนตัวเลข (รายการค่ารักษา/สรุปค่าชดเชย/สรุปค่าใช้จ่ายโรงพยาบาล/บัญชีรับเงินค่าชดเชย) reuse
 * `ClaimSummaryStep3` ของ ClaimConsider ตรง ๆ (เป็น prop-driven ล้วน) ผ่าน additive props ที่เพิ่มไว้
 * (`hideCompensationTable`/`lastSummaryLine`/`disableAccountEdit`) — ไม่มี benefit breakdown จริง
 * (PENDING_BE_FIELDS.benefitBreakdown) จึงส่ง `treatmentRows=[]` และ derive summary จากยอดที่คำนวณได้จริง
 * (`useBillingExpenseHook`) เท่านั้น
 */
const BillingSummaryStep3 = ({
    hospitalName,
    submittedDate,
    showStayDays = false,
    allowSeparateCompensation = false,
    scanDocumentRows = [],
}: BillingSummaryStep3Props) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const { values } = formik;
    const labels = useBillingClaimLabels(values);
    const expenseTotals = useBillingExpenseHook(formik);

    return (
        <>
            <CustomPaper>
                <HeadingWithColor icon={<SummarizeIcon sx={{ fontSize: 27 }} />} text="สรุปรายการ" color="blue" />
                <Grid container spacing={2}>
                    <CustomDisplayText label="เหตุของการเคลม" value={labels.incidentTypeName} />
                    <CustomDisplayText label="ประเภทความคุ้มครอง" value={labels.coverageTypeName} />
                    <CustomDisplayText label="ประเภทการรักษา" value={labels.medicalTypeName} />
                    <CustomDisplayText label="วันที่แจ้งเคลม" value={fmtDate(submittedDate)} />
                    <CustomDisplayText label="วันที่เกิดเหตุ" value={fmtDate(values.occurrenceDate?.toString())} />
                    <CustomDisplayText
                        label="เวลาที่เกิดเหตุ"
                        value={fmtTime(values.occurrenceTime?.toString()) ?? "-"}
                    />
                    <CustomDisplayText label="วันที่เข้า รพ." value={fmtDate(values.admissionDate?.toString())} />
                    <CustomDisplayText
                        label="เวลาที่เข้า รพ."
                        value={fmtTime(values.admissionTime?.toString()) ?? "-"}
                    />
                    <CustomDisplayText label="วันที่ออก รพ." value={fmtDate(values.dischargeDate?.toString())} />
                    <CustomDisplayText
                        label="เวลาที่ออก รพ."
                        value={fmtTime(values.dischargeTime?.toString()) ?? "-"}
                    />
                    <CustomDisplayText label="สถานพยาบาล" value={hospitalName} />
                    <CustomDisplayText label="อาการสำคัญ" value={values.chiefComplaintId_selectedText} />
                    <CustomDisplayText label="คำวินิจฉัย 1" value={labels.diagnosis1Name} />
                    <CustomDisplayText label="คำวินิจฉัย 2" value={labels.diagnosis2Name ?? "-"} />
                    <CustomDisplayText label="คำวินิจฉัย 3" value={labels.diagnosis3Name ?? "-"} />
                    <CustomDisplayText label="หมายเหตุ" value={values.note} xs={12} />
                </Grid>
            </CustomPaper>

            <BillingScanDocumentTable rows={scanDocumentRows} />

            <CustomPaper>
                <ClaimSummaryStep3
                    treatmentRows={[]}
                    compensationRows={[]}
                    hideCompensationTable
                    summary={{ medicalNet: expenseTotals.totalClaimedAmount, medicalPay: expenseTotals.netAmount }}
                    stayDays={
                        showStayDays
                            ? {
                                  ipdDays: values.ipdDays,
                                  icuDays: values.icuDays,
                                  totalDays: (values.ipdDays || 0) + (values.icuDays || 0),
                              }
                            : undefined
                    }
                    allowSeparateCompensation={allowSeparateCompensation}
                    lastSummaryLine="compensateRemain"
                    disableAccountEdit
                />
            </CustomPaper>
        </>
    );
};

export default BillingSummaryStep3;
