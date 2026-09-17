
# SSD Release-it Setup — ติดตั้งและตั้งค่า release-it ตามมาตรฐาน SSD

## บริบท

`release-it` คือ CLI tool สำหรับจัดการ release อัตโนมัติ ทำงานร่วมกับ `@release-it/conventional-changelog` เพื่อสร้าง CHANGELOG.md จาก commit messages ตามรูปแบบ Conventional Commits

**Workflow ที่ได้หลัง setup:**
1. รัน `release-it` บน branch `master` หรือ `develop`
2. Tool สร้าง branch `release/v{version}` อัตโนมัติและ push ขึ้น origin
3. สร้าง GitHub Release แบบ Draft พร้อม `CHANGELOG.md` ที่ generate จาก commits

---

## กฎหลัก

1. ใช้ version ตายตัว: `release-it@17.3.0` และ `@release-it/conventional-changelog@8.0.1` เท่านั้น
2. ห้ามสร้าง `.release-it` ใหม่ถ้าไฟล์มีอยู่แล้ว — ให้ตรวจสอบ content แทนและแจ้ง user
3. ห้ามรัน `release-it` ถ้าไม่ได้อยู่บน branch `master` หรือ `develop`
4. ไฟล์ `.release-it` ต้องอยู่ที่ root `./` เสมอ ไม่ว่าจะเป็น frontend หรือ backend project
5. `package.json` ต้องมี `"version"` field ก่อนรัน release-it ทุกครั้ง

---

## ขั้นตอนที่ 1: ตรวจสอบและติดตั้ง release-it

### 1.1 ตรวจสอบว่ามี release-it อยู่แล้วหรือไม่

```bash
release-it -v
```

**ผลลัพธ์ที่เป็นไปได้:**

| ผลลัพธ์ | ความหมาย | สิ่งที่ต้องทำ |
|---------|----------|--------------|
| แสดง `v17.3.0` | ถูก version แล้ว | ข้ามไปขั้นตอนที่ 2 |
| แสดง version อื่น | version ไม่ตรง | ติดตั้งใหม่ตาม 1.2 |
| `command not found` | ยังไม่ได้ติดตั้ง | ติดตั้งตาม 1.2 |

### 1.2 ติดตั้ง (เมื่อไม่มีหรือ version ไม่ตรง)

```bash
npm install -g @release-it/conventional-changelog@8.0.1 release-it@17.3.0
```

### 1.3 ยืนยันหลังติดตั้ง

```bash
release-it -v
# ต้องแสดง: v17.3.0
```

---

## ขั้นตอนที่ 2: สร้างไฟล์ `.release-it`

### 2.1 ตรวจสอบว่ามีไฟล์อยู่แล้วหรือไม่

```bash
# Linux/Mac
ls -la .release-it 2>/dev/null && echo "EXISTS" || echo "NOT FOUND"

# Windows
Test-Path .release-it
```

**ถ้าไฟล์มีอยู่แล้ว:** ห้ามสร้างทับ — ตรวจสอบ content ว่าครบ keys ที่กำหนดหรือไม่ แล้วแจ้ง user

**ถ้าไม่มีไฟล์:** สร้างไฟล์ตาม 2.2

### 2.2 สร้างไฟล์ `.release-it` (config มาตรฐาน SSD)

สร้างไฟล์ `.release-it` ที่ root ของ project:

```json
{
    "hooks": {
        "before:release": [
            "git checkout -b release/v${version}",
            "git push -u origin release/v${version}"
        ]
    },
    "git": {
        "requireBranch": [
            "master",
            "develop"
        ],
        "commitMessage": "chore(release): v${version}",
        "tagName": "v${version}",
        "tagAnnotation": "Release v${version}"
    },
    "github": {
        "release": true,
        "web": true,
        "draft": true,
        "releaseName": "v${version}"
    },
    "npm": {
        "publish": false
    },
    "plugins": {
        "@release-it/conventional-changelog": {
            "infile": "CHANGELOG.md",
            "ignoreRecommendedBump": true,
            "preset": {
                "name": "conventionalcommits",
                "types": [
                    { "type": "feat",     "section": "Features" },
                    { "type": "fix",      "section": "Bug Fixes" },
                    { "type": "docs",     "section": "Document" },
                    { "type": "style",    "section": "Styles" },
                    { "type": "refactor", "section": "Refactoring Code" },
                    { "type": "perf",     "section": "Performance Improvements" },
                    { "type": "test",     "section": "Tests" },
                    { "type": "build",    "section": "Builds" },
                    { "type": "ci",       "section": "Continuous Integrations" },
                    { "type": "chore",    "section": "Chores" },
                    { "type": "revert",   "section": "Reverts" },
                    { "type": "",         "section": "Other" }
                ]
            }
        }
    }
}
```

---

## ขั้นตอนที่ 3: ตรวจสอบ `package.json`

### 3.1 ตรวจสอบว่ามี `"version"` field

```bash
# ดูค่า version ปัจจุบัน
node -e "const p = require('./package.json'); console.log(p.version || 'MISSING')"
```

### 3.2 เพิ่ม `"version"` ถ้าไม่มี

เปิด `package.json` และเพิ่ม `"version"` เป็น field แรกหลัง `{`:

```json
{
  "version": "1.0.0",
  ...fields อื่นๆ ที่มีอยู่...
}
```

ห้ามลบหรือแก้ไข fields อื่นที่มีอยู่แล้ว

---

## ขั้นตอนที่ 4: ตรวจสอบผลลัพธ์

### 4.1 ตรวจสอบไฟล์ที่ต้องมี

```bash
# ตรวจสอบทั้งสองไฟล์
ls -la .release-it package.json
```

**Checklist ก่อน run release-it จริง:**

- [ ] `release-it -v` แสดง `v17.3.0`
- [ ] ไฟล์ `.release-it` อยู่ที่ root `./`
- [ ] `.release-it` มี keys ครบ: `hooks`, `git`, `github`, `npm`, `plugins`
- [ ] `package.json` มี `"version"` field
- [ ] อยู่บน branch `master` หรือ `develop` (`git branch --show-current`)

### 4.2 ตรวจสอบ branch ก่อน run

```bash
git branch --show-current
# ต้องได้ master หรือ develop เท่านั้น
```

### 4.3 รัน release-it (เมื่อ checklist ผ่านทุกข้อ)

```bash
release-it
```

tool จะถามยืนยัน version, สร้าง branch `release/v{version}`, push และสร้าง GitHub Draft Release ให้อัตโนมัติ
