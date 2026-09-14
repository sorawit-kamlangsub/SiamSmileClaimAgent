# Memory — ClaimAgent

## หมายเหตุสำคัญที่สุด (อ่านก่อนเสมอ)

- **รากที่เชื่อถือได้ = `D:\source\repo\ClaimAgent\src\app\modules\...`** (ผ่าน `read`/`edit` tool)
- มี mirror/ghost อีกต้น (`D:\source\repo` ตัวอื่น) ซึ่ง bash/git/Select-String มัก resolve ไปเจอทุกที และทำลาย byte string (`0hed`, `useTime`, `useState(0hed)` ฯลฯ) ตลอด
- **กฎ 2 ข้อที่ทำให้งานสำเร็จ (แทนที่จะวนลูป):**
  1. `read` tool เท่านั้น → เอา `oldString` มาจาก output ของ `read` ตรงตัว (byte-for-byte)
  2. ห้ามเอาค่า byte ใด ๆ จาก bash/git มาใส่ใน `edit` — git diff/bash มักถูกแทน CRLF/LF และ byte-corrupt จน `edit` ไปไม่ถึง

## สถานะงาน: Refund decoupling (ย้าย search form ออกจาก shared module)

เป้า: `ClaimSearchFilterForm` ที่ `IncreaseLimitTransfer/_common/` เป็นของ payment (IncreaseLimitTransfer) ล้วน อย่าให้มีคนใช้ module นั้นต้องแตะ Refund — ย้ายลอจิก refund ไปเป็นโมดูล Refund ของตัวเอง

### เสร็จแล้ว ✅
- `ClaimSearchFilterForm.tsx` (shared) = **payment-only กลับมาแล้ว** — ไม่มี `useGetRefundStatus` / `statusSource` / `statusId`-refund อีกต่อไป
- **โมดูลใหม่ `Refund/_common/RefundSearchFilterForm.tsx`** — self-contained:
  - import เฉพาะ: `useGetBranch` (IncreaseLimitTransfer/masterAPI) + `useGetRefundStatus` (Refund/refundAPI)
  - export: `RefundSearchFilterValues` (`searchBy`, `searchText`, `branchId`, `statusId`, `transferDateFrom/To`) + `RefundSearchFilterFormProps` (`initialValues?`, `onSubmit`)
  - มี dropdown สาขา / สถานะ refund / ช่วงวันที่, ปุ่มค้นหา
- **`refundAPI.ts`** → ขยาย `GetRefundMonitorFilterType` เพิ่ม `searchDetail?`, `searchKey?`, `enabled?` และรวมเข้า query key — **ทุกกดค้นหา (searchKey เปลี่ยน) call API ใหม่เสมอ** ส่วน `enabled` default เท่าเดิม (`!!refundStatusId`) จึงไม่กระทบ `RefundDataTableHook` เดิม
  - `getRefundMonitorData` POST body เพิ่ม `searchDetail` เฉพาะเมื่อมีค่า (ไม่ส่งถ้า null/empty)
- **`RefundApprovePage.tsx`** → ใช้ `RefundSearchFilterForm` แล้ว
  - state: `filter: RefundSearchFilterValues | undefined`, `hasSearched: boolean`, `searchKey: number`
  - `handleSearch` = setFilter + hasSearched=true + `searchKey+1` → **ทุกกดค้นหา call API ใหม่ (searchKey ใน query key)**
- **`RefundApprove/hooks/RefundApproveDataTableHook.tsx`** → เลิกใช้ mock dataMock เปลี่ยนเป็นยิง `useGetRefundMonitorWithFilter` จริง
  - รับ props `{ filter, hasSearched, searchKey }` (import type จาก `Refund/_common/RefundSearchFilterForm`)
  - mapping: `searchText→searchDetail`, `branchId→branceId`, `statusId→refundStatusId`
  - columns แสดงผลจาก response จริง; actions: status 2 → ดำเนินการ, status 3 → ดูรายละเอียด
- **`RefundApprove/components/RefundApproveDataTable.tsx`** → รับ props `{ filter, hasSearched, searchKey }` ส่งต่อให้ hook
  - ใช้ `ClaimFundStandardDataTable` + `delayNoMatch={hasSearched}`

### เสร็จแล้วเพิ่มเติม (session รอบหลัง) ✅
- **ตาราง monitor อนุมัติคืนเงิน (RefundApprove) → switch ไปใช้ API `Refund/RefundApproveMonitor`** (เดิมใช้ `Refund/RefundMonitor` ร่วมกับหน้า Refund)
  - `refundAPI.ts`: เพิ่ม key `getRefundApproveMonitorKey` + `useGetRefundApproveMonitorWithFilter` + `getRefundApproveMonitorData` — contract เดียวกับ `RefundMonitor` (POST body `branceId`/`refundStatusId`/`searchDetail` + query `Page`/`recordsPerPage`, response pagination เดิม) — `RefundMonitor` และ hook เดิมคงไว้ให้หน้า Refund ใช้ต่อ
  - `RefundApproveDataTableHook.tsx`: import สลับเป็น `useGetRefundApproveMonitorWithFilter`
- **Empty state (โหลดเสร็จแล้ว `data=[]`) → ขึ้น "ไม่พบข้อมูล" ทันที**
  - `RefundApproveDataTable.tsx`: ใช้ `noMatchText={NOT_FOUND_MESSAGE}` (constant จาก `claimFundStandardAlertMessage.ts`) + `delayNoMatch={false}` — เลิกแสดง "กำลังโหลดข้อมูล..." ค้างอีก 30 วิ (pitfall จาก `LOADING_NO_DATA_DELAY_MS` ใน `ClaimFundStandardDataTable`: effect reset timer ตอน `isLoading` เปลี่ยน → `minDelayReached` มา 30 วิหลังโหลดเสร็จ)
- **Error display 404 / error อื่น → เข้า table ผ่าน `mapErrorMessage` กลางของ ClaimFund**
  - `RefundApproveDataTable.tsx`: ส่ง `isError`/`error` ต่อจาก hook → `ClaimFundStandardDataTable` (ถ้า `isError` จะแสดงข้อความ error แทน noMatch)
  - `getRefundApproveMonitorData`: เปลี่ยนลอจิก error — `isSuccess:false` เดิมคืน `{...res.data, data:[]}` เงียบ (ขึ้น "ไม่พบข้อมูล") → เปลี่ยนเป็น throw `res.data.message`; catch สำคัญเอา `response.data?.message` ก่อน `err.message` แล้วค่อย fallback เป็น ""
  - **อย่าลืม:** อย่า `throw err.message` ตรง ๆ จาก `catch (err: Error)` เพราะ axios HTTP error จะได้แค่ "Request failed with status code 404" เสมอ — ต้องขุด `err.response.data.message` ก่อนเสมอ
- **Timeout API monitor อนุมัติคืนเงิน = 30 วิ** — `.post(url, body, { timeout: 3000 })` เฉพาะ `getRefundApproveMonitorData` (หน้า Refund ยังไม่ได้ตั้ง)

### ค้าง ⏳ (งานต่อไป)
- ปุ่มดำเนินการ/ดูรายละเอียดในตารางยังเป็น TODO (console.log) — รอเชื่อม dialog/detail page
- typecheck: ผ่านในไฟล์ที่แก้ ทั้งหมด error เหลือจาก module อื่นที่มีอยู่เดิม (AdjustTransfer, BankStatus, ManageClaimTransferDetails, ManageTransfer)

### ขั้นตอนต่อไป (ถ้าทำต่องาน)
1. เปิด dialog / navigate เมื่อกด action ใน `RefundApproveDataTableHook`
2. `npx tsc --noEmit` สำหรับ typecheck

## เดินหน้าแบบตรงไปตรงมา
- อ่านด้วย `read` → แก้ด้วย `edit` (oldString จาก read แท้) — อย่าใช้ bash เป็นแหล่ง byte

## ความรู้ที่เจอระหว่างงาน (ถ้าเจอซ้ำให้ใช้แบบนี้)

### @tanstack/react-query v4 — `isLoading` เป็น `true` ถ้า query ถูก disabled ยังไม่เคย fetch
- ใน v4 `isLoading = (status === 'loading')` ซึ่งมีค่า true ตั้งแต่ mount ถ้ายังไม่มี data แม้ `enabled: false` (ต่างจาก v5 ที่ `isLoading = isPending && isFetching`)
- ผล: monitor table ที่ยิง query แบบ conditional (`enabled: hasSearched` / `!!statusId`) จะขึ้น "กำลังโหลดข้อมูล..." ทั้งที่ยังไม่ได้ค้นหา
- **ทางแก้ (ตามแบบ RefundDataTable): gate `isLoading` ที่ส่งให้ table ด้วยเงื่อนไขเดียวกับ `enabled`**

```tsx
// RefundApprove/RefundDataTable ใช้ pattern นี้
<ClaimFundStandardDataTable
    ...
    isLoading={hasSearched ? isLoading : false}   // แทนที่จะส่ง isLoading ตรงๆ
    delayNoMatch={hasSearched}
/>
```

- เมื่อยังไม่ search (`hasSearched=false`): `isLoading=false` → `ClaimFundStandardDataTable` แสดง default `noMatchText` = **"ไม่พบข้อมูล"**
- เมื่อ search แล้ว: `isLoading` ตามจริง → ขึ้น "กำลังโหลดข้อมูล..." ระหว่าง fetch ตามปกติ
- กรณี `enabled` ไม่ได้ใช้และ query fire ทันที (ไม่มี gate) จะไม่เกิดปัญหานี้
