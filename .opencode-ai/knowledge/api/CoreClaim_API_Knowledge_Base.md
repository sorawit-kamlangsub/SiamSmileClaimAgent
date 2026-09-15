# CoreClaim API Knowledge Base

> Generated from `CoreClaim.json` (OpenAPI 3.0.1).
>
> **Source of Truth:** `CoreClaim.json` is the API contract. This file is an Agent-friendly knowledge index and summary.

## Rules

1. Use this file to locate the relevant API quickly.
2. If exact contract details are needed, verify the current `CoreClaim.json`.
3. If actual runtime behavior is needed, verify source code.
4. Do not invent endpoints, parameters, DTO fields, response fields, or business rules.
5. Keep this file aligned when the OpenAPI specification changes.

## Overview

- Endpoints: **106**
- Schemas: **294**

## API Domain Index

### ClaimFund

- `GET /api/ClaimFund/AdditionalTransfer/AdditionalTransferDetails` — โอนเพิ่ม รายละเอียด tep(1)
- `POST /api/ClaimFund/AdditionalTransfer/AdditionalTransferMonitor` — ตรวจสอบรายการโอนเงินเพิ่ม (Monitor)
- `GET /api/ClaimFund/AdditionalTransfer/GetAdditionalTransferAccountDetail` — รายละเอียดบัญชี (แก้ไขการโอนเงิน)
- `GET /api/ClaimFund/AdditionalTransfer/GetClaimTransaction` — ดึงประวัติการทำรายการ (Transaction) ของเคลม
- `GET /api/ClaimFund/AdditionalTransfer/GetClaimTransactions` — ประวัติการทำรายการ
- `GET /api/ClaimFund/AdditionalTransfer/GetDecreaseTransaction` — ประวัติการลดยอด (โอนเพิ่ม)
- `POST /api/ClaimFund/AdditionalTransfer/SaveAdditionalTransfer` — บันทึกการโอนเงินเพิ่ม
- `GET /api/ClaimFund/AdditionalTransfer/TransferHistory` — ประวัติการโอนเงิน
- `POST /api/ClaimFund/AdditionalTransfer/UpdateAdditionalTransfer` — แก้ไขการโอนเงินเพิ่ม
- `GET /api/ClaimFund/FailedPayTransfer/FailedPayTransferTransactionDetail` — รายละเอียด Monitor - แก้ไขการโอนเงิน
- `GET /api/ClaimFund/FailedPayTransfer/FailedPayTransferTransactionMonitor` — Monitor - แก้ไขการโอนเงิน
- `GET /api/ClaimFund/IncreaseTransfer/IncreaseTransferLimitMonitors` — Monitor ขยายวงเงิน
- `GET /api/ClaimFund/Inquiry/InquiryDetail` — สอบถามธนาคาร Inquiry Monitor รายละเอียด
- `GET /api/ClaimFund/Inquiry/InquiryMonitors` — สอบถามธนาคาร Inquiry Monitor
- `GET /api/ClaimFund/Masters/GetAdjustmentReasonById` — ข้อมูลสาเหตุการโอนเพิ่ม By Id
- `GET /api/ClaimFund/Masters/GetAdjustmentReasons` — ข้อมูลสาเหตุการโอนเพิ่ม
- `GET /api/ClaimFund/Masters/GetBankAccountRelationTypeById` — ข้อมูลประเภทความสัมพันธ์ของบัญชี กับผู้รับสินไหม By Id
- `GET /api/ClaimFund/Masters/GetBankAccountRelationTypes` — ข้อมูลประเภทความสัมพันธ์ของบัญชี กับผู้รับสินไหม
- `GET /api/ClaimFund/Masters/GetCaseRefundRejectReasons` — สาเหตุที่ปฏิเสธ
- `GET /api/ClaimFund/Masters/GetPaymentStatuses` — ข้อมูลสถานะการจ่ายเงิน (Payment Status)
- `GET /api/ClaimFund/Masters/GetRefundReasonById` — ข้อมูลสาเหตุการโอนคืน By Id
- `GET /api/ClaimFund/Masters/GetRefundReasons` — ข้อมูลสาเหตุการโอนคืน
- `GET /api/ClaimFund/Masters/GetRefundStatus` — Get สถานะการคืนเงิน
- `GET /api/ClaimFund/Refund/CaseRefundApproveDetail` — รายละเอียดการ อนุมัติคืนเงิน
- `POST /api/ClaimFund/Refund/CreateCaseRefund` — สร้างรายการเงินคืนเงิน
- `GET /api/ClaimFund/Refund/GetClaimTransaction` — ดึงประวัติการทำรายการ (Transaction) ของเคลมสำหรับการคืนเงิน (Refund)
- `GET /api/ClaimFund/Refund/GetDecreaseTransaction` — ประวัติการลดยอดสำหรับการคืนเงิน (Refund)
- `POST /api/ClaimFund/Refund/RefundApproveMonitor` — Monitor approve
- `POST /api/ClaimFund/Refund/RefundMonitor` — Monitor การคืนเงิน (Refund)
- `GET /api/ClaimFund/Refund/SaveRefundAccountDetail` — รายละเอียดบัญชีสำหรับการคืนเงิน (Refund)
- `GET /api/ClaimFund/Refund/SaveRefundDetails` — รายละเอียดการคืนเงิน (Refund)
- `GET /api/ClaimFund/Refund/TransferHistory` — ประวัติการโอนเงินสำหรับการคืนเงิน (Refund)
- `GET /api/ClaimFund/Setting/GetCurrentSetting` — ตั้งค่าการโอนเงิน
- `GET /api/ClaimFund/Setting/SearchClaimOrCase` — ค้นหารายการจาก เลขที่ ClaimNo / CaseNo
- `POST /api/ClaimFund/Setting/UpdateSettingAutoTransfer` — บันทึกการตั้งค่าการโอนเงิน

### CoreClaim

- `POST /api/calculate/caseclaim` — API สำหรับ Calculate ข้อมูล Case Claim | `CalculateCaseClaim`
- `GET /api/calculate/disability` — API สำหรับ Calculate ข้อมูล Case Disability (สูยเสียอวัยวะ) | `CalculateCaseDisability`
- `GET /api/claim/case/filter` — API สำหรับ Get ข้อมูล Case By ClaimId | `GetCaseByClaimId`
- `GET /api/claim/continue/filter` — API สำหรับ Get ข้อมูล การเคลมต่อเนื่อง | `GetClaimContinue`
- `GET /api/claim/customer-monitor/filter` — API สำหรับ Get ข้อมูล CustomerClaim Adjudication Monitor | `GetCustomerClaimAdjudicationMonitor`
- `POST /api/claim/decision` — API สำหรับ บันทึกผลพิจารณาเคลม | `UpsertClaimDecision`
- `POST /api/claim/decision/approve` — อนุมัติผลพิจารณา | `ApproveClaimDecision`
- `POST /api/claim/decision/draft` — API สำหรับ บันทึกผลพิจารณาเคลม [บันทึกแบบร่าง] | `SaveClaimEditDraft`
- `GET /api/claim/decision/draft/revision` — API สำหรับอ่าน Claim Edit Draft Revision พร้อมข้อมูล Payload ที่แปลงแล้ว | `GetClaimEditDraftRevision`
- `GET /api/claim/detail/consider/{claimId}/{caseId}` — API สำหรับ Get ข้อมูลรายละเอียด Claim พิจารณา | `GetClaimDetailConsider`
- `GET /api/claim/history/filter` — API สำหรับ Get ข้อมูล ประวัติการเคลม | `GetClaimHistory`
- `GET /api/claim/hospital-monitor/filter` — API สำหรับ Get ข้อมูล HospitalClaim Adjudication Monitor | `GetHospitalClaimAdjudicationMonitor`
- `GET /api/claim/transaction-log/filter` — API สำหรับ Get ข้อมูล TransactionLog Claim (ประวัติการทำรายการ) | `GetClaimTransactionLog`
- `GET /api/claim/{claimId}/previous` — API สำหรับ Get ข้อมูลเคลมก่อนหน้า | `GetPreviousClaim`
- `POST /api/create/continued-claim` — เพิ่ม Case ใหม่ภายใต้ Claim เดิมโดยอ้างอิง ClaimId | `CreateContinuedClaim`
- `POST /api/create/coreclaim` — API สำหรับ Create ข้อมูล CoreClaim | `CreateCoreClaim`
- `GET /api/customer/benefit-detail/half` — API สำหรับ Get Customer Benefit Detail Half | `GetCustomerBenefitDetailHalf`
- `GET /api/customer/benefit-detail/search` — API สำหรับ Search Customer Benefit Detail | `GetCustomerBenefitDetailSearch`
- `GET /api/customer/contact-person` — API สำหรับ Get ข้อมูล Contact Person | `GetContactPerson`
- `GET /api/customer/policybenefit-shered` — API สำหรับ Get ข้อมูล Policy Benefit Shered (สิทธิประโยชน์ร่วม) | `GetPolicyBenefitShered`
- `GET /api/customer/search` — API สำหรับ Search Customer | `GetCustomerSearch`
- `GET /api/customer/search-by-policy-code` — API สำหรับ Search Customer By PolicyCode | `GetCustomerSearchByPolicyCode`
- `GET /api/customer/{applicationId}/bank-account` — API สำหรับ Get ข้อมูล Customer BankAccount | `GetCustomerBankAccount`
- `GET /api/customer/{id}/detail` — API สำหรับ Get ข้อมูล Customer Detail By Id | `GetCustomerDetailById`
- `GET /api/dashboard/customer-consider/filter` — Service สำหรับ Get ข้อมูล Dashboard Customer Consider (พิจารณาเคลมลูกค้า) | `GetDashboardCustomerConsider`
- `GET /api/dcr/filter` — API สำหรับ Get ข้อมูล DCR (การชำระเงิน) | `GetDCR`
- `POST /api/document-subtype` — API สำหรับ Get ข้อมูล DocumentSubType , documentTypeId : เอกสารของโปรเจค , documentPrefix : คำนำหน้ารหัสเอกสาร, documentSubTypeIdList = รายการรหัสเอกสารย่อยที่ต้องการแสดง | `GetDocumentSubType`
- `GET /api/document/case/filter` — API สำหรับ Get ข้อมูล Document By CaseId | `GetDocumentByCaseId`
- `GET /api/document/case/{caseId}/overview` — API สำหรับแสดงข้อมูลภาพรวมการตรวจสอบเอกสาร ผลการพิจารณา และรายการค่าใช้จ่ายของ Case | `GetCaseReviewOverview`
- `GET /api/policy/benefit` — API สำหรับ Get ข้อมูล PolicyBenefit (ความคุ้มครอง) | `GetPolicyBenefit`
- `GET /api/standard-medical-expense/case` — API สำหรับ Get ข้อมูล รายการค่ารักษา(เบื้องต้น) Default จาก CaseItem จากหน้าแจ้งเคลม | `GetStandardMedicalExpenseByCase`

### HospitalBilling

- `GET /api/billing/hospital/filter` — ค้นหารายการวางบิลโรงพยาบาลและคืน dashboard counts ตาม BillingDetail.
- `GET /api/billing/hospital/{billingDetailId}` — อ่านรายละเอียดรอบวางบิลสำหรับตรวจสอบหรือดูผลที่บันทึกไว้.
- `GET /api/billing/hospital/{billingDetailId}/history` — อ่านประวัติรอบวางบิลและ immutable review revisions ของ Case.
- `POST /api/billing/hospital/{billingDetailId}/submit` — ยืนยันผลตรวจสอบและบันทึก immutable review revision พร้อม return request แบบ atomic.

### IClaim

- `GET /api/IClaim/check-eligible` — API สำหรับ Get ข้อมูล เช็คสิทธิ์ความคุ้มครอง | `CheckEligible`
- `POST /api/IClaim/claim/history/check` — API สำหรับตรวจสอบประวัติ Claim ของผู้เอาประกัน | `CheckClaimHistory`
- `POST /api/IClaim/customer/checkeligible` — API สำหรับรวมข้อมูล Customer และ Benefit ตามประเภทการรักษา OPD หรือ IPD | `CheckEligibleCustomer`

### Masters

- `GET /api/Masters/adjustment/reason` — API สำหรับ Get ข้อมูล AdjustmentReason (AdjustmentTypeId 2 = โอนเพิ่ม, 3 = คืนเงิน) | `GetAdjustmentReason`
- `GET /api/Masters/bank` — API สำหรับ Get ข้อมูล Organize (ธนาคาร) | `GetAllBank`
- `GET /api/Masters/bankaccount/relation/type` — API สำหรับ Get ข้อมูล BankAccountRelationType (ประเภทความสัมพันธ์ของบัญชีธนาคาร) BankAccountRelationGroupId : 1 = PH , PA , ClaimMisc : 2 = Motor | `GetBankAccountRelationType`
- `GET /api/Masters/beneficiary` — API สำหรับ Get ข้อมูล Beneficiary (ผู้รับผลประโยชน์) By PolicyCode | `GetBeneficiary`
- `GET /api/Masters/benefit` — API สำหรับ Get ข้อมูล Benefit (ผลประโยชน์) | `GetBenefit`
- `GET /api/Masters/branch` — API สำหรับ Get ข้อมูล Branch (สาขา) | `GetBranch`
- `GET /api/Masters/chiefcomplaint` — API สำหรับ Get ข้อมูล ChiefComplaint (อาการสำคัญที่ผู้เคลมแจ้ง) | `GetChiefComplaint`
- `GET /api/Masters/claim/decision` — API สำหรับ Get ข้อมูล Decision (ผลการพิจารณา) | `GetDecision`
- `GET /api/Masters/claim/decision/reason` — API สำหรับ Get ข้อมูล DecisionReason (สาเหตุจากผลการพิจารณา) | `GetDecisionReason`
- `GET /api/Masters/claim/transaction-type` — API สำหรับ Get ข้อมูล ClaimTransactionType (ประเภทธุรกรรมเคลม) | `GetClaimTransactionType`
- `GET /api/Masters/contactperson/type` — API สำหรับ Get ข้อมูล ContactPersonType (ประเภทผู้ติดต่อ) ContactPersonGroupId : 1 = PH , DeathClaim : 2 = PA, 3 = Motor | `GetContactPersonType`
- `GET /api/Masters/deduction-source` — API สำหรับ Get ข้อมูล DeductionSource (ช่องทางการหักเงิน) | `GetDeductionSource`
- `GET /api/Masters/disability/bodypart` — API สำหรับ Get จ้อมูล BodyPart by DisabilityLossPartId | `GetBodyPartByDisabilityLossPart`
- `GET /api/Masters/disability/losspart` — API สำหรับ Get ข้อมูล DisabilityLossPart (ส่วนของร่างกายที่พิการ) | `GetDisabilityLossPart`
- `GET /api/Masters/document/recipient-type` — API สำหรับ Get ข้อมูล DocumentRecipientType (ประเภทผู้รับเอกสาร) | `GetDocumentRecipientType`
- `GET /api/Masters/document/review/status` — API สำหรับ Get ข้อมูล DocumentReviewStatus (สถานะการตรวจเอกสาร) | `GetDocumentReviewStatus`
- `GET /api/Masters/employee-payment-limit/{userId}` — API สำหรับ Get ข้อมูล EmployeeClaimPaymentLimit (วงเงินผู้คีย์เคลม)
- `GET /api/Masters/formatType` — API สำหรับ Get ข้อมูล FormatType (ประการจ่าย) | `GetFormatType`
- `GET /api/Masters/hospital` — API สำหรับ Get ข้อมูล Organize (โรงพยาบาล) | `GetAllHospital`
- `GET /api/Masters/icd10` — API สำหรับ Get ข้อมูล ICD10 (รหัสวินิจฉัยโรค) | `GetICD10`
- `GET /api/Masters/incidenttype` — API สำหรับ Get ข้อมูล IncidentType (เหตุของการเคลม) | `GetIncidentType`
- `GET /api/Masters/incidenttype/mapping` — API สำหรับ Get ข้อมูล CoverageType, MedicalType, CauseOfIncident By IncidentTypeId | `GetIncidentTypeMapping`
- `GET /api/Masters/insurance/filter` — API สำหรับ Get ข้อมูล Organize (บริษัทประกัน) | `GetInsuranceCompany`
- `GET /api/Masters/noncoveredreason` — API สำหรับ Get ข้อมูล NonCoveredReason (สาเหตุที่ไม่คุ้มครอง) | `GetNonCoveredReason`
- `GET /api/Masters/paymentstatus` — API สำหรับ Get ข้อมูล PaymentStatus (สถานะการโอนเงิน) | `GetPaymentStatus`
- `GET /api/Masters/province` — API สำหรับ Get ข้อมูล Province List (จังหวัด) | `GetProvince`
- `GET /api/Masters/relationtype` — API สำหรับ Get ข้อมูล RelationType (ประเภทความสัมพันธ์) | `GetRelationType`
- `GET /api/Masters/school` — API สำหรับ Get ข้อมูล Organize (โรงเรียน) | `GetSchoolByProvinceId`
- `GET /api/Masters/simb` — API สำหรับ Get ข้อมูล SIMB | `GetSimB`
- `GET /api/Masters/simb/category` — API สำหรับ Get ข้อมูล SIMB Category | `GetSimBCategory`
- `GET /api/Masters/title` — API สำหรับ Get ข้อมูล Title (คำนำหน้าชื่อ) personTypeId : 1, 3 = สถานที่ , 2 = บุคคล | `GetTitle`
- `GET /api/Masters/users` — API สำหรับ Get ข้อมูลพนักงาน
- `GET /api/Masters/zebracar/owner` — API สำหรับ Get ข้อมูล ZebraCarOwner (เจ้าของรถม้าลาย) | `GetZebraCarOwner`

## Endpoint Details

### ClaimFund

#### `GET /api/ClaimFund/AdditionalTransfer/AdditionalTransferDetails`
- Summary: โอนเพิ่ม รายละเอียด tep(1)
- Parameters:
  - `caseId` — `query`, optional, `string`
- Responses:
  - `200` → `AdditionalTransferDetailsResponseDtoServiceResponse`
  - `401`
  - `403`

#### `POST /api/ClaimFund/AdditionalTransfer/AdditionalTransferMonitor`
- Summary: ตรวจสอบรายการโอนเงินเพิ่ม (Monitor)
- Parameters:
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Request Body: `AdditionalTransferMonitorRequestDto`
- Responses:
  - `200` → `usp_AdditionalTransferMonitor_SelectResultListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/AdditionalTransfer/GetAdditionalTransferAccountDetail`
- Summary: รายละเอียดบัญชี (แก้ไขการโอนเงิน)
- Parameters:
  - `paymentId` — `query`, optional, `string`
- Responses:
  - `200` → `AdditionalTransferAccountDetailsResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/AdditionalTransfer/GetClaimTransaction`
- Summary: ดึงประวัติการทำรายการ (Transaction) ของเคลม
- Parameters:
  - `caseId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `AdditionalTransferTransactionResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/AdditionalTransfer/GetClaimTransactions`
- Summary: ประวัติการทำรายการ
- Parameters:
  - `caseId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `AdditionalTransferTransactionResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/AdditionalTransfer/GetDecreaseTransaction`
- Summary: ประวัติการลดยอด (โอนเพิ่ม)
- Parameters:
  - `caseId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDecreaseTransactionResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `POST /api/ClaimFund/AdditionalTransfer/SaveAdditionalTransfer`
- Summary: บันทึกการโอนเงินเพิ่ม
- Request Body: `SaveAdditionalTransferRequest`
- Responses:
  - `200` → `SaveAdditionalTransferResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/AdditionalTransfer/TransferHistory`
- Summary: ประวัติการโอนเงิน
- Parameters:
  - `caseId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `TransferTransactionResponseDtoServiceResponse`
  - `401`
  - `403`

#### `POST /api/ClaimFund/AdditionalTransfer/UpdateAdditionalTransfer`
- Summary: แก้ไขการโอนเงินเพิ่ม
- Request Body: `UpdateAdditionalTransferRequestDto`
- Responses:
  - `200` → `UpdateAdditionalTransferResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/FailedPayTransfer/FailedPayTransferTransactionDetail`
- Summary: รายละเอียด Monitor - แก้ไขการโอนเงิน
- Parameters:
  - `PayTransferTransactionId` — `query`, required, `string`
- Responses:
  - `200` → `FailedPayTransferTransactionResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/FailedPayTransfer/FailedPayTransferTransactionMonitor`
- Summary: Monitor - แก้ไขการโอนเงิน
- Parameters:
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `usp_FailedPayTransferTransaction_SelectResultListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/IncreaseTransfer/IncreaseTransferLimitMonitors`
- Summary: Monitor ขยายวงเงิน
- Parameters:
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `IncreaseTransferLimitMonitorResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Inquiry/InquiryDetail`
- Summary: สอบถามธนาคาร Inquiry Monitor รายละเอียด
- Parameters:
  - `PayTransferTransactionId` — `query`, required, `string`
- Responses:
  - `200` → `BankInquiryDetailResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Inquiry/InquiryMonitors`
- Summary: สอบถามธนาคาร Inquiry Monitor
- Parameters:
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `usp_InquiryMonitor_SelectResultListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Masters/GetAdjustmentReasonById`
- Summary: ข้อมูลสาเหตุการโอนเพิ่ม By Id
- Parameters:
  - `AdjustmentReasonId` — `query`, optional, `integer`
- Responses:
  - `200` → `AdjustmentReasonResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Masters/GetAdjustmentReasons`
- Summary: ข้อมูลสาเหตุการโอนเพิ่ม
- Parameters:
  - `AdjustmentTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `AdjustmentReasonResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Masters/GetBankAccountRelationTypeById`
- Summary: ข้อมูลประเภทความสัมพันธ์ของบัญชี กับผู้รับสินไหม By Id
- Parameters:
  - `bankAccountRelationTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `BankAccountRelationTypeResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Masters/GetBankAccountRelationTypes`
- Summary: ข้อมูลประเภทความสัมพันธ์ของบัญชี กับผู้รับสินไหม
- Responses:
  - `200` → `BankAccountRelationTypeResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Masters/GetCaseRefundRejectReasons`
- Summary: สาเหตุที่ปฏิเสธ
- Responses:
  - `200` → `CaseRefundRejectReasonResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Masters/GetPaymentStatuses`
- Summary: ข้อมูลสถานะการจ่ายเงิน (Payment Status)
- Responses:
  - `200` → `PaymentStatusResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Masters/GetRefundReasonById`
- Summary: ข้อมูลสาเหตุการโอนคืน By Id
- Parameters:
  - `refundReasonId` — `query`, optional, `integer`
- Responses:
  - `200` → `RefundReasonResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Masters/GetRefundReasons`
- Summary: ข้อมูลสาเหตุการโอนคืน
- Responses:
  - `200` → `RefundReasonResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Masters/GetRefundStatus`
- Summary: Get สถานะการคืนเงิน
- Responses:
  - `200` → `RefundStatusResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Refund/CaseRefundApproveDetail`
- Summary: รายละเอียดการ อนุมัติคืนเงิน
- Parameters:
  - `caseRefundId` — `query`, optional, `string`
- Responses:
  - `200` → `CaseRefundApproveDetailResponseDtoServiceResponse`
  - `401`
  - `403`

#### `POST /api/ClaimFund/Refund/CreateCaseRefund`
- Summary: สร้างรายการเงินคืนเงิน
- Request Body: `CreateRefundRequestDto`
- Responses:
  - `200` → `CreateRefundResponsetDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Refund/GetClaimTransaction`
- Summary: ดึงประวัติการทำรายการ (Transaction) ของเคลมสำหรับการคืนเงิน (Refund)
- Parameters:
  - `caseId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `RefundTransactionResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Refund/GetDecreaseTransaction`
- Summary: ประวัติการลดยอดสำหรับการคืนเงิน (Refund)
- Parameters:
  - `caseId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDecreaseTransactionRefundResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `POST /api/ClaimFund/Refund/RefundApproveMonitor`
- Summary: Monitor approve
- Parameters:
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Request Body: `RefundApproveMonitorRequestDto`
- Responses:
  - `200` → `RefundApproveMonitorResponseListServiceResponse`
  - `401`
  - `403`

#### `POST /api/ClaimFund/Refund/RefundMonitor`
- Summary: Monitor การคืนเงิน (Refund)
- Parameters:
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Request Body: `RefundMonitorRequestDto`
- Responses:
  - `200` → `RefundMonitorResponseListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Refund/SaveRefundAccountDetail`
- Summary: รายละเอียดบัญชีสำหรับการคืนเงิน (Refund)
- Parameters:
  - `paymentId` — `query`, required, `string`
- Responses:
  - `200` → `RefundDetailsAccountDetailsResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Refund/SaveRefundDetails`
- Summary: รายละเอียดการคืนเงิน (Refund)
- Parameters:
  - `caseId` — `query`, required, `string`
- Responses:
  - `200` → `SaveRefundDetailsResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Refund/TransferHistory`
- Summary: ประวัติการโอนเงินสำหรับการคืนเงิน (Refund)
- Parameters:
  - `caseId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `RefundTransferTransactionResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Setting/GetCurrentSetting`
- Summary: ตั้งค่าการโอนเงิน
- Responses:
  - `200` → `PayTransferSettingResponseDtoServiceResponse`
  - `401`
  - `403`

#### `GET /api/ClaimFund/Setting/SearchClaimOrCase`
- Summary: ค้นหารายการจาก เลขที่ ClaimNo / CaseNo
- Parameters:
  - `searchDetail` — `query`, required, `string`
- Responses:
  - `200` → `SearchClaimOrCaseResponseDtoListServiceResponse`
  - `401`
  - `403`

#### `POST /api/ClaimFund/Setting/UpdateSettingAutoTransfer`
- Summary: บันทึกการตั้งค่าการโอนเงิน
- Request Body: `UpdatePayTransferSettingRequestDto`
- Responses:
  - `200` → `UpdatePayTransferSettingRequestDtoServiceResponse`
  - `401`
  - `403`

### CoreClaim

#### `POST /api/calculate/caseclaim`
- Summary: API สำหรับ Calculate ข้อมูล Case Claim
- OperationId: `CalculateCaseClaim`
- Request Body: `CalculateCaseClaimDtoRequest`
- Responses:
  - `200` → `CalculateCaseClaimDtoResponseServiceResponse`

#### `GET /api/calculate/disability`
- Summary: API สำหรับ Calculate ข้อมูล Case Disability (สูยเสียอวัยวะ)
- OperationId: `CalculateCaseDisability`
- Parameters:
  - `customerId` — `query`, optional, `integer`
  - `bodyPartId` — `query`, optional, `integer`
  - `standardMedicalExpenseId` — `query`, optional, `integer`
- Responses:
  - `200` → `CalculateCaseDisabilityDtoResponseServiceResponse`

#### `GET /api/claim/case/filter`
- Summary: API สำหรับ Get ข้อมูล Case By ClaimId
- OperationId: `GetCaseByClaimId`
- Parameters:
  - `claimId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetCaseByClaimIdDtoResponseListServiceResponse`

#### `GET /api/claim/continue/filter`
- Summary: API สำหรับ Get ข้อมูล การเคลมต่อเนื่อง
- OperationId: `GetClaimContinue`
- Parameters:
  - `applicationId` — `query`, optional, `string`
  - `initialClaimId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetClaimContinueDtoResponseListServiceResponse`

#### `GET /api/claim/customer-monitor/filter`
- Summary: API สำหรับ Get ข้อมูล CustomerClaim Adjudication Monitor
- OperationId: `GetCustomerClaimAdjudicationMonitor`
- Parameters:
  - `dateOption` — `query`, optional, `integer`
  - `dateFrom` — `query`, optional, `string`
  - `dateTo` — `query`, optional, `string`
  - `isProductTypeId_PH` — `query`, optional, `boolean`
  - `isProductTypeId_PA` — `query`, optional, `boolean`
  - `claimTransactionTypeId` — `query`, optional, `integer`
  - `searchOption` — `query`, optional, `integer`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetCustomerClaimAdjudicationMonitorDtoResponseListServiceResponse`

#### `POST /api/claim/decision`
- Summary: API สำหรับ บันทึกผลพิจารณาเคลม
- OperationId: `UpsertClaimDecision`
- Request Body: `UpsertClaimDecisionDtoRequest`
- Responses:
  - `200` → `UpsertClaimDecisionDtoResponseServiceResponse`

#### `POST /api/claim/decision/approve`
- Summary: อนุมัติผลพิจารณา
- OperationId: `ApproveClaimDecision`
- Request Body: `ApproveClaimDecisionDtoRequest`
- Responses:
  - `200` → `UpsertClaimDecisionDtoResponseServiceResponse`

#### `POST /api/claim/decision/draft`
- Summary: API สำหรับ บันทึกผลพิจารณาเคลม [บันทึกแบบร่าง]
- OperationId: `SaveClaimEditDraft`
- Request Body: `SaveClaimEditDraftDtoRequest`
- Responses:
  - `200` → `SaveClaimEditDraftDtoResponeServiceResponse`

#### `GET /api/claim/decision/draft/revision`
- Summary: API สำหรับอ่าน Claim Edit Draft Revision พร้อมข้อมูล Payload ที่แปลงแล้ว
- OperationId: `GetClaimEditDraftRevision`
- Parameters:
  - `DraftRevisionId` — `query`, optional, `string`
- Responses:
  - `200` → `GetClaimEditDraftRevisionDtoResponseServiceResponse`
  - `500` → `GetClaimEditDraftRevisionDtoResponseServiceResponse`

#### `GET /api/claim/detail/consider/{claimId}/{caseId}`
- Summary: API สำหรับ Get ข้อมูลรายละเอียด Claim พิจารณา
- OperationId: `GetClaimDetailConsider`
- Parameters:
  - `claimId` — `path`, required, `string`
  - `caseId` — `path`, required, `string`
- Responses:
  - `200` → `GetClaimDetailConsiderDtoResponseServiceResponse`

#### `GET /api/claim/history/filter`
- Summary: API สำหรับ Get ข้อมูล ประวัติการเคลม
- OperationId: `GetClaimHistory`
- Parameters:
  - `applicationId` — `query`, optional, `string`
  - `incidentTypeId` — `query`, optional, `integer`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetClaimHistoryDtoResponseListServiceResponse`

#### `GET /api/claim/hospital-monitor/filter`
- Summary: API สำหรับ Get ข้อมูล HospitalClaim Adjudication Monitor
- OperationId: `GetHospitalClaimAdjudicationMonitor`
- Parameters:
  - `dateOption` — `query`, optional, `integer`
  - `dateFrom` — `query`, optional, `string`
  - `dateTo` — `query`, optional, `string`
  - `isProductTypeId_PH` — `query`, optional, `boolean`
  - `isProductTypeId_PA` — `query`, optional, `boolean`
  - `claimTransactionTypeId` — `query`, optional, `integer`
  - `searchOption` — `query`, optional, `integer`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetHospitalClaimAdjudicationMonitorDtoResponseListServiceResponse`

#### `GET /api/claim/transaction-log/filter`
- Summary: API สำหรับ Get ข้อมูล TransactionLog Claim (ประวัติการทำรายการ)
- OperationId: `GetClaimTransactionLog`
- Parameters:
  - `claimId` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetClaimTransactionLogDtoResponseListServiceResponse`

#### `GET /api/claim/{claimId}/previous`
- Summary: API สำหรับ Get ข้อมูลเคลมก่อนหน้า
- OperationId: `GetPreviousClaim`
- Parameters:
  - `claimId` — `path`, required, `string`
- Responses:
  - `200` → `GetPreviousClaimDtoResponseServiceResponse`

#### `POST /api/create/continued-claim`
- Summary: เพิ่ม Case ใหม่ภายใต้ Claim เดิมโดยอ้างอิง ClaimId
- OperationId: `CreateContinuedClaim`
- Request Body: `CreateContinuedClaimDtoRequest`
- Responses:
  - `200` → `CreateCoreClaimDtoResponseServiceResponse`

#### `POST /api/create/coreclaim`
- Summary: API สำหรับ Create ข้อมูล CoreClaim
- OperationId: `CreateCoreClaim`
- Request Body: `CreateCoreClaimV2DtoRequest`
- Responses:
  - `200` → `CreateCoreClaimDtoResponseServiceResponse`

#### `GET /api/customer/benefit-detail/half`
- Summary: API สำหรับ Get Customer Benefit Detail Half
- OperationId: `GetCustomerBenefitDetailHalf`
- Parameters:
  - `policyCode` — `query`, optional, `string`
  - `incidentDate` — `query`, optional, `string`
  - `isContinue` — `query`, optional, `boolean`
  - `incidentTypeId` — `query`, optional, `integer`
  - `coverageTypeId` — `query`, optional, `integer`
  - `medicalTypeId` — `query`, optional, `integer`
  - `causeOfIncidentId` — `query`, optional, `integer`
  - `formatTypeId` — `query`, optional, `integer`
  - `CusTomerTypeCode` — `query`, optional, `string`
  - `CustomerCode` — `query`, optional, `string`
  - `claimNo` — `query`, optional, `string`
- Responses:
  - `200` → `GetCustomerBenefitDetailHalfDtoResponseListServiceResponse`

#### `GET /api/customer/benefit-detail/search`
- Summary: API สำหรับ Search Customer Benefit Detail
- OperationId: `GetCustomerBenefitDetailSearch`
- Parameters:
  - `policyCode` — `query`, optional, `string`
  - `incidentDate` — `query`, optional, `string`
  - `isContinue` — `query`, optional, `boolean`
  - `incidentTypeId` — `query`, optional, `integer`
  - `coverageTypeId` — `query`, optional, `integer`
  - `medicalTypeId` — `query`, optional, `integer`
  - `claimNo` — `query`, optional, `string`
  - `customerTypeCode` — `query`, optional, `string`
- Responses:
  - `200` → `GetCustomerBenefitDetailSearchDtoResponseListServiceResponse`

#### `GET /api/customer/contact-person`
- Summary: API สำหรับ Get ข้อมูล Contact Person
- OperationId: `GetContactPerson`
- Parameters:
  - `applicationId` — `query`, required, `string`
  - `productTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetContactPersonDtoResponseListServiceResponse`

#### `GET /api/customer/policybenefit-shered`
- Summary: API สำหรับ Get ข้อมูล Policy Benefit Shered (สิทธิประโยชน์ร่วม)
- OperationId: `GetPolicyBenefitShered`
- Parameters:
  - `applicaitonCode` — `query`, optional, `string`
  - `customerTypeCode` — `query`, optional, `string`
- Responses:
  - `200` → `GetPolicyBenefitSheredDtoResponseListServiceResponse`

#### `GET /api/customer/search`
- Summary: API สำหรับ Search Customer
- OperationId: `GetCustomerSearch`
- Parameters:
  - `searchIndex` — `query`, optional, `integer`
  - `isSeachDetail` — `query`, optional, `boolean`
  - `incidentDate` — `query`, optional, `string`
  - `schoolId` — `query`, optional, `integer`
  - `provinceId` — `query`, optional, `integer`
  - `incidentTypeId` — `query`, optional, `integer`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetCustomerSearchDtoResponseListServiceResponse`

#### `GET /api/customer/search-by-policy-code`
- Summary: API สำหรับ Search Customer By PolicyCode
- OperationId: `GetCustomerSearchByPolicyCode`
- Parameters:
  - `policyCode` — `query`, optional, `string`
  - `searchIndex` — `query`, optional, `integer`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetCustomerSearchByPolicyCodeDtoResponseListServiceResponse`

#### `GET /api/customer/{applicationId}/bank-account`
- Summary: API สำหรับ Get ข้อมูล Customer BankAccount
- OperationId: `GetCustomerBankAccount`
- Parameters:
  - `applicationId` — `path`, required, `string`
- Responses:
  - `200` → `GetCustomerBankAccountDtoResponseListServiceResponse`

#### `GET /api/customer/{id}/detail`
- Summary: API สำหรับ Get ข้อมูล Customer Detail By Id
- OperationId: `GetCustomerDetailById`
- Parameters:
  - `id` — `path`, required, `integer`
- Responses:
  - `200` → `GetCustomerDetailByIdDtoResponseServiceResponse`

#### `GET /api/dashboard/customer-consider/filter`
- Summary: Service สำหรับ Get ข้อมูล Dashboard Customer Consider (พิจารณาเคลมลูกค้า)
- OperationId: `GetDashboardCustomerConsider`
- Parameters:
  - `dateOption` — `query`, optional, `integer`
  - `dateFrom` — `query`, optional, `string`
  - `dateTo` — `query`, optional, `string`
- Responses:
  - `200` → `GetDashboardCustomerConsiderDtoResponseListServiceResponse`

#### `GET /api/dcr/filter`
- Summary: API สำหรับ Get ข้อมูล DCR (การชำระเงิน)
- OperationId: `GetDCR`
- Parameters:
  - `applicationCode` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDCRDtoResponseListServiceResponse`

#### `POST /api/document-subtype`
- Summary: API สำหรับ Get ข้อมูล DocumentSubType , documentTypeId : เอกสารของโปรเจค , documentPrefix : คำนำหน้ารหัสเอกสาร, documentSubTypeIdList = รายการรหัสเอกสารย่อยที่ต้องการแสดง
- OperationId: `GetDocumentSubType`
- Request Body: `GetDocumentSubTypeDtoRequest`
- Responses:
  - `200` → `GetDocumentSubTypeDtoResponseListServiceResponse`

#### `GET /api/document/case/filter`
- Summary: API สำหรับ Get ข้อมูล Document By CaseId
- OperationId: `GetDocumentByCaseId`
- Parameters:
  - `caseId` — `query`, optional, `string`
  - `productTypeId` — `query`, optional, `integer`
  - `claimSourceId` — `query`, optional, `integer`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDocumentByCaseIdDtoResponseListServiceResponse`

#### `GET /api/document/case/{caseId}/overview`
- Summary: API สำหรับแสดงข้อมูลภาพรวมการตรวจสอบเอกสาร ผลการพิจารณา และรายการค่าใช้จ่ายของ Case
- OperationId: `GetCaseReviewOverview`
- Parameters:
  - `caseId` — `path`, required, `string`
- Responses:
  - `200` → `GetCaseReviewOverviewDtoResponseServiceResponse`

#### `GET /api/policy/benefit`
- Summary: API สำหรับ Get ข้อมูล PolicyBenefit (ความคุ้มครอง)
- OperationId: `GetPolicyBenefit`
- Parameters:
  - `productTypeId` — `query`, optional, `integer`
  - `applicationCode` — `query`, optional, `string`
  - `productId` — `query`, optional, `integer`
  - `customerTypeCode` — `query`, optional, `string`
- Responses:
  - `200` → `GetPolicyBenefitDtoResponseListServiceResponse`

#### `GET /api/standard-medical-expense/case`
- Summary: API สำหรับ Get ข้อมูล รายการค่ารักษา(เบื้องต้น) Default จาก CaseItem จากหน้าแจ้งเคลม
- OperationId: `GetStandardMedicalExpenseByCase`
- Parameters:
  - `caseId` — `query`, required, `string`
  - `formatTypeId` — `query`, optional, `integer`
  - `coverageTypeId` — `query`, optional, `integer`
  - `medicalTypeId` — `query`, optional, `integer`
  - `isUseOften` — `query`, optional, `boolean`
  - `productTypeId` — `query`, optional, `integer`
  - `causeOfIncidentId` — `query`, optional, `integer`
  - `productId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetStandardMedicalExpenseByCaseDtoResponseListServiceResponse`

### HospitalBilling

#### `GET /api/billing/hospital/filter`
- Summary: ค้นหารายการวางบิลโรงพยาบาลและคืน dashboard counts ตาม BillingDetail.
- Parameters:
  - `StatusId` — `query`, optional, `integer`
  - `SearchBy` — `query`, optional, `string`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `BillingListDtoServiceResponse`
  - `400` → `BillingListDtoServiceResponse`
  - `401` → `ProblemDetails`
  - `403` → `ProblemDetails`
  - `500` → `BillingListDtoServiceResponse`

#### `GET /api/billing/hospital/{billingDetailId}`
- Summary: อ่านรายละเอียดรอบวางบิลสำหรับตรวจสอบหรือดูผลที่บันทึกไว้.
- Parameters:
  - `billingDetailId` — `path`, required, `string`
- Responses:
  - `200` → `BillingDetailDtoServiceResponse`
  - `401` → `ProblemDetails`
  - `403` → `ProblemDetails`
  - `404` → `BillingDetailDtoServiceResponse`
  - `500` → `BillingDetailDtoServiceResponse`

#### `GET /api/billing/hospital/{billingDetailId}/history`
- Summary: อ่านประวัติรอบวางบิลและ immutable review revisions ของ Case.
- Parameters:
  - `billingDetailId` — `path`, required, `string`
- Responses:
  - `200` → `BillingHistoryDtoServiceResponse`
  - `401` → `ProblemDetails`
  - `403` → `ProblemDetails`
  - `404` → `BillingHistoryDtoServiceResponse`
  - `500` → `BillingHistoryDtoServiceResponse`

#### `POST /api/billing/hospital/{billingDetailId}/submit`
- Summary: ยืนยันผลตรวจสอบและบันทึก immutable review revision พร้อม return request แบบ atomic.
- Parameters:
  - `billingDetailId` — `path`, required, `string`
- Request Body: `SubmitHospitalBillingDto`
- Responses:
  - `200` → `BillingSubmitResultDtoServiceResponse`
  - `400` → `BillingSubmitResultDtoServiceResponse`
  - `401` → `ProblemDetails`
  - `403` → `ProblemDetails`
  - `404` → `BillingSubmitResultDtoServiceResponse`
  - `409` → `BillingSubmitResultDtoServiceResponse`
  - `500` → `BillingSubmitResultDtoServiceResponse`

### IClaim

#### `GET /api/IClaim/check-eligible`
- Summary: API สำหรับ Get ข้อมูล เช็คสิทธิ์ความคุ้มครอง
- OperationId: `CheckEligible`
- Parameters:
  - `searchIndex` — `query`, optional, `integer`
  - `isSeachDetail` — `query`, optional, `boolean`
  - `incidentDate` — `query`, optional, `string`
  - `schoolId` — `query`, optional, `integer`
  - `provinceId` — `query`, optional, `integer`
  - `incidentTypeId` — `query`, optional, `integer`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
  - `IClaimToken` — `header`, optional, `string`
- Responses:
  - `200` → `GetCustomerSearchDtoResponseListServiceResponse`

#### `POST /api/IClaim/claim/history/check`
- Summary: API สำหรับตรวจสอบประวัติ Claim ของผู้เอาประกัน
- OperationId: `CheckClaimHistory`
- Parameters:
  - `IClaimToken` — `header`, optional, `string`
- Request Body: `CheckClaimHistoryDtoRequest`
- Responses:
  - `200` → `CheckClaimHistoryDtoResponseListServiceResponse`

#### `POST /api/IClaim/customer/checkeligible`
- Summary: API สำหรับรวมข้อมูล Customer และ Benefit ตามประเภทการรักษา OPD หรือ IPD
- OperationId: `CheckEligibleCustomer`
- Parameters:
  - `IClaimToken` — `header`, optional, `string`
- Request Body: `CustomerCheckEligibleDtoRequest`
- Responses:
  - `200` → `CustomerCheckEligibleDtoResponseListServiceResponse`

### Masters

#### `GET /api/Masters/adjustment/reason`
- Summary: API สำหรับ Get ข้อมูล AdjustmentReason (AdjustmentTypeId 2 = โอนเพิ่ม, 3 = คืนเงิน)
- OperationId: `GetAdjustmentReason`
- Parameters:
  - `adjustmentTypeId` — `query`, optional, `integer`
  - `adjustmentReasonId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetAdjustmentReasonDtoResponseListServiceResponse`

#### `GET /api/Masters/bank`
- Summary: API สำหรับ Get ข้อมูล Organize (ธนาคาร)
- OperationId: `GetAllBank`
- Parameters:
  - `organizeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetOrganizeDtoResponseListServiceResponse`

#### `GET /api/Masters/bankaccount/relation/type`
- Summary: API สำหรับ Get ข้อมูล BankAccountRelationType (ประเภทความสัมพันธ์ของบัญชีธนาคาร) BankAccountRelationGroupId : 1 = PH , PA , ClaimMisc : 2 = Motor
- OperationId: `GetBankAccountRelationType`
- Parameters:
  - `bankAccountRelationTypeId` — `query`, optional, `integer`
  - `bankAccountRelationGroupId` — `query`, optional, `integer`
  - `productTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetBankAccountRelationTypeDtoResponseListServiceResponse`

#### `GET /api/Masters/beneficiary`
- Summary: API สำหรับ Get ข้อมูล Beneficiary (ผู้รับผลประโยชน์) By PolicyCode
- OperationId: `GetBeneficiary`
- Parameters:
  - `policyCode` — `query`, optional, `string`
- Responses:
  - `200` → `GetBeneficiaryDtoResponseListServiceResponse`

#### `GET /api/Masters/benefit`
- Summary: API สำหรับ Get ข้อมูล Benefit (ผลประโยชน์)
- OperationId: `GetBenefit`
- Parameters:
  - `benefitId` — `query`, optional, `integer`
  - `benefitIdList` — `query`, optional, `array<integer>`
- Responses:
  - `200` → `GetBenefitDtoResponseListServiceResponse`

#### `GET /api/Masters/branch`
- Summary: API สำหรับ Get ข้อมูล Branch (สาขา)
- OperationId: `GetBranch`
- Parameters:
  - `branchId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetBranchDtoResponseListServiceResponse`

#### `GET /api/Masters/chiefcomplaint`
- Summary: API สำหรับ Get ข้อมูล ChiefComplaint (อาการสำคัญที่ผู้เคลมแจ้ง)
- OperationId: `GetChiefComplaint`
- Parameters:
  - `chiefComplaintId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetChiefComplaintDtoResponseListServiceResponse`

#### `GET /api/Masters/claim/decision`
- Summary: API สำหรับ Get ข้อมูล Decision (ผลการพิจารณา)
- OperationId: `GetDecision`
- Parameters:
  - `decisionId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDecisionDtoResponseListServiceResponse`

#### `GET /api/Masters/claim/decision/reason`
- Summary: API สำหรับ Get ข้อมูล DecisionReason (สาเหตุจากผลการพิจารณา)
- OperationId: `GetDecisionReason`
- Parameters:
  - `decisionReasonId` — `query`, optional, `integer`
  - `decisionId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDecisionReasonDtoResponseListServiceResponse`

#### `GET /api/Masters/claim/transaction-type`
- Summary: API สำหรับ Get ข้อมูล ClaimTransactionType (ประเภทธุรกรรมเคลม)
- OperationId: `GetClaimTransactionType`
- Parameters:
  - `claimTransactionTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetClaimTransactionTypeDtoResponseListServiceResponse`

#### `GET /api/Masters/contactperson/type`
- Summary: API สำหรับ Get ข้อมูล ContactPersonType (ประเภทผู้ติดต่อ) ContactPersonGroupId : 1 = PH , DeathClaim : 2 = PA, 3 = Motor
- OperationId: `GetContactPersonType`
- Parameters:
  - `contactPersonTypeId` — `query`, optional, `integer`
  - `contactPersonGroupId` — `query`, optional, `integer`
  - `productTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetContactPersonTypeDtoResponseListServiceResponse`

#### `GET /api/Masters/deduction-source`
- Summary: API สำหรับ Get ข้อมูล DeductionSource (ช่องทางการหักเงิน)
- OperationId: `GetDeductionSource`
- Parameters:
  - `deductionSourceId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDeductionSourceDtoResponseListServiceResponse`

#### `GET /api/Masters/disability/bodypart`
- Summary: API สำหรับ Get จ้อมูล BodyPart by DisabilityLossPartId
- OperationId: `GetBodyPartByDisabilityLossPart`
- Parameters:
  - `disabilityLossPartId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetBodyPartByDisabilityLossPartDtoResponseListServiceResponse`

#### `GET /api/Masters/disability/losspart`
- Summary: API สำหรับ Get ข้อมูล DisabilityLossPart (ส่วนของร่างกายที่พิการ)
- OperationId: `GetDisabilityLossPart`
- Parameters:
  - `disabilityLossPartId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDisabilityLossPartDtoResponseListServiceResponse`

#### `GET /api/Masters/document/recipient-type`
- Summary: API สำหรับ Get ข้อมูล DocumentRecipientType (ประเภทผู้รับเอกสาร)
- OperationId: `GetDocumentRecipientType`
- Parameters:
  - `documentRecipientTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDocumentRecipientTypeDtoResponseListServiceResponse`

#### `GET /api/Masters/document/review/status`
- Summary: API สำหรับ Get ข้อมูล DocumentReviewStatus (สถานะการตรวจเอกสาร)
- OperationId: `GetDocumentReviewStatus`
- Parameters:
  - `documentReviewStatusId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetDocumentReviewStatusDtoResponseListServiceResponse`

#### `GET /api/Masters/employee-payment-limit/{userId}`
- Summary: API สำหรับ Get ข้อมูล EmployeeClaimPaymentLimit (วงเงินผู้คีย์เคลม)
- Parameters:
  - `userId` — `path`, required, `integer`
- Responses:
  - `200` → `GetEmployeeClaimPaymentLimitResponseServiceResponse`

#### `GET /api/Masters/formatType`
- Summary: API สำหรับ Get ข้อมูล FormatType (ประการจ่าย)
- OperationId: `GetFormatType`
- Parameters:
  - `formatTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `FormatTypeDtoResponseListServiceResponse`

#### `GET /api/Masters/hospital`
- Summary: API สำหรับ Get ข้อมูล Organize (โรงพยาบาล)
- OperationId: `GetAllHospital`
- Parameters:
  - `organizeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetOrganizeDtoResponseListServiceResponse`

#### `GET /api/Masters/icd10`
- Summary: API สำหรับ Get ข้อมูล ICD10 (รหัสวินิจฉัยโรค)
- OperationId: `GetICD10`
- Parameters:
  - `ICD10Id` — `query`, optional, `integer`
  - `ICD10Code` — `query`, optional, `string`
  - `isTPA` — `query`, optional, `boolean`
- Responses:
  - `200` → `GetICD10DtoResponseListServiceResponse`

#### `GET /api/Masters/incidenttype`
- Summary: API สำหรับ Get ข้อมูล IncidentType (เหตุของการเคลม)
- OperationId: `GetIncidentType`
- Parameters:
  - `incidentTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `IncidentTypeDtoResponseListServiceResponse`

#### `GET /api/Masters/incidenttype/mapping`
- Summary: API สำหรับ Get ข้อมูล CoverageType, MedicalType, CauseOfIncident By IncidentTypeId
- OperationId: `GetIncidentTypeMapping`
- Parameters:
  - `incidentTypeId` — `query`, optional, `integer`
  - `claimSourceId` — `query`, optional, `integer`
  - `productTypeId` — `query`, optional, `integer`
  - `productCategoryCode` — `query`, optional, `string`
  - `coverageTypeId` — `query`, optional, `integer`
  - `medicalTypeId` — `query`, optional, `integer`
  - `causeOfIncidentId` — `query`, optional, `integer`
  - `isClaimContinue` — `query`, optional, `boolean`
  - `initialClaimId` — `query`, optional, `string`
- Responses:
  - `200` → `GetIncidentTypeMappingDtoResponseListServiceResponse`

#### `GET /api/Masters/insurance/filter`
- Summary: API สำหรับ Get ข้อมูล Organize (บริษัทประกัน)
- OperationId: `GetInsuranceCompany`
- Parameters:
  - `organizeId` — `query`, optional, `integer`
  - `searchDetail` — `query`, optional, `string`
  - `orderingField` — `query`, optional, `string`
  - `ascendingOrder` — `query`, optional, `boolean`
  - `Page` — `query`, optional, `integer`
  - `recordsPerPage` — `query`, optional, `integer`
- Responses:
  - `200` → `GetInsuranceCompanyDtoResponseListServiceResponse`

#### `GET /api/Masters/noncoveredreason`
- Summary: API สำหรับ Get ข้อมูล NonCoveredReason (สาเหตุที่ไม่คุ้มครอง)
- OperationId: `GetNonCoveredReason`
- Parameters:
  - `nonCoveredReasonId` — `query`, optional, `integer`
  - `coverageTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetNonCoveredReasonDtoResponseListServiceResponse`

#### `GET /api/Masters/paymentstatus`
- Summary: API สำหรับ Get ข้อมูล PaymentStatus (สถานะการโอนเงิน)
- OperationId: `GetPaymentStatus`
- Parameters:
  - `paymentStatusId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetPaymentStatusDtoResponseListServiceResponse`

#### `GET /api/Masters/province`
- Summary: API สำหรับ Get ข้อมูล Province List (จังหวัด)
- OperationId: `GetProvince`
- Parameters:
  - `provinceId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetProvinceDtoResponseListServiceResponse`

#### `GET /api/Masters/relationtype`
- Summary: API สำหรับ Get ข้อมูล RelationType (ประเภทความสัมพันธ์)
- OperationId: `GetRelationType`
- Parameters:
  - `relationTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetRelationTypeDtoResponseListServiceResponse`

#### `GET /api/Masters/school`
- Summary: API สำหรับ Get ข้อมูล Organize (โรงเรียน)
- OperationId: `GetSchoolByProvinceId`
- Parameters:
  - `provinceId` — `query`, optional, `integer`
  - `organizeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetOrganizeDtoResponseListServiceResponse`

#### `GET /api/Masters/simb`
- Summary: API สำหรับ Get ข้อมูล SIMB
- OperationId: `GetSimB`
- Parameters:
  - `formatTypeId` — `query`, optional, `integer`
  - `coverageTypeId` — `query`, optional, `integer`
  - `medicalTypeId` — `query`, optional, `integer`
  - `isUseOften` — `query`, optional, `boolean`
  - `productTypeId` — `query`, optional, `integer`
  - `causeOfIncidentId` — `query`, optional, `integer`
  - `plandId` — `query`, optional, `integer`
- Responses:
  - `200` → `InputToStandardMappingDtoResponseListServiceResponse`

#### `GET /api/Masters/simb/category`
- Summary: API สำหรับ Get ข้อมูล SIMB Category
- OperationId: `GetSimBCategory`
- Parameters:
  - `formatTypeId` — `query`, optional, `integer`
  - `coverageTypeId` — `query`, optional, `integer`
  - `medicalTypeId` — `query`, optional, `integer`
  - `productTypeId` — `query`, optional, `integer`
  - `causeOfIncidentId` — `query`, optional, `integer`
  - `planId` — `query`, optional, `integer`
- Responses:
  - `200` → `StandardMedicalExpenseCategoryDtoResponseListServiceResponse`

#### `GET /api/Masters/title`
- Summary: API สำหรับ Get ข้อมูล Title (คำนำหน้าชื่อ) personTypeId : 1, 3 = สถานที่ , 2 = บุคคล
- OperationId: `GetTitle`
- Parameters:
  - `titleId` — `query`, optional, `integer`
  - `personTypeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetTitleDtoResponseListServiceResponse`

#### `GET /api/Masters/users`
- Summary: API สำหรับ Get ข้อมูลพนักงาน
- Parameters:
  - `userId` — `query`, optional, `integer`
- Responses:
  - `200` → `AllUserDtoResponseListServiceResponse`

#### `GET /api/Masters/zebracar/owner`
- Summary: API สำหรับ Get ข้อมูล ZebraCarOwner (เจ้าของรถม้าลาย)
- OperationId: `GetZebraCarOwner`
- Parameters:
  - `zebraId` — `query`, optional, `integer`
  - `employeeId` — `query`, optional, `integer`
- Responses:
  - `200` → `GetZebraCarOwnerDtoResponseListServiceResponse`

## Schema Quick Index

- `AdditionalTransferAccountDetailsResponseDto`: `toAccountName`, `toAccountNo`, `toBank`, `toBankId`, `phoneNo`, `claimantAccountRelationship`, `casePayableId`
- `AdditionalTransferAccountDetailsResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `AdditionalTransferDetailsResponseDto`: `claimId`, `caseId`, `claimNo`, `customerName`, `createdByUserName`, `totalNetPaidAmount`, `countItem`, `additionalTransferLimit`, `caseDetails`, `account`
- `AdditionalTransferDetailsResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `AdditionalTransferMonitorRequestDto`: `branceId`, `paymentStatusId`
- `AdditionalTransferTransactionResponseDto`: `remark`, `transactionDate`, `claimTransactionTypeName`, `createdByFullName`, `amountTotal`
- `AdditionalTransferTransactionResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `AdjustmentReasonResponseDto`: `id`, `name`
- `AdjustmentReasonResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `AdjustmentReasonResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `AllUserDtoResponse`: `userId`, `employeeId`, `personId`, `employeeCode`, `titleId`, `titleCode`, `titleName`, `firstName`, `lastName`, `personName`, `teamId`, `teamCode`, `teamName`, `branchId`, `branchName`
- `AllUserDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `ApproveCasePayableRequest`: `payableAmount`, `toBankId`, `toBankName`, `toBankAccountNo`
- `ApproveClaimDecisionDtoRequest`: `claimDecision`, `calculateCaseCode`, `isCombinedWithMedicalAll`, `casePayable`, `jsonDetail`
- `BankAccountRelationTypeResponseDto`: `id`, `name`
- `BankAccountRelationTypeResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `BankAccountRelationTypeResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `BankInquiryDetailResponseDto`: `transRefNo`, `createdDate`, `payerBankName`, `statusBank`, `descriptionTH`, `status`
- `BankInquiryDetailResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `BeneficiarySaveClaimEditDraftRequest`: `beneficiaryId`, `policyBeneficiaryId`, `titleId`, `firstName`, `lastName`, `idCard`, `phoneNo`, `relationId`, `bankAccountRelationTypeId`, `bankId`, `bankAccountNo`, `bankAccountName`, `payoutAmount`
- `BeneficiaryV2Request`: `policyBeneficiaryId`, `titleId`, `firstName`, `lastName`, `idCard`, `phoneNo`, `relationId`, `bankAccountRelationTypeId`, `bankId`, `bankAccountNo`, `bankAccountName`, `payoutAmount`, `payables`
- `BillingClaimDto`: `incidentTypeId`, `incidentDate`, `incidentTime`, `symptomOnsetDate`, `coverageTypeId`, `medicalTypeId`, `occurrenceDate`, `occurrenceTime`, `admissionDate`, `admissionTime`, `dischargeDate`, `dischargeTime`, `hn`, `vn`, `an`
- `BillingDetailDto`: `billingRequestItemId`, `billingDetailId`, `billingHeaderId`, `caseId`, `claimId`, `billingRequestId`, `billingRequestCode`, `claimCode`, `caseNo`, `hospitalName`, `provinceName`, `submittedDate`, `statusId`, `version`, `caseVersion`
- `BillingDetailDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `BillingDocumentDto`: `caseDocumentId`, `documentId`, `documentSubTypeId`, `documentName`, `fileCount`, `reviewStatusId`, `note`
- `BillingExpenseDto`: `caseItemId`, `standardMedicalExpenseId`, `itemName`, `claimAmount`, `discountAmount`, `nonCoveredAmount`, `nonCoveredReasonId`, `note`
- `BillingHistoryDto`: `rounds`, `revisions`
- `BillingHistoryDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `BillingInsuredDto`: `name`, `applicationId`, `studentCard`, `plan`, `coverageStart`, `coverageEnd`
- `BillingListDto`: `items`, `counts`
- `BillingListDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `BillingListItemDto`: `billingDetailId`, `billingHeaderId`, `caseId`, `billingRequestId`, `claimCode`, `insuredName`, `hospitalName`, `submittedDate`, `treatmentDate`, `statusId`, `amount`, `canReview`
- `BillingMedicalDto`: `underlyingDiseaseDetail`, `illnessDetail`, `investigationResults`, `isProcedurePerformed`, `medicalLicenseNo`, `physicianName`
- `BillingReviewDataDto`: `claim`, `medical`, `expenses`, `documents`
- `BillingRevisionDto`: `revisionId`, `version`, `previousStatusId`, `statusId`, `reviewedDate`, `reviewedByUserId`, `returnStatus`, `snapshot`
- `BillingRoundDto`: `billingDetailId`, `billingRequestId`, `statusId`, `submittedDate`
- `BillingSubmitResultDto`: `billingDetailId`, `revisionId`, `statusId`, `version`, `netBillableAmount`, `returnRequestId`, `returnStatus`
- `BillingSubmitResultDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `BillingTotalsDto`: `totalClaimedAmount`, `totalDiscountAmount`, `totalNonCoveredAmount`, `insuranceDiscountAmount`, `customerDiscountAmount`, `netBillableAmount`
- `CalculateCaseClaim`: `productId`, `coverageTypeId`, `medicalTypeId`, `incidentTypeId`, `occurrenceDate`, `ipdCount`, `icuCount`, `continueClaimNo`, `expenseList`, `disabilityList`
- `CalculateCaseClaimDtoRequest`: `caseAdjudicationId`, `isSimulateCase`, `isCheckIncludeCompensate`, `isCheckIncludeCompensateAll`, `jsonDetail`
- `CalculateCaseClaimDtoResponse`: `caseAdjudicationId`, `calculateCaseCode`, `medicalExpense`, `compensateExpense`, `disabilityExpense`, `compensateNet`, `compensateInclude`, `compensateRemain`, `medicalNet`, `medicalCoverPay`, `medicalPay`, `medicalCompensateInclude`, `medicalUnpay`
- `CalculateCaseClaimDtoResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `CalculateCaseDisability`: `standardMedicalExpenseId`, `bodyPartId`, `originalAmount`, `discountAmount`, `nonCoverAmount`, `disabilityPercent`, `reasonId`, `remark`
- `CalculateCaseDisabilityDtoResponse`: `policyCode`, `standardMedicalExpenseId`, `bodyPartId`, `bodyPartName`, `benefitPercent`, `benefitId`, `benefitName`, `benefitUnitName`, `pricePerUnit`, `maxPrice`, `sumUsedAmount`
- `CalculateCaseDisabilityDtoResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `CalculateCaseExpense`: `standardMedicalExpenseId`, `description`, `originalAmount`, `discountAmount`, `nonCoverAmount`, `reasonId`, `remark`
- `CaseAdjudicationSaveClaimEditDraftRequest`: `decisionId`, `decisionDate`, `approvedAdmissionDate`, `approvedAdmissionTime`, `approvedDischargeDate`, `approvedDischargeTime`, `coveredAmount`, `nonCoveredAmount`, `compensateAmount`, `approvedMedicalAmount`, `approvedCompensateAmount`, `patientPayAmount`, `isExgratia`, `exgratiaAmount`, `deductibleAmount`
- `CaseAssessmentSaveClaimEditDraftRequest`: `isDocumentComplete`, `documentReceivedDate`, `documentCompleteDate`, `isFraudSuspect`, `documentReceivedByUserId`, `documentReceivedByUserCode`, `documentReceivedByUserName`
- `CaseAssessmentV2Request`: `isDocumentComplete`, `documentReceivedDate`, `documentCompleteDate`, `isFraudSuspect`, `documentReceivedByUserId`, `documentReceivedByUserCode`, `documentReceivedByUserName`
- `CaseContactV2Request`: `contactPersonTypeId`, `contactPersonName`, `contactPhoneNo`
- `CaseDeathSaveClaimEditDraftRequest`: `caseDeathId`, `causeOfIncidentId`, `deathDate`, `deathTime`
- `CaseDeathV2Request`: `causeOfIncidentId`, `deathDate`, `deathTime`, `placeOfDeathId`, `placeOfDeathDetail`
- `CaseDetailDto`: `customerName`, `coverageTypeNameTH`, `caseNo`, `totalNetPaidAmount`
- `CaseDisabilitySaveClaimEditDraftRequest`: `caseDisabilityId`, `bodyPartId`, `disabilityTypeId`, `disabilityLevel`, `disabilityPercent`
- `CaseDisabilityV2Request`: `bodyPartId`, `disabilityTypeId`, `disabilityLevel`, `disabilityPercent`, `causeOfIncidentId`
- `CaseDocumentDetailSaveClaimEditDraftRequest`: `caseDocumentDetailId`, `firstName`, `lastName`, `fullName`, `hospitalName`, `receiptAdmissionDate`, `receiptNumber`, `receiptAmount`, `ocrDocumentTypeId`, `ocrResult`
- `CaseDocumentDetailV2Request`: `firstName`, `lastName`, `fullName`, `hospitalName`, `receiptAdmissionDate`, `receiptNumber`, `receiptAmount`, `ocrDocumentTypeId`, `ocrResult`
- `CaseDocumentSaveClaimEditDraftRequest`: `caseDocumentId`, `documentId`, `documentNo`, `documentSubTypeId`, `caseDocumentDetail`
- `CaseDocumentV2Request`: `documentId`, `documentNo`, `claimDocumentTypeId`, `documentSubTypeId`, `details`
- `CaseItemAdjudicationSaveClaimEditDraftRequest`: `caseItemAdjusication`, `standardMedicalExpenseId`, `caseItemId`, `netCaseAmount`, `eligibleAmount`, `approvedAmount`, `nonCoveredAmount`, `excessAmount`
- `CaseItemSaveClaimEditDraftRequest`: `caseItemId`, `inputToStandardMappingId`, `standardMedicalExpenseId`, `quantity`, `perUnit`, `originalAmount`, `discountAmount`, `netCaseAmount`, `medicalTypeId`, `nonCoveredAmount`, `nonCoveredReasonId`
- `CaseItemV2Request`: `inputToStandardMappingId`, `standardMedicalExpenseId`, `quantity`, `perUnit`, `originalAmount`, `discountAmount`, `netCaseAmount`, `medicalTypeId`, `nonCoveredAmount`, `nonCoveredReasonId`
- `CasePayableV2Request`: `payableCategoryId`
- `CaseRefundApproveDetailResponseDto`: `claimNo`, `caseNo`, `branchName`, `insuredName`, `createdBy`, `refundCount`, `transferAmount`, `totalRefundAmount`, `remainingAmount`, `refundDate`
- `CaseRefundApproveDetailResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `CaseRefundRejectReasonResponseDto`: `id`, `name`
- `CaseRefundRejectReasonResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `CaseRegistrationV2Request`: `notificationDate`, `notifyBy`, `initialCoverageTypeId`, `initialCaseAmount`, `initialCaseSourceId`, `preAuthId`, `initialMedicalTypeId`
- `CaseSaveClaimEditDraftRequest`: `coverageTypeId`, `occurrenceDate`, `occurrenceTime`, `admissionDate`, `admissionTime`, `dischargeDate`, `dischargeTime`, `caseAmount`, `latestApprovedAmount`, `latestNonCoveredAmount`, `latestPatientPayAmount`, `cancelReasonId`, `cancelDate`, `isCaseDisability`, `hospitalId`
- `CaseServicePersonV2Request`: `servicePersonByUserId`, `servicePersonByUserCode`, `servicePersonByUserName`, `zebraId`, `zebraCode`, `zebraNo`, `employeeCode`, `employeeName`
- `CaseV2Request`: `coverageTypeId`, `occurrenceDate`, `occurrenceTime`, `admissionDate`, `admissionTime`, `dischargeDate`, `dischargeTime`, `caseAmount`, `latestApprovedAmount`, `latestNonCoveredAmount`, `latestPatientPayAmount`, `isCaseDisability`, `hospitalId`, `hn`, `an`
- `CheckClaimHistoryDtoRequest`: `searchOption`, `cidPassport`, `id`, `certNo`, `policyNumber`, `priviledgeCardNo`, `hospitalCode`, `userName`
- `CheckClaimHistoryDtoResponse`: `customer`, `history`
- `CheckClaimHistoryDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `ClaimDecisionOverviewDtoResponse`: `caseAdjudicationId`, `decisionId`, `decisionName`, `decisionReasonId`, `decisionReasonName`, `rejectReasonId`, `rejectReasonName`, `reason`, `decisionRemark`, `decisionDate`, `coveredAmount`, `nonCoveredAmount`, `approvedMedicalAmount`, `patientPayAmount`
- `ClaimEditDraftBeneficiaryPayloadDto`: `beneficiaryId`, `policyBeneficiaryId`, `titleId`, `firstName`, `lastName`, `idCard`, `phoneNo`, `relationId`, `bankAccountRelationTypeId`, `bankId`, `bankAccountNo`, `bankAccountName`, `payoutAmount`
- `ClaimEditDraftCaseAdjudicationPayloadDto`: `decisionId`, `decisionDate`, `approvedAdmissionDate`, `approvedAdmissionTime`, `approvedDischargeDate`, `approvedDischargeTime`, `coveredAmount`, `nonCoveredAmount`, `compensateAmount`, `approvedMedicalAmount`, `approvedCompensateAmount`, `patientPayAmount`, `isExgratia`, `exgratiaAmount`, `deductibleAmount`
- `ClaimEditDraftCaseAssessmentPayloadDto`: `isDocumentComplete`, `documentReceivedDate`, `documentCompleteDate`, `isFraudSuspect`, `documentReceivedByUserId`, `documentReceivedByUserCode`, `documentReceivedByUserName`
- `ClaimEditDraftCaseDeathPayloadDto`: `caseDeathId`, `causeOfIncidentId`, `deathDate`, `deathTime`
- `ClaimEditDraftCaseDisabilityPayloadDto`: `caseDisabilityId`, `bodyPartId`, `disabilityTypeId`, `disabilityLevel`, `disabilityPercent`
- `ClaimEditDraftCaseDocumentDetailPayloadDto`: `caseDocumentDetailId`, `firstName`, `lastName`, `fullName`, `hospitalName`, `receiptAdmissionDate`, `receiptNumber`, `receiptAmount`, `ocrDocumentTypeId`, `ocrResult`
- `ClaimEditDraftCaseDocumentPayloadDto`: `caseDocumentId`, `documentId`, `documentNo`, `documentSubTypeId`, `caseDocumentDetail`
- `ClaimEditDraftCaseItemAdjudicationPayloadDto`: `caseItemAdjusication`, `standardMedicalExpenseId`, `caseItemId`, `netCaseAmount`, `eligibleAmount`, `approvedAmount`, `nonCoveredAmount`, `excessAmount`
- `ClaimEditDraftCaseItemPayloadDto`: `caseItemId`, `inputToStandardMappingId`, `standardMedicalExpenseId`, `quantity`, `perUnit`, `originalAmount`, `discountAmount`, `netCaseAmount`, `medicalTypeId`, `nonCoveredAmount`, `nonCoveredReasonId`
- `ClaimEditDraftCasePayloadDto`: `coverageTypeId`, `occurrenceDate`, `occurrenceTime`, `admissionDate`, `admissionTime`, `dischargeDate`, `dischargeTime`, `caseAmount`, `latestApprovedAmount`, `latestNonCoveredAmount`, `latestPatientPayAmount`, `cancelReasonId`, `cancelDate`, `isCaseDisability`, `hospitalId`
- `ClaimEditDraftPayloadDto`: `claimId`, `caseId`, `incidentTypeId`, `incidentDate`, `incidentTime`, `accidentPlace`, `accidentDescription`, `draftStep`, `case`, `claimEditDraft`
- `ClaimEditDraftSaveClaimEditDraftRequest`: `baseClaimVersion`, `baseCaseVersion`, `claimEditDraftStatusId`
- `ClaimEditDraftStatusPayloadDto`: `baseClaimVersion`, `baseCaseVersion`, `claimEditDraftStatusId`
- `ClaimV2Request`: `applicationId`, `policyNo`, `certificateNo`, `customerId`, `customerName`, `incidentTypeId`, `incidentDate`, `incidentTime`, `accidentPlace`, `accidentDescription`, `cases`
- `CompensateExpenseList`: `benefitId`, `benefitName`, `net`, `cover`, `unCover`, `pay`, `unPay`, `countDay`, `dayOfUnit`
- `CreateContinuedClaimDtoRequest`: `requestId`, `claimId`, `cases`, `createdByBranchId`, `createdByUserCode`, `createdByUserName`
- `CreateCoreClaimDtoResponse`: `isResult`, `result`, `msg`, `responseList`
- `CreateCoreClaimDtoResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `CreateCoreClaimResponseItem`: `claimId`, `caseRegistrationId`, `caseId`, `claimNo`, `caseNo`, `casePayableId`
- `CreateCoreClaimV2DtoRequest`: `requestId`, `claimSourceId`, `productTypeId`, `createdByBranchId`, `createdByUserCode`, `createdByUserName`, `claims`
- `CreateRefundRequestDto`: `adjustmentTypeId`, `refundReasonId`, `cacseId`, `claimId`, `refundDate`, `remark`, `decreaseAmount`
- `CreateRefundResponsetDto`: `caseAdjustmentId`, `isSuccess`, `message`
- `CreateRefundResponsetDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `CustomerCheckEligibleCustomerDto`: `id`, `cardTypeId`, `cardDetail`, `customerName`, `productTypeId`, `productTypeName`, `policyCode`, `customerCode`, `appStatusId`, `coverageFrom`, `coverageTo`, `productName`, `schoolName`, `totalCount`, `mobilePhoneNumber`
- `CustomerCheckEligibleDtoRequest`: `type`, `searchIndex`, `searchDetail`, `incidentDate`, `incidentTypeId`, `isContinue`
- `CustomerCheckEligibleDtoResponse`: `customer`, `benefits`
- `CustomerCheckEligibleDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `DisabilityExpenseList`: `benefitId`, `benefitName`, `originalAmount`, `nonCoveredAmount`, `benefitPercent`, `benefitPerUnit`, `benefitUnitName`, `benefitMaxPrice`
- `DocumentReviewOverviewDtoResponse`: `totalCount`, `documents`
- `DocumentReviewOverviewItemDtoResponse`: `caseId`, `caseDocumentId`, `documentId`, `documentNo`, `documentRemark`, `documentSubTypeId`, `documentSubTypeCode`, `documentSubTypeName`, `documentTypeId`, `documentTypeName`, `fileCount`, `createdDate`, `updatedDate`, `documentReviewId`, `documentReviewStatusId`
- `ExpenseCategorySummaryDtoResponse`: `originalAmount`, `discountAmount`, `netCaseAmount`, `nonCoveredAmount`, `approvedAmount`, `patientPayAmount`, `standardMedicalExpenseCategoryId`, `standardMedicalExpenseCategoryName`
- `ExpenseFormatOverviewDtoResponse`: `formatTypeId`, `formatTypeName`
- `ExpenseItemOverviewDtoResponse`: `caseItemId`, `inputToStandardMappingId`, `standardMedicalExpenseId`, `standardMedicalExpenseName`, `standardMedicalExpenseCategoryId`, `standardMedicalExpenseCategoryName`, `nonCoveredReasonId`, `nonCoveredReasonName`, `quantity`, `perUnit`, `medicalTypeId`, `originalAmount`, `discountAmount`, `netCaseAmount`, `nonCoveredAmount`
- `ExpenseSummaryOverviewDtoResponse`: `formats`, `items`, `categorySummaries`, `totals`
- `ExpenseTotalsOverviewDtoResponse`: `originalAmount`, `discountAmount`, `netCaseAmount`, `nonCoveredAmount`, `approvedAmount`, `patientPayAmount`
- `FailedPayTransferTransactionResponseDto`: `transRefNo`, `createdDate`, `payerBankName`, `statusBank`, `descriptionTH`, `status`
- `FailedPayTransferTransactionResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `FormatTypeDtoResponse`: `formatTypeId`, `formatTypeName`, `isActive`, `createdByUserId`, `createdDate`, `updatedByUserId`, `updatedDate`
- `FormatTypeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetAdjustmentReasonDtoResponse`: `adjustmentReasonId`, `adjustmentReasonName`
- `GetAdjustmentReasonDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetBankAccountRelationTypeDtoResponse`: `bankAccountRelationTypeId`, `bankAccountRelationTypeName`
- `GetBankAccountRelationTypeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetBeneficiaryDtoResponse`: `id`, `policyCode`, `beneficiaryCode`, `titleId`, `firstName`, `lastName`, `phoneNumber`, `relationTypeId`, `percentShare`, `beneficiaryOrder`, `remark`
- `GetBeneficiaryDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetBenefitDtoResponse`: `benefitId`, `benefitName`
- `GetBenefitDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetBodyPartByDisabilityLossPartDtoResponse`: `bodyPartId`, `bodyPartName`, `disabilitySideId`, `disabilitySideName`, `disabilityLossSubPartId`, `disabilitySubPartNameTH`, `lossJointCount`, `disabilitySidePart1Id`, `disabilitySidePart1Name`, `disabilitySidePart2Id`, `disabilitySidePart2Name`, `standardMedicalExpenseId`
- `GetBodyPartByDisabilityLossPartDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetBranchDtoResponse`: `branchId`, `branchCode`, `branchName`
- `GetBranchDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetCaseByClaimIdDtoResponse`: `claimId`, `claimNo`, `incidentDate`, `lastestChiefComplaint`, `chiefComplaintCustom`, `totalCaseAmount`, `totalPaidAmount`, `caseId`, `caseNo`, `occurrenceDate`, `caseChiefComlaint`, `caseAmount`, `casePaidAmount`, `icD10Detail`, `medicalTypeCode`
- `GetCaseByClaimIdDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetCaseReviewOverviewDtoResponse`: `caseId`, `documentReview`, `claimDecision`, `expenseSummary`
- `GetCaseReviewOverviewDtoResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetChiefComplaintDtoResponse`: `chiefComplaintId`, `chiefComplaintCode`, `detail`
- `GetChiefComplaintDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetClaimContinueDtoResponse`: `claimId`, `claimNo`, `caseId`, `incidentDate`, `chiefComplaintId`, `chiefComplaint`, `chiefComplaintCustom`, `admissionDate`, `icD10Detail`, `totalCaseAmount`, `totalPaidAmount`, `claimDetail`, `remainAmount`, `totalCount`
- `GetClaimContinueDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetClaimDetailConsiderDtoResponse`: `claimId`, `notificationDate`, `paymentDate`, `createByUserName`, `claimNo`, `caseNo`, `productTypeId`, `claimSourceId`, `claimType`, `claimStatusId`, `claimStatusName`, `incidentTypeId`, `coverageTypeId`, `medicalTypeId`, `causeOfIncidentId`
- `GetClaimDetailConsiderDtoResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetClaimEditDraftRevisionDtoResponse`: `draftRevisionId`, `draftId`, `versionNo`, `draftStep`, `changedByUserId`, `changedDate`, `payload`
- `GetClaimEditDraftRevisionDtoResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetClaimHistoryDtoResponse`: `applicationId`, `claimId`, `claimNo`, `incidentDate`, `incidentTime`, `lastestChiefComplaint`, `totalCaseAmount`, `paidAmount`, `nonCoveredAmount`, `claimOpenDate`, `countCase`, `icD10Detail`, `paymentStatusId`, `paymentStatusName`, `hospitalName`
- `GetClaimHistoryDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetClaimTransactionLogDtoResponse`: `transactionLogId`, `claimId`, `claimNo`, `caseId`, `caseNo`, `transactionLogTypeId`, `transactionLogTypeName`, `createdDate`, `employeeName`, `totalAmount`, `paymentStatusId`, `paymentStatusNameTH`, `decisionId`, `decisionName`, `transactionLogRemark`
- `GetClaimTransactionLogDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetClaimTransactionTypeDtoResponse`: `claimTransactionTypeId`, `claimTransactionTypeName`
- `GetClaimTransactionTypeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetContactPersonDtoResponse`: `contactPersonTypeId`, `contactPersonTypeName`, `contactPhoneNo`, `contactName`, `indexId`
- `GetContactPersonDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetContactPersonTypeDtoResponse`: `contactPersonTypeId`, `contactPersonTypeName`
- `GetContactPersonTypeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetCustomerBankAccountDtoResponse`: `bankId`, `bankName`, `bankAccountNo`, `bankAccountName`, `bankAccountRelationTypeId`, `bankAccountRelationTypeName`, `createdDate`, `indexId`
- `GetCustomerBankAccountDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetCustomerBenefitDetailHalfDtoResponse`: `productName`, `coverageFrom`, `coverageTo`, `benefitName`, `pricePerUnit`, `unitName`, `maxQuantity`, `quantityUnitName`, `maxPrice`, `customerTypeCode`, `remainBenefit`, `benefitId`, `medicalTypeId`, `medicalTypeName`, `remainAmount`
- `GetCustomerBenefitDetailHalfDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetCustomerBenefitDetailSearchDtoResponse`: `productName`, `coverageFrom`, `coverageTo`, `benefitName`, `pricePerUnit`, `unitName`, `maxQuantity`, `quantityUnitName`, `maxPrice`, `customerTypeCode`, `remainBenefit`, `benefitId`, `medicalTypeId`, `medicalTypeName`, `remainAmount`
- `GetCustomerBenefitDetailSearchDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetCustomerClaimAdjudicationMonitorDtoResponse`: `claimId`, `paymentDate`, `claimNo`, `schoolName`, `customerName`, `cardDetail`, `totalAmount`, `claimTransactionTypeId`, `claimTransactionTypeName`, `customerId`, `totalCount`, `caseId`
- `GetCustomerClaimAdjudicationMonitorDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetCustomerDetailByIdDtoResponse`: `customerId`, `policyCode`, `customerName`, `customerTypeCode`, `customerTypeName`, `cardTypeId`, `cardDetail`, `productTypeId`, `certificateNo`, `policyNo`, `productTypeName`, `productId`, `productName`, `coverageFrom`, `coverageTo`
- `GetCustomerDetailByIdDtoResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetCustomerSearchByPolicyCodeDtoResponse`: `id`, `cardTypeId`, `cardDetail`, `customerName`, `productTypeId`, `productTypeName`, `policyCode`, `customerCode`, `appStatusId`, `coverageFrom`, `coverageTo`, `productName`, `schoolName`, `totalCount`, `mobilePhoneNumber`
- `GetCustomerSearchByPolicyCodeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetCustomerSearchDtoResponse`: `id`, `cardTypeId`, `cardDetail`, `customerName`, `productTypeId`, `productTypeName`, `policyCode`, `customerCode`, `appStatusId`, `coverageFrom`, `coverageTo`, `productName`, `schoolName`, `totalCount`, `mobilePhoneNumber`
- `GetCustomerSearchDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDCRDtoResponse`: `applicationCode`, `period`, `insuredCompanyName`, `productName`, `premiumDept`, `premiumRecieve`, `paymentTypeId`, `payMethodCode`, `paymentType`, `policyNo`, `bankTransactionDatetime`, `totalCount`
- `GetDCRDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDashboardCustomerConsiderDtoResponse`: `customerTotalCount`, `customerWaitReceiveCount`, `customerWaitPaymentCount`, `customerCancelCount`, `hospitalTotalCount`, `hospitalCheckEligibilityCount`, `hospitalWaitConsiderCount`, `hospitalRequestBillingCount`
- `GetDashboardCustomerConsiderDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDecisionDtoResponse`: `decisionId`, `decisionNameTH`
- `GetDecisionDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDecisionReasonDtoResponse`: `decisionReasonId`, `decisionReasonName`
- `GetDecisionReasonDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDecreaseTransactionRefundResponseDto`: `transactionDate`, `transactionTypeName`, `decreaseAmount`, `description`
- `GetDecreaseTransactionRefundResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDecreaseTransactionResponseDto`: `transactionDate`, `transactionTypeName`, `decreaseAmount`, `description`
- `GetDecreaseTransactionResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDeductionSourceDtoResponse`: `deductionSourceId`, `deductionSourceName`
- `GetDeductionSourceDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDisabilityLossPartDtoResponse`: `disabilityLossPartId`, `disabilityLossPartCode`, `disabilityLossPartNameTH`, `disabilityLossPartNameEN`
- `GetDisabilityLossPartDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDocumentByCaseIdDtoResponse`: `caseDocumentId`, `documentId`, `documentCode`, `documentSubTypeId`, `claimDocumentTypeName`, `claimDocumentTypeId`, `totalCount`
- `GetDocumentByCaseIdDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDocumentRecipientTypeDtoResponse`: `documentRecipientTypeId`, `documentRecipientTypeName`
- `GetDocumentRecipientTypeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDocumentReviewStatusDtoResponse`: `documentReviewStatusId`, `documentReviewStatusName`, `indexId`
- `GetDocumentReviewStatusDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetDocumentSubTypeDtoRequest`: `documentTypeId`, `documentPrefix`, `productTypeId`
- `GetDocumentSubTypeDtoResponse`: `documentId`, `documentCode`, `documentSubTypeId`, `documentSubTypeName`, `documentTypeId`
- `GetDocumentSubTypeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetEmployeeClaimPaymentLimitResponse`: `employeeClaimPaymentLimitId`, `userId`, `paymentLimit`, `totalNetPaidAmount`, `remainingLimit`
- `GetEmployeeClaimPaymentLimitResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetHospitalClaimAdjudicationMonitorDtoResponse`: `claimId`, `decisionDate`, `claimNo`, `hospitalName`, `customerName`, `medicalType`, `productName`, `totalAmount`, `claimTransactionTypeId`, `claimTransactionTypeName`, `cardDetail`, `customerId`, `totalCount`, `caseId`
- `GetHospitalClaimAdjudicationMonitorDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetICD10DtoResponse`: `icD10Id`, `icD10Code`, `icD10Detail`
- `GetICD10DtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetIncidentTypeMappingDtoResponse`: `incidentTypeId`, `coverageTypeId`, `coverageTypeNameTH`, `medicalTypeId`, `medicalTypeCode`, `causeOfIncidentId`, `causeOfIncidentName`, `indexId`
- `GetIncidentTypeMappingDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetInsuranceCompanyDtoResponse`: `organizeId`, `organizeCode`, `organizeName`, `organizeTypeId`, `shortName`, `totalCount`
- `GetInsuranceCompanyDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetNonCoveredReasonDtoResponse`: `nonCoveredReasonId`, `nonCoveredReasonName`
- `GetNonCoveredReasonDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetOrganizeDtoResponse`: `organizeId`, `organizeName`
- `GetOrganizeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetPaymentStatusDtoResponse`: `paymentStatusId`, `paymentStatusNameTH`
- `GetPaymentStatusDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetPolicyBenefitDtoResponse`: `applicationCode`, `benefitId`, `benefitTypeName`, `benefitName`, `pricePerUnit`, `pricePerUnitName`, `maxPrice`, `maxQuantity`, `quantityUnitName`, `customerTypeCode`, `fullBenefitDisplay`
- `GetPolicyBenefitDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetPolicyBenefitSheredDtoResponse`: `applicationCode`, `benefitId`, `benefitCode`, `productId`, `benefitName`, `maxPrice`, `customerTypeCode`, `shortBenefit`, `fullBenefitDisplay`
- `GetPolicyBenefitSheredDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetPreviousClaimDtoResponse`: `claimId`, `caseId`, `claimNo`, `incidentTypeId`, `coverageTypeId`, `medicalTypeId`, `incidentDate`, `deathDate`, `placeOfDeathId`, `placeOfDeathDetail`, `icD10Id`, `icD10DescriptionTH`, `paymentStatusId`, `causeOfIncidentId`, `totalCaseAmount`
- `GetPreviousClaimDtoResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetProvinceDtoResponse`: `provinceId`, `provinceName`
- `GetProvinceDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetRelationTypeDtoResponse`: `relationTypeId`, `relationTypeCode`, `relationTypeName`
- `GetRelationTypeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetStandardMedicalExpenseByCaseDtoResponse`: `inputToStandardMappingId`, `formatTypeId`, `inputItemCode`, `standardMedicalExpenseId`, `descriptionEN`, `descriptionTH`, `maximumLimit`, `standardMedicalExpenseCategoryId`, `backgroundColorCode`, `inputToStandardSubCategoryId`, `bodyPartId`, `caseItemId`, `caseId`, `quantity`, `perUnit`
- `GetStandardMedicalExpenseByCaseDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetTitleDtoResponse`: `titleId`, `titleName`
- `GetTitleDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `GetZebraCarOwnerDtoResponse`: `zebraId`, `zebraCode`, `zebraNo`, `employeeId`, `employeeCode`, `employeeName`, `employeeNickName`, `employeeFullName`
- `GetZebraCarOwnerDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `IncidentTypeDtoResponse`: `indexId`, `incidentTypeId`, `incidentTypeNameTH`
- `IncidentTypeDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `IncreaseTransferLimitMonitorResponseDto`: `caseId`, `caseNo`, `claimNo`, `createdDate`, `branchName`, `amount`, `toAccountNo`, `transferType`
- `IncreaseTransferLimitMonitorResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `InputToStandardMappingDtoResponse`: `inputToStandardMappingId`, `formatTypeId`, `inputItemCode`, `standardMedicalExpenseId`, `descriptionEN`, `descriptionTH`, `maximumLimit`, `standardMedicalExpenseCategoryId`, `backgroundColorCode`, `inputToStandardSubCategoryId`, `bodyPartId`
- `InputToStandardMappingDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `InputToStandardSubCategoryList`: `inputToStandardSubCategoryId`, `inputToStandardSubCategoryName`, `inputToStandardMappingList`
- `MedicalExpenseList`: `benefitId`, `benefitName`, `net`, `cover`, `unCover`, `pay`, `unPay`
- `PayTransferSettingHistoryResponseDto`: `createdByUser`, `employeeCode`, `isAutoTransfer`, `createdDate`
- `PayTransferSettingResponseDto`: `paytransferSettingId`, `isAutoTransfer`, `history`
- `PayTransferSettingResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `PaymentStatusResponseDto`: `id`, `name`
- `PaymentStatusResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `ProblemDetails`: `type`, `title`, `status`, `detail`, `instance`
- `RefundApproveMonitorRequestDto`: `branceId`, `refundStatusId`, `fromDate`, `toDate`
- `RefundApproveMonitorResponse`: `caseId`, `claimId`, `refundNo`, `claimNo`, `caseNo`, `createdDate`, `customerName`, `remark`, `totalNetPaidAmount`, `refundAmount`, `refundStatusId`, `refundStatusNameTH`, `branceName`, `caseRefundId`
- `RefundApproveMonitorResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `RefundDetailsAccountDetailsResponseDto`: `toAccountName`, `toAccountNo`, `toBank`, `toBankId`, `phoneNo`, `casePayableId`, `claimantAccountRelationship`
- `RefundDetailsAccountDetailsResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `RefundMonitorRequestDto`: `branceId`, `refundStatusId`
- `RefundMonitorResponse`: `caseId`, `claimId`, `refundNo`, `claimNo`, `caseNo`, `createdDate`, `customerName`, `remark`, `totalNetPaidAmount`, `refundAmount`, `refundStatusId`, `refundStatusNameTH`
- `RefundMonitorResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `RefundReasonResponseDto`: `id`, `name`
- `RefundReasonResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `RefundReasonResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `RefundStatusResponseDto`: `id`, `name`
- `RefundStatusResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `RefundTransactionResponseDto`: `remark`, `transactionDate`, `claimTransactionTypeName`, `createdByFullName`, `amountTotal`
- `RefundTransactionResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `RefundTransferTransactionDetailResponseDto`: `paymentCode`, `createdDate`, `paymentTypeName`, `totalNetPaidAmount`, `toBankName`, `toBankAccountNo`, `toBankAccountName`
- `RefundTransferTransactionResponseDto`: `payTransferDetails`
- `RefundTransferTransactionResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `SaveAdditionalTransferRequest`: `caseId`, `claimNo`, `caseNo`, `totalNetPaidAmount`, `toBankId`, `toBankName`, `toBankAccountNo`, `toBankAccountName`, `phoneNumber`, `adjustmentReasonId`, `remark`
- `SaveAdditionalTransferResponseDto`: `isSuccess`, `message`, `casePayableId`
- `SaveAdditionalTransferResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `SaveClaimEditDraftDtoRequest`: `claimId`, `caseId`, `incidentTypeId`, `incidentDate`, `incidentTime`, `accidentPlace`, `accidentDescription`, `draftStep`, `case`, `claimEditDraft`
- `SaveClaimEditDraftDtoRespone`: `isResult`, `result`, `msg`
- `SaveClaimEditDraftDtoResponeServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `SaveRefundDetailsResponseDto`: `claimId`, `caseId`, `claimNo`, `customerName`, `createdByUserName`, `totalNetPaidAmount`, `countItem`, `additionalTransferLimit`, `caseDetails`, `account`
- `SaveRefundDetailsResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `SearchClaimOrCaseResponseDto`: `caseId`, `claimId`, `claimCase`, `createdClaimDate`, `customerName`, `coverageType`, `caseAmount`, `isClaimNo`
- `SearchClaimOrCaseResponseDtoListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `StandardMedicalExpenseCategoryDtoResponse`: `inputToStandardCategoryId`, `inputToStandardCategoryName`, `inputToStandardSubCategoryList`
- `StandardMedicalExpenseCategoryDtoResponseListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `SubmitHospitalBillingDto`: `requestId`, `expectedVersion`, `expectedCaseVersion`, `expectedClaimVersion`, `rowVersion`, `caseRowVersion`, `claimRowVersion`, `reviewStatusId`, `rejectReasonId`, `decisionReasonId`, `decisionId`, `reviewRemark`, `data`
- `TimeSpan`: `ticks`, `days`, `hours`, `milliseconds`, `minutes`, `seconds`, `totalDays`, `totalHours`, `totalMilliseconds`, `totalMinutes`, `totalSeconds`
- `TransferTransactionDetailResponseDto`: `paymentCode`, `createdDate`, `paymentTypeName`, `totalNetPaidAmount`, `toBankName`, `toBankAccountNo`, `toBankAccountName`
- `TransferTransactionResponseDto`: `payTransferDetails`
- `TransferTransactionResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `UpdateAdditionalTransferRequestDto`: `bankAccountRelationTypeId`, `toBankId`, `toBankAccountNo`, `toBankAccountName`, `totalNetPaidAmount`, `phoneNumber`, `paymentId`, `caseId`, `casePayableId`, `claimId`, `toBankName`
- `UpdateAdditionalTransferResponseDto`: `isSuccess`, `message`
- `UpdateAdditionalTransferResponseDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `UpdatePayTransferSettingRequestDto`: `paytransferSettingId`
- `UpdatePayTransferSettingRequestDtoServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `UpsertClaimDecisionBeneficiaryRequest`: `beneficiaryId`, `policyBeneficiaryId`, `titleId`, `firstName`, `lastName`, `idCard`, `phoneNo`, `relationId`, `bankAccountRelationTypeId`, `bankId`, `bankAccountNo`, `bankAccountName`, `payoutAmount`
- `UpsertClaimDecisionCaseAdjudicationRequest`: `decisionId`, `decisionDate`, `approvedAdmissionDate`, `approvedAdmissionTime`, `approvedDischargeDate`, `approvedDischargeTime`, `coveredAmount`, `nonCoveredAmount`, `compensateAmount`, `approvedMedicalAmount`, `approvedCompensateAmount`, `patientPayAmount`, `isExgratia`, `exgratiaAmount`, `deductibleAmount`
- `UpsertClaimDecisionCaseAssessmentRequest`: `isDocumentComplete`, `documentReceivedDate`, `documentCompleteDate`, `isFraudSuspect`, `documentReceivedByUserId`, `documentReceivedByUserCode`, `documentReceivedByUserName`
- `UpsertClaimDecisionCaseDeathRequest`: `caseDeathId`, `causeOfIncidentId`, `deathDate`, `deathTime`
- `UpsertClaimDecisionCaseDisabilityRequest`: `caseDisabilityId`, `bodyPartId`, `disabilityTypeId`, `disabilityLevel`, `disabilityPercent`
- `UpsertClaimDecisionCaseDocumentDetailRequest`: `firstName`, `lastName`, `fullName`, `hospitalName`, `receiptAdmissionDate`, `receiptNumber`, `receiptAmount`, `ocrDocumentTypeId`, `ocrResult`
- `UpsertClaimDecisionCaseDocumentRequest`: `caseDocumentId`, `documentId`, `documentNo`, `documentSubTypeId`, `documentReviewStatusId`, `documentReviewRemark`, `caseDocumentDetail`
- `UpsertClaimDecisionCaseItemAdjudicationRequest`: `standardMedicalExpenseId`, `netCaseAmount`, `eligibleAmount`, `approvedAmount`, `nonCoveredAmount`, `excessAmount`
- `UpsertClaimDecisionCaseItemRequest`: `inputToStandardMappingId`, `standardMedicalExpenseId`, `quantity`, `perUnit`, `originalAmount`, `discountAmount`, `netCaseAmount`, `medicalTypeId`, `nonCoveredAmount`, `nonCoveredReasonId`
- `UpsertClaimDecisionCaseRequest`: `coverageTypeId`, `occurrenceDate`, `occurrenceTime`, `admissionDate`, `admissionTime`, `dischargeDate`, `dischargeTime`, `caseAmount`, `latestApprovedAmount`, `latestNonCoveredAmount`, `latestPatientPayAmount`, `cancelReasonId`, `cancelDate`, `isCaseDisability`, `hospitalId`
- `UpsertClaimDecisionDtoRequest`: `claimId`, `caseId`, `incidentTypeId`, `incidentDate`, `incidentTime`, `accidentPlace`, `accidentDescription`, `case`
- `UpsertClaimDecisionDtoResponse`: `isResult`, `result`, `msg`, `claimId`, `claimNo`, `caseId`, `caseNo`, `casePayableId`
- `UpsertClaimDecisionDtoResponseServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `accountDetail`: `contactPerson`, `accountNo`, `accountName`, `bankId`, `bankName`, `createdAccoutDetailDate`, `createdDate`, `phoneNumber`
- `usp_AdditionalTransferMonitor_SelectResult`: `caseId`, `claimId`, `claimNo`, `caseNo`, `createdDate`, `customerName`, `branchName`, `paymentStatusNameTH`, `remark`, `totalNetPaidAmount`, `addPayAmount`, `totalCount`, `paymentStatusId`, `casePayableId`, `paymentId`
- `usp_AdditionalTransferMonitor_SelectResultListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `usp_FailedPayTransferTransaction_SelectResult`: `claimNo`, `caseNo`, `claimCreated`, `toAccountNo`, `toBank`, `toAccountName`, `totalNetPaidAmount`, `paymentStatusId`, `payTransferTransactionId`, `payListHeaderId`, `paymentCode`, `paymentId`, `paymentStatusNameTH`, `totalCount`
- `usp_FailedPayTransferTransaction_SelectResultListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
- `usp_InquiryMonitor_SelectResult`: `paymentId`, `toAccountNo`, `toAccountName`, `toBank`, `totalNetPaidAmount`, `paymentCode`, `createdDate`, `claimNo`, `payTransferTransactionId`, `transferStatusId`, `transferStatusName`, `payListHeaderId`, `totalCount`
- `usp_InquiryMonitor_SelectResultListServiceResponse`: `data`, `isSuccess`, `message`, `code`, `exceptionMessage`, `serverDateTime`, `totalAmountRecords`, `totalAmountPages`, `currentPage`, `recordsPerPage`, `pageIndex`
