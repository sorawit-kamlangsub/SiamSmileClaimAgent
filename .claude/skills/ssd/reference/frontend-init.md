
# SSD Frontend Init — ตั้งค่าโปรเจค Frontend ใหม่จาก Template

## บริบท

ทุก Frontend project เริ่มจาก `react-ts-template-2023 v1.2.0` เท่านั้น ห้ามสร้างโปรเจคเปล่าเอง Template มี SSO, Layout, common components พร้อมใช้งาน และมีไฟล์ที่ Jenkins และ IIS อ่านโดยตรง — ห้ามแตะไฟล์เหล่านั้น

**Template:** https://github.com/SiamsmileDev/react-ts-template-2023/releases/tag/v1.2.0
**ตัวอย่างโปรเจคจริง:** https://github.com/SiamsmileDev/LineOAPASAdmin

## กฎหลัก

1. Clone จาก template release `v1.2.0` เท่านั้น — ห้ามสร้างโปรเจคจาก Vite หรือ CRA
2. ห้ามแก้ไข `public/web.config` — IIS อ่านไฟล์นี้ตรงๆ สำหรับ SPA routing
3. ห้ามลบหรือเปลี่ยนชื่อ `callback.html` และ `silent-callback.html` — SSO auth flow ใช้ path นี้
4. แก้ไขใน `.env*` เฉพาะ `VITE_APP_NAME` และ `VITE_APP_VERSION` เท่านั้น — ห้ามแก้ `VITE_BASE_URL`, `VITE_API_URL`, `VITE_APIGW_BASEURL` และ `VITE_SSO_*` ทุกตัว ให้คงค่า default จาก template ไว้
5. ไฟล์ใน `src/app/layout/` และ `src/app/modules/_auth/` ห้ามแก้โดยไม่จำเป็น — Template code

---

## ขั้นตอนที่ 0: เก็บข้อมูลโปรเจค (ถามก่อนเริ่มทุกครั้ง)

ใช้ **AskUserQuestion tool** ถามข้อมูลต่อไปนี้ก่อนดำเนินการใดๆ ส่งคำถามได้ครั้งละ 1-4 ข้อ:

**ชุดที่ 1** — ข้อมูลพื้นฐาน:
- "ชื่อโปรเจค (GitHub repo name เช่น ExampleProject)" — header: "Project Name"
- "ชื่อระบบภาษาไทย (สำหรับ `<title>` เช่น ระบบ Example App Name)" — header: "App Title"

---

## ขั้นตอนที่ 1: Clone และ Setup

```bash
# Clone จาก template (อย่า fork — ให้เป็น repo ใหม่)
git clone https://github.com/SiamsmileDev/react-ts-template-2023.git {ProjectName}
cd {ProjectName}

# เปลี่ยน remote ไปที่ repo ใหม่ของโปรเจค
git remote remove origin
git remote add origin https://github.com/SiamsmileDev/{ProjectName}.git

# ติดตั้ง dependencies
npm install
```

---

## ขั้นตอนที่ 2: แก้ไข index.html

```html
<!-- index.html -->
<title>{ชื่อระบบภาษาไทย}</title>
<meta property="og:title" content="{ชื่อระบบ}" />
<meta property="og:description" content="{คำอธิบายสั้นๆ}" />

<!-- แก้ data-menu-url ให้ชี้ไปที่ menu API ที่ถูกต้อง -->
<div id="root" data-menu-url="https://apigw.siamsmile.co.th/common/menu/links"></div>
```

---

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables

แก้ไข **เฉพาะ 2 ค่านี้เท่านั้น** ในทุก 4 ไฟล์ (`.env`, `.env.dev`, `.env.uat`, `.env.production`):

```bash
VITE_APP_NAME = "{ชื่อระบบภาษาไทย}"
VITE_APP_VERSION = "1.0.0"
```

> ⚠️ **ห้ามแก้ไขค่าต่อไปนี้** — ให้คงค่า default จาก template ไว้ทุกตัว:
> `VITE_BASE_URL`, `VITE_API_URL`, `VITE_APIGW_BASEURL`, `VITE_SSO_ISSUER`, `VITE_SSO_CLIENT_ID`, `VITE_SSO_SCOPE` และ `VITE_SSO_*` ทุกตัว

---

## ขั้นตอนที่ 4: แก้ไข package.json

```json
{
  "name": "{project-name-lowercase-kebab}",
  "version": "1.0.0"
}
```

---

## ขั้นตอนที่ 5: Reset CHANGELOG.md

```markdown
# Changelog
```

---

## ขั้นตอนที่ 6: ทดสอบก่อน Push

```bash
npm run start          # ตรวจสอบ local dev
npm run build:dev      # ตรวจสอบ dev build
npm run build:uat      # ตรวจสอบ uat build
npm run build          # ตรวจสอบ production build
```

---

## ⚠️ Jenkins & IIS Sensitive — ห้ามแตะ

| ไฟล์/โฟลเดอร์ | เหตุผล |
|--------------|--------|
| `public/web.config` | IIS อ่านโดยตรง — SPA rewrite rules ต้องอยู่ครบ |
| `callback.html` | SSO auth callback URL ที่ auth server ลงทะเบียนไว้ |
| `silent-callback.html` | Silent token refresh callback — ถ้าหายจะ logout loop |
| `public/favicon.png` | สามารถเปลี่ยนได้ แต่ต้องเป็น `.png` ชื่อเดิม |
| `src/app/layout/` | Template layout — แก้เฉพาะ theme.ts |
| `src/app/modules/_auth/` | Auth flow — ห้ามแก้ถ้าไม่ได้รับอนุมัติ |

---

## โครงสร้าง Folder หลังจาก Init

```
{ProjectName}/
├── public/
│   ├── web.config          ← ห้ามแตะ
│   └── favicon.png         ← เปลี่ยนได้
├── src/
│   ├── app/
│   │   ├── api/            ← สร้าง API client ที่นี่
│   │   ├── layout/         ← ห้ามแตะ
│   │   ├── modules/
│   │   │   ├── _auth/      ← ห้ามแตะ
│   │   │   ├── _common/    ← ห้ามแตะ
│   │   │   └── {Module}/   ← สร้าง module ใหม่ที่นี่
│   │   ├── redux/
│   │   └── routes/
│   ├── Const.ts
│   └── App.tsx
├── callback.html           ← ห้ามลบ/เปลี่ยนชื่อ
├── silent-callback.html    ← ห้ามลบ/เปลี่ยนชื่อ
├── index.html              ← แก้ title, og tags
├── .env                    ← ตั้งค่า
├── .env.dev
├── .env.uat
└── .env.production
```

---

## Checklist ก่อน Push ครั้งแรก

- [ ] `index.html` — title และ og tags ถูกต้อง
- [ ] `.env*` ทุกไฟล์ — แก้เฉพาะ `VITE_APP_NAME` และ `VITE_APP_VERSION`
- [ ] `VITE_BASE_URL`, `VITE_API_URL`, `VITE_SSO_*` ยังคงค่า default จาก template
- [ ] `npm run start` ผ่าน (login ได้)
- [ ] `npm run build` ผ่าน (ไม่มี TypeScript error)
- [ ] `callback.html` และ `silent-callback.html` ยังอยู่ที่ root
- [ ] `public/web.config` ไม่ถูกแก้ไข
- [ ] git remote ชี้ไปที่ repo ใหม่แล้ว
