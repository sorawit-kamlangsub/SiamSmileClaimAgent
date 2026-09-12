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

### ค้าง ⏳ (งานต่อไป)
- ปุ่มดำเนินการ/ดูรายละเอียดในตารางยังเป็น TODO (console.log) — รอเชื่อม dialog/detail page
- typecheck: ผ่านในไฟล์ที่แก้ ทั้งหมด error เหลือจาก module อื่นที่มีอยู่เดิม (AdjustTransfer, BankStatus, ManageClaimTransferDetails, ManageTransfer)

### ขั้นตอนต่อไป (ถ้าทำต่องาน)
1. เปิด dialog / navigate เมื่อกด action ใน `RefundApproveDataTableHook`
2. `npx tsc --noEmit` สำหรับ typecheck

## เดินหน้าแบบตรงไปตรงมา
- อ่านด้วย `read` → แก้ด้วย `edit` (oldString จาก read แท้) — อย่าใช้ bash เป็นแหล่ง byte
