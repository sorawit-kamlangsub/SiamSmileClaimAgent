# โน้ต API ClaimFund — จาก APIGW (CoreClaim_api)

> **ต้นทาง**: ดึงจาก `https://xw5rgxmx-5001.asse.devtunnels.ms/swagger/v1/swagger.json` (dev tunnel APIGW) — ดึงเมื่อ 2026-09-14
> **title**: `CoreClaim_api` / version `v1`
> **ไฟล์นี้ครอบคลุมเฉพาะกลุ่ม `ClaimFund` (`/api/ClaimFund/*`)** — เป็นตัว API ที่ ClaimAgent ใช้เป็นหลัก (ตัว swagger ยังมีกลุ่ม CoreClaim, HospitalBilling, IClaim, Masters อีกเยอะ ไม่ยกมาในนี้)
> ⚠️ swagger ผ่าน dev tunnel → URL host อาจเปลี่ยนได้ ให้ re-fetch จาก tunnel ปัจจุบันเมื่อทำงาน

---

## ภาพรวม

- APIGW รวมหลาย service ไว้ตัวเดียว; API ของ ClaimFund อยู่ใต้ prefix **`/api/ClaimFund`** ตามด้วย controller
  - เช่น `/api/ClaimFund/Refund/RefundMonitor` — SAME กับ `/Refund/RefundMonitor` ของ service เบื้องหลัง
- **Common response envelope**: `{ data, isSuccess, message, code, exceptionMessage, serverDateTime, totalAmountRecords, totalAmountPages, currentPage, recordsPerPage, pageIndex }`
- **Pagination/query pattern** ที่ซ้ำกัน (สอบถามแล้ว): `searchDetail`, `orderingField`, `ascendingOrder`, `Page`, `recordsPerPage` — ใช้ query param ว่าง `Page` ไม่ใช่ `page`
- **Security**: `oauth2` scope `ClaimFundAPI` ทุก endpoint

## ตาราง endpoint กลุ่ม ClaimFund (33)

| # | Method | Path | กลุ่ม | คำอธิบาย |
|---|---|---|---|---|
| 1 | GET | `/api/ClaimFund/Masters/GetAdjustmentReasons` | Masters | ข้อมูลสาเหตุการโอนเพิ่ม (มี param เพิ่ม `AdjustmentTypeId`) |
| 2 | GET | `/api/ClaimFund/Masters/GetAdjustmentReasonById` | Masters | สาเหตุโอนเพิ่ม By Id (`AdjustmentReasonId`) |
| 3 | GET | `/api/ClaimFund/Masters/GetPaymentStatuses` | Masters | สถานะการจ่ายเงิน |
| 4 | GET | `/api/ClaimFund/Masters/GetBankAccountRelationTypes` | Masters | ประเภทความสัมพันธ์บัญชี–ผู้รับสินไหม |
| 5 | GET | `/api/ClaimFund/Masters/GetBankAccountRelationTypeById` | Masters | ประเภทความสัมพันธ์ By Id (`bankAccountRelationTypeId`) |
| 6 | GET | `/api/ClaimFund/Masters/GetRefundReasons` | Masters | ข้อมูลสาเหตุการโอนคืน (**ใหม่ใน APIGW**) |
| 7 | GET | `/api/ClaimFund/Masters/GetRefundReasonById` | Masters | สาเหตุโอนคืน By Id (`refundReasonId`) (**ใหม่**) |
| 8 | GET | `/api/ClaimFund/Masters/GetRefundStatus` | Masters | สถานะการคืนเงิน (**ใหม่**) |
| 9 | GET | `/api/ClaimFund/Setting/GetCurrentSetting` | Setting | ตั้งค่าการโอนเงิน (ดู ClaimFundPayTransfer.md §Setting) |
| 10 | POST | `/api/ClaimFund/Setting/UpdateSettingAutoTransfer` | Setting | บันทึกการตั้งค่าการโอนเงิน |
| 11 | GET | `/api/ClaimFund/Setting/SearchClaimOrCase` | Setting | ค้นจาก ClaimNo/CaseNo (`searchDetail` required) |
| 12 | GET | `/api/ClaimFund/IncreaseTransfer/IncreaseTransferLimitMonitors` | IncreaseTransfer | Monitor ขยายวงเงิน |
| 13 | GET | `/api/ClaimFund/AdditionalTransfer/GetAdditionalTransferAccountDetail` | AdditionalTransfer | รายละเอียดบัญชี (แก้ไขการโอนเงิน), `paymentId` |
| 14 | POST | `/api/ClaimFund/AdditionalTransfer/AdditionalTransferMonitor` | AdditionalTransfer | ตรวจสอบรายการโอนเงินเพิ่ม (Monitor) |
| 15 | GET | `/api/ClaimFund/AdditionalTransfer/GetClaimTransaction` | AdditionalTransfer | ประวัติ transaction ของเคลม (`caseId`) |
| 16 | GET | `/api/ClaimFund/AdditionalTransfer/AdditionalTransferDetails` | AdditionalTransfer | โอนเพิ่ม รายละเอียด step(1) (`caseId`) |
| 17 | GET | `/api/ClaimFund/AdditionalTransfer/GetClaimTransactions` | AdditionalTransfer | ประวัติการทำรายการ |
| 18 | GET | `/api/ClaimFund/AdditionalTransfer/TransferHistory` | AdditionalTransfer | ประวัติการโอนเงิน |
| 19 | GET | `/api/ClaimFund/AdditionalTransfer/GetDecreaseTransaction` | AdditionalTransfer | ประวัติการลดยอด (โอนเพิ่ม) |
| 20 | POST | `/api/ClaimFund/AdditionalTransfer/UpdateAdditionalTransfer` | AdditionalTransfer | แก้ไขการโอนเงินเพิ่ม |
| 21 | POST | `/api/ClaimFund/AdditionalTransfer/SaveAdditionalTransfer` | AdditionalTransfer | บันทึกการโอนเงินเพิ่ม |
| 22 | GET | `/api/ClaimFund/Inquiry/InquiryMonitors` | Inquiry | สอบถามธนาคาร Monitor |
| 23 | GET | `/api/ClaimFund/Inquiry/InquiryDetail` | Inquiry | สอบถามธนาคาร รายละเอียด (`PayTransferTransactionId` required) |
| 24 | GET | `/api/ClaimFund/FailedPayTransfer/FailedPayTransferTransactionMonitor` | FailedPayTransfer | Monitor - แก้ไขการโอนเงิน |
| 25 | GET | `/api/ClaimFund/FailedPayTransfer/FailedPayTransferTransactionDetail` | FailedPayTransfer | รายละเอียด Monitor (`PayTransferTransactionId` required) |
| 26 | GET | `/api/ClaimFund/Refund/SaveRefundDetails` | Refund | รายละเอียดการคืนเงิน (`caseId` required) |
| 27 | GET | `/api/ClaimFund/Refund/SaveRefundAccountDetail` | Refund | รายละเอียดบัญชีคืนเงิน (`paymentId` required) |
| 28 | GET | `/api/ClaimFund/Refund/GetClaimTransaction` | Refund | ประวัติ transaction สำหรับคืนเงิน |
| 29 | GET | `/api/ClaimFund/Refund/TransferHistory` | Refund | ประวัติการโอนเงินสำหรับคืนเงิน |
| 30 | GET | `/api/ClaimFund/Refund/GetDecreaseTransaction` | Refund | ประวัติการลดยอดสำหรับคืนเงิน |
| 31 | POST | `/api/ClaimFund/Refund/RefundMonitor` | Refund | Monitor การคืนเงิน |
| 32 | POST | `/api/ClaimFund/Refund/RefundApproveMonitor` | Refund | Monitor approve (มี filter วันที่ `fromDate`/`toDate` เพิ่ม) |
| 33 | POST | `/api/ClaimFund/Refund/CreateCaseRefund` | Refund | สร้างรายการเงินคืน |

> **ไม่มีใน APIGW**: `/Transfer/v1/*` (CreatePayment/EncryptText/PaymentDetails) และ `/Notification/*` — ยังอยู่ที่ feature ตัวเก่า (ดู `.opencode-ai/ClaimFundPayTransfer.md` §ช่องว่าง)

## รายละเอียด endpoint ที่ ClaimAgent ใช้ประจำ

### Masters (dropdown)
- `GetAdjustmentReasons` (เพิ่ม param `AdjustmentTypeId` ต่างจาก version เก่า), `GetPaymentStatuses`, `GetBankAccountRelationTypes`, `GetRefundReasons`, `GetRefundStatus`, ทั้ง `...ById` → response data = `{ id, name }`
- **ไม่มี** `GetTransferStatuses` (ต่างจาก swagger เก่าที่มี); ‘GetBankAccountRelationTypeById’ มีใน APIGW

### Setting
- `GetCurrentSetting` → data `{ paytransferSettingId, isAutoTransfer, history[] }` — เหมือน host เก่าเป๊ะ
- `UpdateSettingAutoTransfer` → body `{ paytransferSettingId }`

### Inquiry (สอบถามธนาคาร — bankStatusCheckAPI)
- `GET Inquiry/InquiryMonitors` → data = `usp_InquiryMonitor_SelectResult[]`:
  `paymentId`, `toAccountNo`, `toAccountName`, `toBank`, `totalNetPaidAmount`, `paymentCode`, `createdDate`, `claimNo`, `payTransferTransactionId`, `transferStatusId`, `transferStatusName`, `payListHeaderId`, `totalCount`
  - query params: `searchDetail`, `orderingField`, `ascendingOrder`, `Page`, `recordsPerPage` (หน้า BankStatus ส่งแบบนี้)
- `GET Inquiry/InquiryDetail?PayTransferTransactionId=` (required) → data = `BankInquiryDetailResponseDto`: `transRefNo`, `createdDate`, `payerBankName`, `statusBank`, `descriptionTH`, `status`
  - ⚠️ ชื่อ param ใช้ตัวพิมพ์ใหญ่ผสม `PayTransferTransactionId` — ตามสเปกเลย ห้ามเปลี่ยน

### FailedPayTransfer (ManageTransfer)
- `FailedPayTransferTransactionMonitor` → data = `usp_FailedPayTransferTransaction_SelectResult[]` ≈ ฟิลด์เดียวกับ InquiryMonitors แต่เพิ่ม `caseNo`, `claimCreated`, `paymentStatusId`, `paymentStatusNameTH`, `paymentId`
- `FailedPayTransferTransactionDetail?PayTransferTransactionId=` (required) → data ≈ `BankInquiryDetailResponseDto` (transRefNo, createdDate, payerBankName, statusBank, descriptionTH, status)

### AdditionalTransfer (AdjustTransfer)
- `AdditionalTransferMonitor` (POST) → body `{ branceId?, paymentStatusId? }` + query pagination → data = `usp_AdditionalTransferMonitor_SelectResult[]` (caseId, claimId, claimNo, caseNo, createdDate, customerName, branchName, paymentStatusNameTH, remark, totalNetPaidAmount, addPayAmount, totalCount, paymentStatusId, casePayableId, paymentId)
- `GetAdditionalTransferAccountDetail?paymentId=` → data[] = `AdditionalTransferAccountDetailsResponseDto` (toAccountName, toAccountNo, toBank, toBankId, phoneNo, claimantAccountRelationship, casePayableId)
- `AdditionalTransferDetails?caseId=` → data = `{ claimId, caseId, claimNo, customerName, createdByUserName, totalNetPaidAmount, countItem, additionalTransferLimit, caseDetails: CaseDetailDto[], account: accountDetail }`
- `UpdateAdditionalTransfer` (POST) → required: `bankAccountRelationTypeId, toBankId, toBankAccountNo, toBankAccountName, phoneNumber`; optional: totalNetPaidAmount, paymentId, caseId, casePayableId, claimId, toBankName → response `{ isSuccess, message }`
- `SaveAdditionalTransfer` (POST) → required: `toBankId, toBankName, toBankAccountNo, toBankAccountName, phoneNumber`; optional: caseId, claimNo, caseNo, totalNetPaidAmount, adjustmentReasonId, remark → response `{ isSuccess, message, casePayableId }`
- `GetClaimTransaction`/`GetClaimTransactions`/`TransferHistory`/`GetDecreaseTransaction` — ประวัติ (มี `caseId` + pagination)

### Refund (Refund + RefundApprove)
- `RefundMonitor` (POST) → body `{ branceId?, refundStatusId? }` + pagination → data = `RefundMonitorResponse[]`
- `RefundApproveMonitor` (POST) → body `{ branceId?, refundStatusId?, fromDate?, toDate? }` + pagination → data = `RefundApproveMonitorResponse[]` (เพิ่มฟิลด์ `branceName` เทียบกับ RefundMonitorResponse)
  - response fields (ร่วมกัน): `caseId, claimId, refundNo, claimNo, caseNo, createdDate, customerName, remark, totalNetPaidAmount, refundAmount, refundStatusId, refundStatusNameTH`
- `SaveRefundDetails?caseId=` (required) → data ≈ `AdditionalTransferDetailsResponseDto` (มี caseDetails + account)
- `SaveRefundAccountDetail?paymentId=` (required) → data[] = `RefundDetailsAccountDetailsResponseDto` (toAccountName, toAccountNo, toBank, toBankId, phoneNo, casePayableId, claimantAccountRelationship)
- `CreateCaseRefund` (POST) → body `CreateRefundRequestDto`: `cacseId` (สะกดผิดในสเปก!), `claimId`, `refundReasonId`, `adjustmentTypeId`, `refundDate`, `remark` (nullable), `decreaseAmount` (double, required) → data `{ caseAdjustmentId }`

---

## การเชื่อมกับโค้ด frontend (อ้างอิงความจำจากไฟล์โน้ตอื่น — ตรวจอีกทีก่อนใช้)

| กลุ่ม API | โมดูล frontend ที่ใช้ | ไฟล์ |
|---|---|---|
| `Refund/*` | Refund / RefundApprove | `Refund/refundAPI.ts`, `refundApproveAPI.ts` |
| `Inquiry/*` | BankStatus (สอบถามธนาคาร) | `BankStatus/bankStatusCheckAPI.ts` |
| `AdditionalTransfer/*` | AdjustTransfer | `AdjustTransfer/adjustTransferMonitorAPI.ts` |
| `FailedPayTransfer/*` | ManageTransfer | `ManageTransfer/repayAPI.ts` (`/FailTransfer/...` — ดูข้อสังเกตด้านล่าง) |
| `Setting/*` | ManageClaimFund | `ManageClaimFund/manageClaimFundAPI.ts` |
| `IncreaseTransfer/*` | — | `increaseLimitTransferAPI.ts` ยังว่าง (รอเชื่อม) |
| คุม base | — | `Const.ts`: `APIGW_CLAIM_FUND_API_URL` = `.../api/ClaimFund` (env `VITE_APIGW_CLAIM_FUND_API_URL`) |

## ข้อสังเกต/กับดัก
- Path ใน swagger เป็น `/api/ClaimFund/Inquiry/InquiryMonitors` → base ฝั่งโค้ดคือ `APIGW_CLAIM_FUND_API_URL` (env มี `/api/ClaimFund` ครบ) แล้วต่อ `/Inquiry/...`
- `Page` (ตัวพิมพ์ใหญ่) ใน query — frontend ต้องส่งให้ตรง pattern นี้
- `ManageTransfer/repayAPI.ts` โค้ดชี้ `/FailTransfer/...` แต่ swagger ใช้ชื่อ controller `FailedPayTransfer` — ต้องยืนยัน 2 อย่างว่ากันคนละ resource หรือ mapping กัน (เคยลงไว้ใน `.opencode-ai/ClaimFundAdditionalTransfer.md`)
- `coreClaimApi.client.ts` (generated) มี class ClaimFundApi จาก swagger ของ APIGW แต่ไม่ถูก instantiate — โค้ดใช้ raw axios เองทั้งหมด