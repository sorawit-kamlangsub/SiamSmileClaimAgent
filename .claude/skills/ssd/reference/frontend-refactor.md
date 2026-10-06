
# SSD Frontend Refactor — แก้ไข Code React/TypeScript อย่างปลอดภัย

## บริบท

Refactor ที่ไม่ระวังทำให้ TypeScript compile พัง หรือ runtime error ได้ skill นี้แบ่งการแก้ไขเป็น 4 Tiers ตามความเสี่ยง และบังคับ verify หลังทุกไฟล์เพื่อให้มั่นใจว่า code ยังทำงานได้

---

## Safety Tiers — ระดับความเสี่ยงการแก้ไข

| Tier | ประเภทการแก้ไข | Action |
|------|---------------|--------|
| **1 — ปลอดภัยเสมอ** | Fragment syntax, import order, whitespace, Boolean prop `={true}` | แก้ได้เลย ไม่ต้อง compile check |
| **2 — ปลอดภัยหลัง compile** | Local variable rename, `any` → `unknown`, unused imports, `React.Fragment` → `<>` | แก้แล้ว `npx tsc --noEmit` ทุกครั้ง |
| **3 — ตรวจ usages ก่อน** | Props type rename, exported component/function rename | `grep` หา usages ก่อน แล้วแก้ทุกที่พร้อมกัน |
| **4 — ห้ามแก้** | Route paths, Redux state key names, API request/response shape, index key ที่ไม่มี unique id | skip — บันทึกใน report แจ้ง user |

---

## กฎหลัก

1. แก้ไขทีละ 1 ไฟล์เสมอ — ห้าม batch หลายไฟล์พร้อมกัน
2. Tier 2 ขึ้นไปต้องรัน `npx tsc --noEmit` หลังทุกไฟล์
3. ถ้า compile error → revert ไฟล์นั้นกลับ + บันทึกว่า skip + ไปไฟล์ถัดไป
4. ห้ามเปลี่ยน logic, เปลี่ยนแค่ style/naming/structure
5. Tier 4 ห้ามแก้ไม่ว่าในกรณีใด — ต้อง report ให้ user ตัดสินใจเอง
6. ถ้าไม่มี violation report จาก `ssd-frontend-review` ให้ review ก่อนเสมอ

---

## ขั้นตอนการ Refactor

### ขั้นตอนที่ 1: เตรียม violation list

รับ report จาก `ssd-frontend-review` หรือสร้าง list เอง จากนั้นจัดเรียงตาม Tier:
- Tier 1 ก่อน → Tier 2 → Tier 3
- Tier 4: แยกออกไป รายงาน user ว่าต้องตัดสินใจเอง

### ขั้นตอนที่ 2: แก้ไขทีละไฟล์

```
สำหรับแต่ละไฟล์ที่มี violation:

1. อ่านไฟล์
2. แก้ไข violations ตาม Tier ที่กำหนด (Tier 1 ก่อน)
3. ถ้ามี Tier 2+ → รัน verify ด้านล่าง
4. บันทึกผลลัพธ์
5. ไปไฟล์ถัดไป
```

### ขั้นตอนที่ 3: Verify หลังแต่ละไฟล์ (Tier 2+)

```bash
npx tsc --noEmit
```

ถ้า error → revert file:
```bash
git checkout -- <file-path>
```

### ขั้นตอนที่ 4: สรุปผล

```
## Frontend Refactor Report

### ✅ แก้ไขสำเร็จ
| File | Violations ที่แก้ |
|------|-----------------|
| src/app/modules/Order/components/OrderForm.tsx | `any` → `unknown` (line 12), Fragment syntax (line 8) |

### ⏭️ Skip (Tier 4 — ต้องการ user decision)
| File | Line | ปัญหา | เหตุผลที่ skip |
|------|------|-------|--------------|
| src/routes/index.tsx | 5 | Route path `/orderList` ควรเป็น `/order-list` | เปลี่ยน route path อาจทำให้ link จากระบบอื่นพัง |

### ❌ Skip (compile error หลัง edit)
| File | ปัญหา |
|------|-------|
| src/app/modules/Order/components/OrderCard.tsx | เปลี่ยน Props type name แล้ว compile error — revert แล้ว |

### สรุป
- แก้ไขสำเร็จ: X violations ใน Y ไฟล์
- Skip (Tier 4): Z รายการ — รอ user ตัดสินใจ
- Skip (error): W รายการ — แนะนำตรวจด้วยตนเอง
```

---

## ตัวอย่างการแก้ไขที่พบบ่อย

### Tier 1: Fragment Syntax

```tsx
// ก่อน
return (
  <React.Fragment>
    <Header />
    <Content />
  </React.Fragment>
);

// หลัง
return (
  <>
    <Header />
    <Content />
  </>
);
```

### Tier 1: Boolean Prop

```tsx
// ก่อน
<Button disabled={true}>ส่ง</Button>

// หลัง
<Button disabled>ส่ง</Button>
```

### Tier 2: any → unknown

```tsx
// ก่อน
const handleData = (data: any) => { ... }

// หลัง
const handleData = (data: unknown) => { ... }
// หรือระบุ type ที่ชัดเจนถ้ารู้ชนิดข้อมูล
const handleData = (data: OrderDto) => { ... }
```

### Tier 2: Unused Import

```tsx
// ก่อน
import React, { useState, useEffect, useCallback } from 'react';
// (useCallback ไม่ได้ใช้)

// หลัง
import React, { useState, useEffect } from 'react';
```

### Tier 3: Props Type Rename (ต้อง grep ก่อน)

```bash
# ขั้นตอน:
# 1. grep หา usages ก่อน
grep -r "IOrderCardProps" src/

# 2. ถ้าพบหลายที่ — แก้ทุกที่พร้อมกันใน 1 commit
# 3. รัน compile ตรวจสอบ
npx tsc --noEmit
```
