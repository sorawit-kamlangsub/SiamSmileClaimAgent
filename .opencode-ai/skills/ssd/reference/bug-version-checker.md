
# SSD Bug Fix: Version Checker — ไม่เห็น Version ใหม่หลัง Deploy

## อาการ

- user deploy version ใหม่แล้วแต่บาง user ยังเห็น UI เก่าอยู่
- popup "version outdated" ขึ้นซ้ำหลายครั้งในหน้าเดียวกัน
- กด refresh แล้วยังได้ version เก่า
- `config.json` อัปเดตแล้วแต่ browser ยังอ่านค่าเก่า

## Root Cause

1. **`vite.config.ts`**: `chunkFileNames` ไม่มี `[hash]` → browser cache JS chunk เก่าหลัง deploy
2. **`VersionChecker.tsx`**: `emptyCache()` เป็น sync → `window.location.reload()` ยิงก่อน cache ถูกลบจริง
3. **`VersionChecker.tsx`**: ไม่มี guard → `getData()` ถูกเรียกซ้อนกัน, popup ซ้ำ, reload ซ้ำ
4. **`VersionChecker.tsx`**: `fetch` ใช้ browser cache → อ่าน `config.json` เก่า

## Fix: 2 ไฟล์

---

## ขั้นตอนที่ 1: แก้ไข `vite.config.ts`

เพิ่ม `[hash]` ใน `chunkFileNames` — สำคัญที่สุด บังคับ browser โหลด JS ใหม่ทุกครั้งที่ deploy

```ts
output: {
    entryFileNames: `assets/js/[name].[hash].js`,
    assetFileNames: `assets/[ext]/[name].[hash].[ext]`,
    chunkFileNames: `assets/js/[name].[hash].js`,   // ก่อนหน้านี้ไม่มี [hash]
},
```

---

## ขั้นตอนที่ 2: แก้ไข `src/app/layout/components/VersionChecker.tsx`

แทนที่ไฟล์ทั้งหมดด้วย version ที่แก้ไขแล้ว:

```tsx
import React, { useEffect, useRef } from "react";
import { APP_INFO, VERSION_CHECKER } from "../../../Const";
import { swalConfirm } from "../../modules/_common";

function VersionChecker() {
    const { version } = APP_INFO;
    const { CHECK_VERSION_EVERY_MINUTE, CONFIRM_BEFORE_REFRESH, ENABLE_VERSION_CHECKER } = VERSION_CHECKER;
    const isCheckingRef = useRef(false);
    const isPromptOpenRef = useRef(false);
    const isReloadingRef = useRef(false);
    const checkVersionLoop = 1000 * 60 * CHECK_VERSION_EVERY_MINUTE;

    const getData = async () => {
        // guard: ป้องกันเรียกซ้อน
        if (!ENABLE_VERSION_CHECKER || isCheckingRef.current || isReloadingRef.current) {
            return;
        }
        isCheckingRef.current = true;

        try {
            const response = await fetch(`${window.location.origin}/config.json`, {
                cache: "no-store",    // บังคับไม่ใช้ browser cache
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch config.json: ${response.status}`);
            }

            const configData = await response.json();

            if (configData.version !== version) {
                if (CONFIRM_BEFORE_REFRESH) {
                    if (isPromptOpenRef.current) {
                        return;    // ป้องกัน popup ซ้ำ
                    }
                    isPromptOpenRef.current = true;
                    try {
                        const res = await swalConfirm("Warning", "Your version is outdated. Refresh now?");
                        if (res.isConfirmed) {
                            await emptyCache();
                        }
                    } finally {
                        isPromptOpenRef.current = false;
                    }
                } else {
                    await emptyCache();
                }
            }
        } catch (error) {
            console.error("Version check failed", error);    // ไม่ใช้ alert()
        } finally {
            isCheckingRef.current = false;
        }
    };

    const emptyCache = async () => {
        if (isReloadingRef.current) {
            return;    // ป้องกัน reload ซ้ำ
        }
        isReloadingRef.current = true;

        try {
            if ("caches" in window) {
                const names = await caches.keys();
                // await ให้ลบ cache เสร็จก่อนค่อย reload
                await Promise.all(names.map((name) => caches.delete(name)));
            }
        } finally {
            window.location.reload();
        }
    };

    useEffect(() => {
        void getData();
        const interval = setInterval(() => {
            void getData();
        }, checkVersionLoop);

        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <></>;
}

export default VersionChecker;
```

---

## สิ่งที่เปลี่ยนและเหตุผล

| จุดที่เปลี่ยน | ก่อน | หลัง | เหตุผล |
|--------------|------|------|--------|
| `chunkFileNames` | `[name].js` | `[name].[hash].js` | บังคับ browser โหลด JS ใหม่หลัง deploy |
| `emptyCache` | sync, forEach | async, `Promise.all` + await | รับประกันว่า cache ถูกลบก่อน reload |
| guard refs | ไม่มี | `isCheckingRef`, `isPromptOpenRef`, `isReloadingRef` | ป้องกัน race condition |
| fetch cache | browser default | `cache: "no-store"` | ป้องกันอ่าน config.json เก่า |
| error handling | `alert()` | `console.error()` | ไม่รบกวน user เมื่อ network fail ชั่วคราว |
| prompt text | `"your version is out-dated..."` | `"Your version is outdated. Refresh now?"` | ภาษาที่อ่านง่ายขึ้น |

---

## ขั้นตอนที่ 3: ตรวจสอบ

```bash
# 1. Build ต้องผ่าน
npm run build

# 2. ตรวจว่า chunk files มี hash ใน dist/
ls dist/assets/js/
# ควรเห็น: index.abc123.js, vendor.def456.js (มี hash ทุกไฟล์)

# 3. ทดสอบ flow
# - เปิด DevTools → Network tab → เปิด "Disable cache"
# - Reload หน้า → ตรวจว่า config.json fetch มี Cache-Control: no-store
# - เปลี่ยน version ใน config.json → รอ interval หรือ reload → popup ต้องขึ้น 1 ครั้งเท่านั้น
# - กด refresh → หน้าต้องโหลด version ใหม่
```
