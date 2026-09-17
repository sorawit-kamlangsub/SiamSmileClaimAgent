
# SSD Git Flow — มาตรฐานการทำงานกับ Git

## บริบท

SSD ใช้ Git Flow เป็น workflow หลักในการพัฒนา โดยใช้ SourceTree เป็น GUI tool จัดการ branch และ commit ทุกคนในทีมต้องทำตาม workflow และ branch naming convention เดียวกัน

## โครงสร้าง Branch หลัก

| Branch | ใช้สำหรับ |
|--------|----------|
| `master` | โค้ดที่ stable พร้อม production — ทุก commit ผ่านการตรวจสอบแล้ว |
| `develop` | โค้ดที่กำลังพัฒนา รวม feature ที่เสร็จแล้ว แต่ยังไม่ขึ้น production |
| `feature/...` | พัฒนา feature ใหม่ — แตกจาก develop |
| `release/...` | เตรียม release — แตกจาก develop |
| `hotfix/...` | แก้ bug ด่วนใน production — แตกจาก master |

## Branch Naming Convention

รูปแบบ: `<type>/[optional-specNo]<description>`

| ตัวอย่าง | ความหมาย |
|----------|----------|
| `feature/add-login-page` | เพิ่มหน้า login |
| `feature/ui1-add-login-page` | มีเลข spec ui1 |
| `release/1.0.0` | เตรียม version 1.0.0 |
| `hotfix/fix-login-bug` | แก้ bug หน้า login |

### กรณี Repository มีหลาย Project

รูปแบบ: `<type>/[projectName][optional-specNo]<description>`

| ตัวอย่าง | ความหมาย |
|----------|----------|
| `feature/sss-add-login-page` | feature ของ project SSS |
| `feature/sss-ui1-add-login-page` | มีเลข spec |
| `release/sss-1.0.0` | release ของ project SSS |
| `hotfix/sss-fix-login-bug` | hotfix ของ project SSS |

---

## Workflow ขั้นตอนการทำงาน

### 1. เริ่มต้นโปรเจค

```bash
# สร้าง repository ใหม่ใน GitHub ชื่อเดียวกับโปรเจค
# จากนั้น clone ลงเครื่อง local
git clone <repository-url>
```

### 2. พัฒนา Feature ใหม่

```bash
# สร้าง branch ใหม่จาก develop
git checkout develop
git pull origin develop
git checkout -b feature/add-order-page

# ทำงาน...

# Commit ด้วย conventional commits
git add <files>
git commit -m "feat(controller): add order controller"

# Push ขึ้น branch
git push origin feature/add-order-page
```

### 3. รวม Feature เข้า Develop (Pull Request)

1. สร้าง Pull Request จาก `feature/add-order-page` → `develop`
2. ขอให้ทีม review และ merge
3. ลบ branch หลัง merge สำเร็จ

### 4. ปล่อย Release

Dev Lead ทำ:
```bash
# แตก branch release จาก develop
git checkout develop
release-it  # จะสร้าง release branch อัตโนมัติ
```

Tech Lead ทำ:
- Merge `release/x.x.x` → `master` หลัง deploy สำเร็จ
- Merge `release/x.x.x` → `develop` ด้วย

### 5. แก้ Hotfix

```bash
# แตก branch จาก master
git checkout master
git pull origin master
git checkout -b hotfix/fix-payment-bug

# แก้ bug...

git commit -m "fix: fix payment calculation error"
git push origin hotfix/fix-payment-bug

# สร้าง Pull Request → master
# หลัง merge → สร้าง Pull Request อีกอัน → develop ด้วย
```

---

## การใช้งาน SourceTree

### ติดตั้ง Prerequisites
1. Git + Git Bash: https://git-scm.com/downloads
2. .NET Framework 4.6.1+: https://dotnet.microsoft.com/download/dotnet-framework

### Clone Repository
1. เปิด SourceTree → New → Clone from URL
2. ใส่ URL ของ repository และเลือก destination folder

### สร้าง Feature Branch
1. คลิก Branch บน toolbar
2. ตั้งชื่อตาม naming convention
3. ตรวจสอบว่า "Checkout New Branch" ติ๊กอยู่

### Commit
1. เลือกไฟล์ที่ต้องการใน "Unstaged files"
2. คลิก "Stage Selected" หรือ "Stage All"
3. เขียน commit message ตาม Conventional Commits
4. คลิก "Commit"

### Push
1. คลิก Push บน toolbar
2. เลือก branch ที่ต้องการ push
3. คลิก Push

### Fetch / Pull
- **Fetch**: ดึงข้อมูลจาก remote แต่ยังไม่ merge
- **Pull**: ดึงข้อมูล + merge เข้า local branch ปัจจุบัน

### Stash
ใช้เมื่อต้องการเก็บงานค้างไว้ชั่วคราว:
1. คลิก Stash บน toolbar
2. ใส่ชื่อ stash ที่สื่อความหมาย
3. เมื่อต้องการกลับมาทำต่อ → คลิก Stashes → Apply Stash

### Reset / Revert
- **Reset**: ยกเลิก commit (ใช้ด้วยความระมัดระวัง)
  - Mixed: ยกเลิก commit แต่ยังเก็บ file changes ไว้
  - Hard: ยกเลิก commit + ยกเลิก file changes ทั้งหมด
- **Revert**: สร้าง commit ใหม่ที่ยกเลิกการเปลี่ยนแปลงของ commit เก่า (ปลอดภัยกว่า)

### Rebase
ใช้เมื่อต้องการจัดเรียง commit ใหม่หรือดึง commit จาก develop เข้า feature branch:
```bash
git checkout feature/my-feature
git rebase develop
```

---

## สร้าง Pull Request

1. Push branch ขึ้น GitHub แล้วไปที่ repository
2. คลิก "Compare & pull request"
3. ตั้งชื่อ PR ให้ชัดเจน สั้น อธิบาย feature ที่เปลี่ยน
4. เพิ่ม description อธิบายรายละเอียดการเปลี่ยนแปลง
5. ขอ reviewer อย่างน้อย 1 คน
6. รอ review และแก้ตามที่ comment ก่อน merge

---

## การแก้ไข Merge Conflicts

เมื่อเกิด conflict ระหว่าง merge:

1. **ใน SourceTree**: ไฟล์ที่มี conflict จะแสดงสัญลักษณ์ conflict
2. **เปิดไฟล์** ในตัวแก้ไขข้อความ — จะเห็นรูปแบบนี้:
   ```
   <<<<<<< HEAD
   โค้ดของ branch ปัจจุบัน
   =======
   โค้ดที่ merge เข้ามา
   >>>>>>> feature/other-branch
   ```
3. **แก้ไข** โดยเลือกโค้ดที่ถูกต้องหรือรวมทั้งสอง
4. **ลบ** markers (`<<<<<<<`, `=======`, `>>>>>>>`) ออกทั้งหมด
5. **Stage** ไฟล์ที่แก้แล้ว
6. **Commit** เพื่อจบการ merge

---

## ศัพท์พื้นฐาน Git

| ศัพท์ | ความหมาย |
|-------|----------|
| Repository | พื้นที่เก็บโค้ดและ history |
| Local | บนเครื่องของตัวเอง |
| Remote | บน GitHub/server |
| Commit | บันทึกการเปลี่ยนแปลง |
| Branch | สาขาของโปรเจค |
| Clone | คัดลอก repo จาก remote มา local |
| Push | ส่ง commit ขึ้น remote |
| Pull | ดึง commit จาก remote มา local |
| Merge | รวม branch เข้าด้วยกัน |
| Fetch | ดึงข้อมูลจาก remote แต่ไม่ merge |
| Rebase | จัดเรียง commit ใหม่ |
| Stash | เก็บงานค้างไว้ชั่วคราว |
