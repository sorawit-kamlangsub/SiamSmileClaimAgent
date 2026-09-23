# งาน "สอบถามธนาคาร" / BankStatus (BankStatusCheck)

> **เวลาทำงานเกี่ยวกับสอบถามธนาคาร (BankStatus / Inquiry) ต้องเปิดไฟล์นี้มาอ่านก่อนทุกครั้ง**
> ห้ามข้ามแม้ภารกิจจะดูง่าย ทุกงานของโมดูล `BankStatus` + API `/Inquiry/...` และ `/PayTransfer/inquirytransectionbank`

> ## ⛔ กฎตายตัว (decision ของ user — ห้าม agent แก้ base เอง)
> **โมดูลสอบถามธนาคาร "ไม่ย้าย" ไป `VITE_APIGW_CLAIM_FUND_API_URL` — ให้ใช้ `VITE_CLAIM_FUND_API_URL` (= `https://claimfundapi.uatsiamsmile.com`) ถาวร**
> - `Inquiry` endpoints: base = `${API_CLAIM_FUND_URL}/api/ClaimFund` (⚠️ env ไม่มี suffix นี้ในตัว — ต้องต่อเอง)
> - `inquirytransectionbank`: base = `${APIGW_URL}/pay` (คนละ host, คงเดิม)
> - **user แก้โค้ดเอง** — agent ห้ามแก้/แกว่งค่า base ของ `bankStatusCheckAPI.ts` เอง นอกเสียจาก user ขอแก้ filename อื่นในโมดูลนี้

---

## โครงสร้างโมดูล (route `/manage/bank/status`)

| ประเภท | ไฟล์ | บทบาท |
|---|---|---|
| Page | `pages/BankStatusCheck.tsx` | หน้าเพจ = SearchFilter + DataTable (Grid 2 แถว) |
| Component | `components/SearchFilterClaimForBank.tsx` | ฟอร์มค้นหา (FormikTextField) — dispatch ไป redux slice |
| Component | `components/BankStatusCheckDataTable.tsx` | ตารางหลัก; action "ยืนยันการสอบถามธนาคาร" (ส่งไปธนาคาร); ขยายเปิด `TransactionStatusDataTable` |
| Component | `components/TransactionStatusDataTable.tsx` | ตารางรายละเอียดสถานะ transaction (ยิง `useGetInquiryDetailMonitors`) |
| Hook | `hooks/SearchFilterClaimForBank.tsx` | formik + dispatch `setSearchBankStatusBySearchDetail` |
| Hook | `hooks/BankStatusCheckDataTableHook.tsx` | columns/actions ตารางหลัก; ยิง `useGetInquiryMonitors` + confirm และ `useSentToBank` (ใช้ `swalConfirm`/`swalError`/`swalSuccess`) |
| Hook | `hooks/TransactionStatusDataTableHook.tsx` | columns ตารางสถานะ transaction |
| State | `store/bankStatusCheckSlice.ts` | searchDetail |
| API | `bankStatusCheckAPI.ts` | layer API ทั้งหมดของโมดูลนี้ |

- Sidebar: `ASideMenuList.tsx` → `/manage/bank/status` ใช้ `AccountBalanceIcon`; route กำหนดใน `Routes.tsx`
- Pattern: table ใช้ `StandardDataTable` (ไม่ใช่ `ClaimFundStandardDataTable`)

## API (bankStatusCheckAPI.ts)

> **base ของ Inquiry endpoints ใช้ `VITE_CLAIM_FUND_API_URL` (`API_CLAIM_FUND_URL` = `https://claimfundapi.uatsiamsmile.com`) + suffix `/api/ClaimFund`** — เปลี่ยนตามคำสั่ง user (กลับไปเป็น host เดิม ไม่ใช่ `VITE_APIGW_CLAIM_FUND_API_URL` เหมือนไฟล์อื่น)
> ระวัง: env `VITE_CLAIM_FUND_API_URL` ไม่มี `/api/ClaimFund` ในตัว (ต่างจาก `VITE_APIGW_CLAIM_FUND_API_URL` ที่มีครบ) → ต้องต่อ suffix เองเป็น `${API_CLAIM_FUND_URL}/api/ClaimFund`

- `useGetInquiryMonitors(payload: { searchDetail, page, recordsPerPage })` → `GET {API_CLAIM_FUND_URL}/api/ClaimFund/Inquiry/InquiryMonitors` (query params)
- `useGetInquiryDetailMonitors({ payTransferTransactionId })` → `GET {API_CLAIM_FUND_URL}/api/ClaimFund/Inquiry/InquiryDetail` — `enabled: !!payTransferTransactionId`
- `useSentToBank(onSuccess, onError)` → `POST {APIGW_URL}/pay/PayTransfer/inquirytransectionbank` body `{ refCode }` — **ใช้ `APIGW_URL` ฝั่ง `/pay` ไม่ใช่ base ของ ClaimFund** (`payTransferGWAPI_URL = ${APIGW_URL}/pay`); ทุก mutation สำเร็จ/error จะ `invalidateQueries([getInquiryMonitors])`

## สถานะงาน / โน้ตความรู้

- ✅ **decision (ถาวร): สอบถามธนาคารใช้ api เดิม `VITE_CLAIM_FUND_API_URL` = `https://claimfundapi.uatsiamsmile.com` — "ไม่ย้าย" ไป APIGW**
  - `Inquiry` endpoints: base `${API_CLAIM_FUND_URL}/api/ClaimFund`; `payTransferGWAPI_URL` = `${APIGW_URL}/pay` คงเดิม
  - **user แก้โค้ดเอง** — โค้ดถูกแกว่งกลับเป็น `APIGW_CLAIM_FUND_API_URL` หลายรอบ → agent ห้ามแก้/แกว่ง base ไฟล์นี้เอง
- ❗ **`catch (err: Error) { throw err.message; }` อยู่ทุก API ในไฟล์นี้** — ปัญหาเดียวกับที่เจอตอน Refund: axios HTTP error (404/5xx) `err.message` จะได้แค่ "Request failed with status code 404" เสมอ ทิ้ง `response.data.message` → ถ้าเป็นงาน error display ต้องแก้ให้ขุด `err.response?.data?.message` ก่อน (ดูทางแก้จาก `getRefundApproveMonitorData` ใน `refundAPI.ts`)
- ❗ `useSentToBank` บริหาร `isSuccess:false` เองผ่าน callback (ไม่ throw) — ส่วนอีก 2 ตัว `isSuccess:false` จะ `throw res.data.message` ตามมาตรฐานโปรเจค
- typecheck error เดิมของโมดูลนี้: `TransactionStatusDataTableHook.tsx:29` → `rowIndex` ประกาศแต่ไม่ได้ใช้ (TS6133) — ยังไม่ได้แก้
- งานยังไม่เจอ task เลิก/ค้างเพิ่มเติม — อัปเดตที่ไฟล์นี้เมื่อมีงานใหม่

---

## ไฟล์ที่เกี่ยวข้องข้ามโมดูล
- `ClaimFundAdditionalTransfer.md` — มีตาราง migration host เดิมระบุ `BankStatus` ว่าย้ายไป APIGW แล้ว — **decision (ปัจจุบัน): BankStatus "ไม่ย้าย" ใช้ `VITE_CLAIM_FUND_API_URL` ถาวร** (user จัดการเอง — ไม่เหมือนไฟล์อื่นในตารางนั้น)