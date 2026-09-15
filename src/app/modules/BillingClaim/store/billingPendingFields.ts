/**
 * Placeholder convention สำหรับฟิลด์ที่สเปคใหม่ต้องการ แต่ contract ปัจจุบันของ `BillingDetailDto`
 * (coreClaimApi.client.ts) ยังไม่มีข้อมูลส่งมา — ดูตารางเต็มที่ docs/modules/BillingClaim.md
 * หัวข้อ "Known gaps"
 *
 * วิธีใช้:
 * - ค่าที่เป็นข้อความ (CustomDisplayText ฯลฯ) : ส่ง `PENDING_BE` ตรง ๆ เป็น value
 * - control ที่ต้อง disable (ปุ่ม, checkbox) : ใส่ `disabled` + `title={PENDING_BE_TOOLTIP}` เสมอ
 * - ตารางที่ยังไม่มี endpoint : ปล่อย data ว่าง `[]`
 *
 * ทุกจุดที่ใช้ค่าคงที่นี้ให้มี comment `// PENDING-BE: <ฟิลด์/endpoint ที่รอ>` กำกับไว้เหนือบรรทัด
 * เพื่อให้ `grep -rn "PENDING_BE" src/app/modules/BillingClaim` แสดงรายการ stub ทั้งหมดได้ในคำสั่งเดียว
 */
export const PENDING_BE = "-";

export const PENDING_BE_TOOLTIP = "รอ Backend ส่งข้อมูล (ยังไม่มีในสัญญา API ปัจจุบัน)";

/** ฟิลด์บนจอ → DTO/endpoint ที่คาดว่าจะมา — อ้างอิงกับตารางเต็มใน docs/modules/BillingClaim.md */
export const PENDING_BE_FIELDS = {
    productTypeId: "BillingDetailDto.productTypeId (แยก PA/PH)",
    claimListTypeId: "BillingDetailDto.claimListTypeId (แยก OPD Half / OPD Full / IPD)",
    schoolDetail: "BillingDetailDto.school (ข้อมูลสถานศึกษา)",
    insuredIdCardNo: "BillingInsuredDto.idCardNo",
    insuredPhoneNumber: "BillingInsuredDto.phoneNumber",
    insuredAppStatus: "BillingInsuredDto.appStatus",
    claimStatus: "BillingDetailDto.claimStatus (สถานะเคลม CL แยกจากสถานะวางบิล)",
    documentCompleteDate: "BillingClaimDto.documentCompleteDate (วันที่เอกสารครบ)",
    admitIndication: "BillingClaimDto.admitIndication (ข้อบ่งชี้การ Admit)",
    stayDays: "BillingClaimDto.ipdDays / icuDays (จำนวนวันนอน)",
    receiptAmountPerItem: "BillingExpenseDto.receiptAmount (ยอดเงินตามใบเสร็จต่อรายการ)",
    entitlementAmountPerItem: "BillingExpenseDto.entitlementAmount (สิทธิ์เบิกต่อรายการ)",
    simBCategory: "BillingReviewDataDto.simBCategory (ประเภทรายการค่าใช้จ่าย Sim B1/B2)",
    insuranceExcess: "BillingExpenseDto.isInsuranceExcess / insuranceCompanyName",
    ocrReceiptFiles: "BillingReviewDataDto.ocrReceiptFiles (ไฟล์ + สถานะ OCR ใบแจ้งค่ารักษา)",
    hospitalExpenseSummary: "BillingTotalsDto ฝั่งโรงพยาบาล (ยอดเบิก/ส่วนลด/สุทธิ จาก SmileConnect ก่อนพิจารณา)",
    benefitBreakdown: "endpoint คำนวณสิทธิ์เบิกรายการค่ารักษาราย Benefit (billing-scoped)",
    compensationSummary: "endpoint คำนวณค่าชดเชย/สรุปค่าใช้จ่ายโรงพยาบาล (billing-scoped)",
    payoutAccount: "BillingReviewDataDto.payoutAccount (บัญชีรับเงินค่าชดเชย)",
    continuousClaimDefault: "BillingReviewDataDto.continuousClaim (ค่า default จาก SmileConnect)",
    scanDocumentStep3: "BillingDetailDto.step3Documents (ตารางสแกนเอกสาร Step 3)",
    rejectionDocumentType: "GetDocumentSubTypeDtoRequest.productTypeId (billing ไม่มี productTypeId ให้ยิง master นี้)",
} as const;
