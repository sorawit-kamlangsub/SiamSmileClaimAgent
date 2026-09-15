# โน้ตงาน ClaimFundPayTransfer (งานใหม่) — ทำความเข้าใจ API PayTransfer

> **ต้นทาง**: ดึงจาก `https://claimfundapi.uatsiamsmile.com/swagger/v1/swagger.json` (host เก่า) — ดึงเมื่อ 2026-09-14
> **title**: `ClaimFundAPI` / version `v1.0.0`
> จุดประสงค์: ให้ AI เข้าใจ workflow การโอนเงิน (PayTransfer) ของ ClaimFund ก่อนเริ่มงานใหม่

---

## ภาพรวม API (จาก swagger)

> ClaimFundAPI เป็นบริการกลางสำหรับการโอนเงินเพื่อจ่ายค่าสินไหมทดแทนของการเคลมประกันภัย รองรับการโอนเงินอย่างปลอดภัย การตรวจสอบความถูกต้องของบัญชีผู้รับเงิน การติดตามรายการธุรกรรม และการจัดการสถานะการชำระเงิน ผ่าน REST API มาตรฐาน

**Common response envelope** (ทุก response เป็น `*ServiceResponse`):
```
{ data, isSuccess, message, code, exceptionMessage, serverDateTime,
  totalAmountRecords, totalAmountPages, currentPage, recordsPerPage, pageIndex }
```

**Security**: ทุก endpoint มี `oauth2` (scope `ClaimFundAPI`)

## ตาราง endpoint (17)

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/Masters/GetAdjustmentReasons` | ข้อมูลสาเหตุการโอนเพิ่ม |
| GET | `/api/Masters/GetAdjustmentReasonById?AdjustmentReasonId=` | ข้อมูลสาเหตุการโอนเพิ่ม By Id |
| GET | `/api/Masters/GetTransferStatuses` | ข้อมูลสถานะการโอนเงิน (Transfer Status) |
| GET | `/api/Masters/GetPaymentStatuses` | ข้อมูลสถานะการจ่ายเงิน (Payment Status) |
| GET | `/api/Masters/GetBankAccountRelationTypes` | ข้อมูลประเภทความสัมพันธ์ของบัญชี กับผู้รับสินไหม |
| GET | `/api/Masters/GetBankAccountRelationTypeById?bankAccountRelationTypeId=` | ข้อมูลประเภทความสัมพันธ์ของบัญชี By Id |
| GET | `/api/Notification/GetTransactionById?payTransferTransactionId=` | Get Transaction ของรายการส่ง SMS |
| POST | `/api/Notification/UpdateSMSTransactionSurvey` | Update SurveyId ใน SMSTransaction |
| POST | `/api/Notification/SaveSurveyFeedback` | ผลตอบแบบประเมิน |
| GET | `/api/Notification/GetSurveyId` | Get surveyId |
| GET | `/api/Setting/GetCurrentSetting` | ตั้งค่าการโอนเงิน |
| POST | `/api/Setting/UpdateSettingAutoTransfer` | บันทึกการตั้งค่าการโอนเงิน |
| GET | `/api/Setting/SearchClaimOrCase?searchDetail=` | ค้นหารายการจาก เลขที่ ClaimNo / CaseNo |
| POST | `/api/Transfer/v1/CreateTransferResult` | Step 3 — ทดสอบผลการสร้างรายการโอนเงิน |
| POST | `/api/Transfer/v1/CreatePayment` | สร้างรายการโอนเงิน และโอนเงิน |
| GET | `/api/Transfer/v1/PaymentDetails?referenceCode=` | รายละเอียดการโอน (ไม่มี summary ใน swagger) |
| GET | `/api/VersionControl/GetApplicationVersionControl` | Version ของ Application |

## Workflow โอนเงิน (PayTransfer) ตามที่ swagger บอก

1. **`POST /api/Transfer/v1/CreatePayment`** — รับ `array` ของ `CreatePaymentRequestDto` → สร้างรายการโอน + โอนเงิน
   - response `data: CreatePaymentResponseDto` → ได้ `payListHeaderId`, `refTransactionId`, `itemCout`, `totalNetPaidAmount`, และ `paymentCodeResponse[]` (รหัสพาดหัว `CPG...`)
   - ข้อมูล response เป็นตัวเชื่อมกับ `referenceCode` ของ `PaymentDetails` และ `refCode` ของ `CreateTransferResult`
2. **`POST /api/Transfer/v1/CreateTransferResult`** — Step 3 (ผลจากธนาคารกลับมา), body `PayListResult` → `isSucceed` + `transRefNo`, `statusBank`, `transferDate`...
   - สังเกตว่าเป็น "ทดสอบ" ตาม summary — ตรวจ `refCode`+`isSucceed` คู่กับรายการก่อนหน้านี้
3. **`GET /api/Transfer/v1/PaymentDetails?referenceCode=`** — ดึงใบรายละเอียดการโอน (`PaymentTransactionResponseDto`: paymentId, totalNetPaidAmount, accountNo/Name, bankName, paymentCode, paymentItemDetail[])

### Request/Response fields ที่สำคัญ

**`CreatePaymentRequestDto`** (required: `casePayableId, claimCase, claimNo, grossPaidAmount, netPaidAmount, phoneNumber, receivingAccountName, receivingBankAccountNo, receivingBankId, receivingBankName, withHoldingTaxAmount`)
- `casePayableId`: uuid • `grossPaidAmount`/`withHoldingTaxAmount`/`netPaidAmount`: double
- `receivingBankId`: integer • `receivingBankAccountNo`/`receivingBankName`/`receivingAccountName`/`phoneNumber`/`claimCase`/`claimNo`: string (minLength 1)
- optional: `payeeTypeId`, `paymentTypeId`, `userId` (integer)

**`CreatePaymentResponseDto`** → `itemCout` (int) • `totalNetPaidAmount` (double?) • `isSuccess` • `message` • `payListHeaderId` (uuid?) • `refTransactionId` (uuid?) • `paymentCodeResponse[]` ({ `paymentCode`: string })

**`PayListResult`** (body ของ CreateTransferResult) → `refCode` (uuid?) • `isSucceed` (bool) • `transRefNo`? • `statusBank`? • `description`/`descriptionTh`? • `transferDate`/`updatedDate` (datetime?) • `payResultStatusId` (int?) • `payResultDescription`? • `transType`?

**`PaymentTransactionResponseDto`** → `paymentDate`/`printDate`/`admissionDate` (datetime?) • `countItem` (int) • `paymentId` (uuid) • `totalNetPaidAmount`? • `customerName`/`employee`/`accountNo`/`accountName`/`bankName`/`paymentCode`? • `paymentItemDetail[]` (`PaymentItemDetailDto`: claimNo, customerName, transactionAmount, bankName, approvedAmount)

### Setting (ตั้งค่าการโอนเงิน)
- `GET /api/Setting/GetCurrentSetting` → `data: PayTransferSettingResponseDto` = `{ paytransferSettingId: uuid, isAutoTransfer: bool, history: PayTransferSettingHistoryResponseDto[] }` — history = `{ createdByUser, employeeCode, isAutoTransfer, createdDate }`
- `POST /api/Setting/UpdateSettingAutoTransfer` → body `{ paytransferSettingId: uuid }` (required) — สังเกตว่า swagger รับแค่นี้ และโค้ด `manageClaimFundAPI.ts` ก็ส่งแค่นี้ตามสเปกพอดี (ไม่มี `isAutoTransfer` ใน request)

### Masters / Notification (ตัวช่วย)
- Masters: `GetAdjustmentReasons`, `GetTransferStatuses`, `GetPaymentStatuses`, `GetBankAccountRelationTypes` → list `{ id, name }`
- Notification: ใช้ตอนส่ง SMS + ประเมินผล (`GetSurveyId`, `UpdateSMSTransactionSurvey`, `SaveSurveyFeedback`, `GetTransactionById`)

## ⚠️ สิ่งที่ swagger นี้บอกว่า "ไม่มี" (สำคัญผิดพลาดถ้าเดา)

1. **ไม่มี `/Inquiry/...`, `/AdditionalTransfer/...`, `/Refund/...`, `/FailedPayTransfer/...`, `/IncreaseTransfer/...`** ใน swagger host เก่านี้ — กลุ่มพวกนั้น (ใหม่กว่า) อยู่ใน swagger APIGW (`/api/ClaimFund/...`) ในโน้ต `.opencode-ai/ClaimFundApi.md`
2. **ไม่มี `/api/Transfer/v1/EncryptText`** (แต่ repo เรียกใช้จริงใน `claimFundApi.ts`) — endpoint นี้ยังมีอยู่จริงแม้ไม่อยู่ใน swagger
3. **`/pay/PayTransfer/inquirytransectionbank`** (ส่งสอบถามธนาคาร) เป็นคนละ host (`APIGW_URL` ฝั่ง `/pay`) ไม่อยู่ใน swagger นี้

## การเชื่อมกับโค้ด frontend (ตรวจจาก repo แล้ว)

| ไฟล์ | base ปัจจุบัน | endpoint ที่ยิง | ใช้โดย |
|---|---|---|---|
| `src/app/api/claimFundApi.ts` | `APIGW_CLAIM_FUND_API_URL` (APIGW) | `/Transfer/v1/CreatePayment`, `/Transfer/v1/EncryptText` | ClaimPA `useConfirmClaimPayment`, ClaimPH `useCreateClaimPH`/`useCreateContinuedClaimPH`, `useHospitalConsiderPayment` (ต้องยิง EncryptText ก่อนเสมอ) |
| `src/app/modules/Survey/surveyAPI.ts` | `APIGW` (เดิม) | `/Transfer/v1/PaymentDetails` | `useGetPaymentDetails(ref)` |
| `src/app/modules/ManageClaimFund/manageClaimFundAPI.ts` | `APIGW_CLAIM_FUND_API_URL` | `/Setting/GetCurrentSetting`, `/Setting/UpdateSettingAutoTransfer` | หน้า ManageClaimFund |

## ⚠️ ช่องว่างที่พบ (ต้องยืนยันกับ backend ก่อนทำงาน)

- swagger APIGW (`ClaimFundApi.md`) **ไม่มี** `/Transfer/v1/*` และ `/Notification/*` ในกลุ่ม `ClaimFund` (มีแค่ 33 endpoint ตามโน้ตนั้น) — แต่โค้ดยังยิง `/api/ClaimFund/Transfer/v1/...` ที่ base `APIGW_CLAIM_FUND_API_URL`
- สรุป: ยังไม่ชัดว่า APIGW เปิด `Transfer/v1` + `Notification` ให้จริงหรือยัง — ถ้างานใหม่แตะ `CreatePayment`/`PaymentDetails`/`manageClaimFund` ต้องถาม backend ก่อน ไม่ใช่สมมติว่า APIGW มี

---

## หมายเหตุ
- swagger ดึงมาเก็บ raw ไว้ใน temp (`claimfundapi.json`) — ถ้า host เปลี่ยนเวอร์ชันให้ re-fetch แล้วอัปเดตโน้ตนี้