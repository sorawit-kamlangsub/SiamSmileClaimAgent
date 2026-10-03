import { Grid } from "@mui/material";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import LoadingOverlay from "../../../../_common/components/CustomComponent/LoadingOverlay";
import ClaimSummaryStep3, {
    Step3CompensationRow,
    Step3TreatmentRow,
} from "../../../../ClaimConsider/components/ConsiderHospitalDetails/SubDetailsTab/ExpensesTabs/ClaimSummaryStep3";
import useBillingCalculateHook from "../../../hooks/BillingHospitalReview/BillingCalculateHook";
import { formatDateString } from "../../../../../functionHelpers";
import useBillingClaimLabels, {
    BillingClaimBeLabels,
} from "../../../hooks/BillingHospitalReview/BillingClaimLabelsHook";
import useBillingExpenseHook from "../../../hooks/BillingHospitalReview/BillingExpenseHook";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";
import BillingScanDocumentTable, { BillingStep3DocumentRow } from "./BillingScanDocumentTable";

type BillingSummaryStep3Props = {
    hospitalName?: string;
    /** `detail.submittedDate` (ISO string) — "วันที่แจ้งเคลม" */
    submittedDate?: string;
    /** [IPD] แสดง "สรุปจำนวนวันนอน" (ผ่าน `ClaimSummaryStep3.stayDays`) */
    showStayDays?: boolean;
    /** PH + IPD/DayCase เท่านั้น (อ่าน product type จาก `BillingDetailDto.productTypeId`) */
    allowSeparateCompensation?: boolean;
    /** Step 3 "สแกนเอกสาร" — ยังไม่มีรายการจาก BE (PENDING_BE_FIELDS.scanDocumentStep3) */
    scanDocumentRows?: BillingStep3DocumentRow[];
    /** ชื่อความคุ้มครอง/ประเภทการรักษา/การวินิจฉัยที่ BE ส่งมาที่ root ของ `BillingDetailDto` */
    beLabels?: BillingClaimBeLabels;
    /** `BillingDetailDto.caseAdjudicationId` — ใช้ยิง calculate/caseclaim เพื่อดึงผลคำนวณสิทธิ์ของ Step 3 */
    caseAdjudicationId?: string;
    /** `BillingDetailDto.productId` — ส่งใน `jsonDetail` ของ calculate/caseclaim */
    productId?: number;
    /** `BillingDetailDto.productTypeId` (PH = 6, PA = 26) — ส่งใน request ของ calculate/caseclaim */
    productTypeId?: number;
};

const fmtDate = (v: string | undefined) => formatDateString(v, "DD/MM/BBBB");
const fmtTime = (v: string | undefined) => formatDateString(v, "HH:mm");

/**
 * Step 3 : "สรุปรายการเคลม" — Read-only ทั้งหมด
 *
 * ส่วนตัวเลข (รายการค่ารักษา/ค่าชดเชย/สรุปค่าใช้จ่ายโรงพยาบาล/บัญชีรับเงินค่าชดเชย) reuse
 * `ClaimSummaryStep3` ของ ClaimConsider ตรง ๆ และ map ผล POST /calculate/caseclaim (`useBillingCalculateHook`
 * — ส่ง `caseAdjudicationId` + `jsonDetail` ของรายการวางบิล) แบบเดียวกับ Step 3 หน้าพิจารณาเคลมโรงพยาบาล
 * (HospitalClaimDetailsTab : step3TreatmentRows / step3CompensationRows / step3Summary)
 *
 * ถ้ายังไม่มีผลคำนวณ (calculate ไม่สำเร็จ / กำลังคำนวณ) fallback เป็นยอดรวมฝั่ง FE
 * (`useBillingExpenseHook`) แบบเดิม — ตารางรายการค่ารักษา/ค่าชดเชยว่าง
 */
const BillingSummaryStep3 = ({
    hospitalName,
    submittedDate,
    showStayDays = false,
    allowSeparateCompensation = false,
    scanDocumentRows = [],
    beLabels,
    caseAdjudicationId,
    productId,
    productTypeId,
}: BillingSummaryStep3Props) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const { values } = formik;
    const labels = useBillingClaimLabels(values, beLabels);
    const expenseTotals = useBillingExpenseHook(formik);
    const { result: calculateResult, isCalculating } = useBillingCalculateHook({
        caseAdjudicationId,
        productId,
        productTypeId,
        values,
    });

    /** "รายการเบิก" ใช้ cover (สิทธิ์ความคุ้มครอง) ไม่ใช่ net — ตามหน้าพิจารณาเคลมโรงพยาบาล */
    const treatmentRows: Step3TreatmentRow[] = (calculateResult?.medicalExpense ?? []).map((item) => ({
        benefitName: item.benefitName ?? "-",
        amountNet: item.cover ?? 0,
        payAmount: item.pay ?? 0,
        unPayAmount: item.unPay ?? 0,
    }));

    const compensationRows: Step3CompensationRow[] = (calculateResult?.compensateExpense ?? []).map((item) => ({
        description: item.benefitName ?? "-",
        amount: item.pay ?? 0,
    }));

    const summary = calculateResult
        ? {
              compensateNet: calculateResult.compensateNet ?? 0,
              compensateInclude: calculateResult.compensateInclude ?? 0,
              compensateRemain: calculateResult.compensateRemain ?? 0,
              medicalNet: calculateResult.medicalNet ?? 0,
              medicalCoverPay: calculateResult.medicalCoverPay ?? 0,
              medicalCompensateInclude: calculateResult.medicalCompensateInclude ?? 0,
              medicalPay: calculateResult.medicalPay ?? 0,
              medicalUnpay: calculateResult.medicalUnpay ?? 0,
          }
        : { medicalNet: expenseTotals.totalClaimedAmount, medicalPay: expenseTotals.netAmount };

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
                    <CustomDisplayText
                        label="อาการสำคัญ (ChiefComplaint)"
                        value={values.chiefComplaintId_selectedText || labels.chiefComplaintName}
                    />
                    <CustomDisplayText label="การวินิจฉัย 1 (Diagnosis 1)" value={labels.diagnosis1Name} />
                    <CustomDisplayText label="การวินิจฉัย 2 (Diagnosis 2)" value={labels.diagnosis2Name ?? "-"} />
                    <CustomDisplayText label="การวินิจฉัย 3 (Diagnosis 3)" value={labels.diagnosis3Name ?? "-"} />
                    {labels.diagnosis4Name && (
                        <CustomDisplayText label="การวินิจฉัย 4 (Diagnosis 4)" value={labels.diagnosis4Name} />
                    )}
                    {labels.diagnosis5Name && (
                        <CustomDisplayText label="การวินิจฉัย 5 (Diagnosis 5)" value={labels.diagnosis5Name} />
                    )}
                    {labels.diagnosis6Name && (
                        <CustomDisplayText label="การวินิจฉัย 6 (Diagnosis 6)" value={labels.diagnosis6Name} />
                    )}
                    <CustomDisplayText label="หมายเหตุ" value={values.note} xs={12} />
                </Grid>
            </CustomPaper>

            <BillingScanDocumentTable rows={scanDocumentRows} />

            <CustomPaper>
                <LoadingOverlay isLoading={isCalculating} message="กำลังคำนวณสิทธิ์..." minHeight={200}>
                    <ClaimSummaryStep3
                        treatmentRows={treatmentRows}
                        compensationRows={compensationRows}
                        summary={summary}
                        totalReceipt={calculateResult?.totalReceipt}
                        totalNetAmount={calculateResult?.medicalNet}
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
                        disableAccountEdit
                    />
                </LoadingOverlay>
            </CustomPaper>
        </>
    );
};

export default BillingSummaryStep3;
