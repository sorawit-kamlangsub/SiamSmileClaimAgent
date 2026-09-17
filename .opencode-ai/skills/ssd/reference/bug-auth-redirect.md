
# SSD Bug Fix: Auth Redirect Loop — หน้าขาว / วน redirect ไม่หยุด

## อาการ

- user บาง device เปิดเว็บแล้วหน้าขาวไม่โหลด
- browser redirect วนระหว่างหน้า login กับ callback ไม่หยุด
- เกิดหลัง deploy version ใหม่ หรือเมื่อ session ของ IdP (SSO) หมดอายุ
- ไม่ได้เกิดกับทุก user — เฉพาะบาง device หรือบาง network

## Root Cause

- `AuthProvider.tsx` เรียก `signinRedirect()` ทันทีเมื่อ `getUser()` ไม่เจอ user
- บน device ที่ IdP session หมด → redirect ไป callback → callback พัง → redirect ใหม่ → วนไม่สิ้นสุด
- `silent_redirect_uri` ชี้ไป `callback.html` เดียวกับ signin → silent callback กับ signin callback ปนกัน

## Fix: 9 ไฟล์ (สร้างใหม่ 2 ไฟล์, แก้ไข 7 ไฟล์)

---

## ขั้นตอนที่ 1: สร้างไฟล์ใหม่ `src/app/modules/_auth/authRedirect.ts`

สร้างไฟล์นี้ใหม่ทั้งหมด — เป็น guard ป้องกัน redirect loop โดยใช้ sessionStorage เป็น marker

```ts
export const AUTH_REDIRECT_IN_PROGRESS_KEY = "auth_redirect_in_progress";

export const setAuthRedirectInProgress = () => {
    window.sessionStorage.setItem(AUTH_REDIRECT_IN_PROGRESS_KEY, Date.now().toString());
};

export const clearAuthRedirectInProgress = () => {
    window.sessionStorage.removeItem(AUTH_REDIRECT_IN_PROGRESS_KEY);
};

export const isAuthRedirectInProgress = () => {
    return window.sessionStorage.getItem(AUTH_REDIRECT_IN_PROGRESS_KEY) !== null;
};
```

---

## ขั้นตอนที่ 2: สร้างไฟล์ใหม่ `silent-callback.html` (root ของ project)

สร้างที่ root เดียวกับ `callback.html` — ใช้ entry point แยกสำหรับ silent renew

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Now Loading...</title>
</head>

<body>
    <script src="/configuration.js"></script>
    <div id="root"></div>
    <script type="module" src="/src/Callback.tsx"></script>
</body>

</html>
```

---

## ขั้นตอนที่ 3: แก้ไข `src/Const.ts`

เปลี่ยน `silent_redirect_uri` ให้ชี้ไป `silent-callback.html` แทน `callback.html`

```ts
// ก่อน
silent_redirect_uri: `${VITE_BASE_URL}/callback.html`,

// หลัง
silent_redirect_uri: `${VITE_BASE_URL}/silent-callback.html`,
```

---

## ขั้นตอนที่ 4: แก้ไข `src/Callback.tsx`

แยก processSigninCallback และ processSilentCallback ออกจากกัน แล้ว route ตาม URL

```tsx
import { UserManager, UserManagerSettings, WebStorageStateStore } from "oidc-client-ts";
import ReactDOM from "react-dom/client";
import { SSO_CONFIG, VITE_BASE_URL } from "./Const";
import { SigninCallback } from "./app/modules/_auth";
import { clearAuthRedirectInProgress } from "./app/modules/_auth/authRedirect";

let returnUrl = "/";

const userManagerSettings: UserManagerSettings = {
    ...SSO_CONFIG,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
};

const oidcUserManager = new UserManager(userManagerSettings);

const processSigninCallback = async () => {
    try {
        const user = await oidcUserManager.signinRedirectCallback();
        const state = user.state as any;
        if (state && state.returnUrl !== "/not-found") {
            returnUrl = state.returnUrl;
        }
    } catch {
        returnUrl = "/";
    } finally {
        clearAuthRedirectInProgress();
        oidcUserManager.clearStaleState();
        document.location.href = `${VITE_BASE_URL}${returnUrl}`;
    }
};

const processSilentCallback = async () => {
    try {
        await oidcUserManager.signinSilentCallback();
    } catch {
        // no-op: silent callback can fail when there is no IdP session
    } finally {
        clearAuthRedirectInProgress();
        oidcUserManager.clearStaleState();
    }
};

if (window.location.pathname.endsWith("/silent-callback.html")) {
    processSilentCallback();
} else {
    processSigninCallback();
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<SigninCallback />);
```

---

## ขั้นตอนที่ 5: แก้ไข `src/app/modules/_auth/components/AuthProvider.tsx`

เพิ่ม import และเพิ่ม functions guard + silent-first flow:

**เพิ่ม import ที่หัวไฟล์:**
```ts
import React, { useCallback, useEffect, useState } from "react";
import { clearAuthRedirectInProgress, isAuthRedirectInProgress, setAuthRedirectInProgress } from "../authRedirect";
```

**เพิ่ม 2 functions ใน component (ก่อน useEffect แรก):**
```ts
const signinRedirectWithGuard = useCallback(async () => {
    if (isAuthRedirectInProgress()) {
        return;
    }
    setAuthRedirectInProgress();
    try {
        await oidcUserManager.signinRedirect({ state: getState() });
    } catch (error) {
        clearAuthRedirectInProgress();
        throw error;
    }
}, [getState, oidcUserManager]);

const signinSilentThenRedirect = useCallback(async () => {
    try {
        await oidcUserManager.signinSilent();
    } catch {
        await signinRedirectWithGuard();
    }
}, [oidcUserManager, signinRedirectWithGuard]);
```

**เปลี่ยน event listeners ให้อยู่ใน useEffect พร้อม cleanup:**
```ts
useEffect(() => {
    const onAccessTokenExpired = async () => {
        oidcUserManager.removeUser();
        oidcUserManager.clearStaleState();
        await signinSilentThenRedirect();
    };

    const onUserLoaded = (loadedUser: User) => {
        clearAuthRedirectInProgress();
        setLogin(loadedUser);
    };

    const onUserUnloaded = () => {
        setLogout();
    };

    const onUserSignedOut = async () => {
        oidcUserManager.removeUser();
        oidcUserManager.clearStaleState();
        await signinRedirectWithGuard();
    };

    const onAccessTokenExpiring = () => {
        oidcUserManager.startSilentRenew();
    };

    oidcUserManager.events.addAccessTokenExpired(onAccessTokenExpired);
    oidcUserManager.events.addUserLoaded(onUserLoaded);
    oidcUserManager.events.addUserUnloaded(onUserUnloaded);
    oidcUserManager.events.addUserSignedOut(onUserSignedOut);
    oidcUserManager.events.addAccessTokenExpiring(onAccessTokenExpiring);

    return () => {
        oidcUserManager.events.removeAccessTokenExpired(onAccessTokenExpired);
        oidcUserManager.events.removeUserLoaded(onUserLoaded);
        oidcUserManager.events.removeUserUnloaded(onUserUnloaded);
        oidcUserManager.events.removeUserSignedOut(onUserSignedOut);
        oidcUserManager.events.removeAccessTokenExpiring(onAccessTokenExpiring);
    };
}, [oidcUserManager, setLogin, setLogout, signinRedirectWithGuard, signinSilentThenRedirect]);
```

**เปลี่ยน startup useEffect:**
```ts
useEffect(() => {
    const processGetUser = async () => {
        const user = await oidcUserManager.getUser();
        if (user) {
            clearAuthRedirectInProgress();
            setLogin(user);
            oidcUserManager.clearStaleState();
        } else {
            setLogout();
            await signinSilentThenRedirect();
        }
    };

    processGetUser();
}, [oidcUserManager, setLogin, setLogout, signinSilentThenRedirect]);
```

**ครอบ `setLogin` และ `setLogout` ด้วย `useCallback`:**
```ts
const setLogin = useCallback((user: User) => {
    // ... เนื้อหาเดิม ...
}, []);

const setLogout = useCallback(() => {
    // ... เนื้อหาเดิม ...
}, []);
```

---

## ขั้นตอนที่ 6: แก้ไข `src/app/modules/_auth/pages/SigninCallback.tsx`

เพิ่ม import และแก้ catch/finally:

```ts
import { clearAuthRedirectInProgress, isAuthRedirectInProgress, setAuthRedirectInProgress } from "../authRedirect";
```

เปลี่ยน catch block:
```ts
// ก่อน
} catch (error) {
    await oidcUserManager.signinRedirect();
}

// หลัง
} catch {
    if (!isAuthRedirectInProgress()) {
        setAuthRedirectInProgress();
        await oidcUserManager.signinRedirect();
    }
} finally {
    clearAuthRedirectInProgress();
}
```

---

## ขั้นตอนที่ 7: แก้ไข `src/app/modules/_auth/pages/SilentCallback.tsx`

เพิ่ม import:
```ts
import { clearAuthRedirectInProgress } from "../authRedirect";
```

ครอบ signinSilentCallback ด้วย try/finally:
```ts
// ก่อน
await oidcUserManager.signinSilentCallback(location.search);

// หลัง
try {
    await oidcUserManager.signinSilentCallback(location.search);
} finally {
    clearAuthRedirectInProgress();
    oidcUserManager.clearStaleState();
}
```

---

## ขั้นตอนที่ 8: แก้ไข `public/web.config`

เพิ่ม location rule สำหรับ silent-callback.html ก่อน `<system.webServer>` หลัก:

```xml
<location path="silent-callback.html">
     <system.webServer>
          <staticContent>
               <clientCache cacheControlMode="DisableCache" />
          </staticContent>
     </system.webServer>
</location>
```

---

## ขั้นตอนที่ 9: แก้ไข `vite.config.ts`

เพิ่ม entry สำหรับ silent-callback ใน input:
```ts
input: {
    index: "./index.html",
    callback: "./callback.html",
    "silent-callback": "./silent-callback.html",   // เพิ่มบรรทัดนี้
},
```

---

## ขั้นตอนที่ 10: ตรวจสอบ

```bash
# 1. Build ต้องผ่าน
npm run build

# 2. ตรวจว่ามีไฟล์ silent-callback ใน dist/
ls dist/silent-callback.html

# 3. ทดสอบ flow
# - เปิด browser แบบ incognito
# - ไปที่ URL ของ app → ต้อง redirect ไป login ได้ปกติ
# - หลัง login → ต้อง redirect กลับมาที่ app ได้ปกติ
# - ใน sessionStorage → ไม่ควรมี auth_redirect_in_progress ค้างอยู่หลัง login สำเร็จ
```
