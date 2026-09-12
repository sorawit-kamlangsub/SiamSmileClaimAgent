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
- `RefundApprovePage.tsx` → ใช้ `RefundSearchFilterForm` แล้ว
  - state: `filter: RefundSearchFilterValues | undefined`, `hasSearched: boolean`, `searchKey: number`
  - `handleSearch` = setFilter + hasSearched=true + `searchKey+1` → **ทุกกดค้นหา call API ใหม่ (searchKey ใน query key)**
  - ใช้ `useGetRefundApproveMonitor({ branceId: filter.branchId, refundStatusId: filter.statusId, searchDetail: filter.searchText, pagination, enabled, searchKey })`

### ค้าง ⏳ (ไฟล์ 2 ไฟล์ยังอ้าง shared type)
- `RefundApprove/components/RefundApproveDataTable.tsx` — import `ClaimSearchFilterValues` จาก `.../IncreaseLimitTransfer/_common/ClaimSearchFilterForm`
- `RefundApprove/hooks/RefundApproveDataTableHook.tsx` — import เดียวกันกับข้างบน

ต้องเปลี่ยน: import type → `RefundSearchFilterValues` จาก `../../Refund/_common/RefundSearchFilterForm` และ mapping prop ตามหน้า (searchText→searchDetail, branchId→branceId, statusId→refundStatusId)

### ขั้นตอนต่อไป
1. `read` 2 ไฟล์นั้น (components + hooks) ด้วย `read` tool
2. `edit` oldString = import line จริงจาก read ข้างบน
3. `npx tsc --noEmit` สำหรับ typecheck

## เดินหน้าแบบตรงไปตรงมา
- อ่านด้วย `read` → แก้ด้วย `edit` (oldString จาก read แท้) — อย่าใช้ bash เป็นแหล่ง byte
