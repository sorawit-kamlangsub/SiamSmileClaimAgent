
# SSD Git Commit — มาตรฐานการเขียน Commit Message

## บริบท

SSD ใช้ [Conventional Commits](https://www.conventionalcommits.org/th/v1.0.0/) เป็นมาตรฐาน commit message และ [Semantic Versioning](https://semver.org/) สำหรับกำหนดเวอร์ชัน ใช้ release-it ในการจัดการ release อัตโนมัติ

## รูปแบบ Commit Message

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

## ประเภท (Type)

| Type | ใช้เมื่อ |
|------|---------|
| `feat` | เพิ่ม feature ใหม่ |
| `fix` | แก้ไข bug |
| `docs` | แก้ไขเอกสาร |
| `style` | เปลี่ยนแปลงที่ไม่มีผลต่อ logic (สี, ตำแหน่ง) |
| `refactor` | เปลี่ยนโครงสร้างโค้ดโดยไม่เปลี่ยน function |
| `perf` | ปรับปรุงประสิทธิภาพ |
| `test` | เพิ่มหรือแก้ไข test |
| `build` | เปลี่ยน build system หรือ config |
| `ci` | เปลี่ยน CI configuration |
| `chore` | งานที่ไม่เกี่ยวกับโค้ดหรือ test |
| `revert` | revert การเปลี่ยนแปลง |

## ขอบเขต (Scope)

ระบุส่วนที่เปลี่ยนแปลงในวงเล็บ (ใส่หรือไม่ใส่ก็ได้)

| Scope | ความหมาย |
|-------|----------|
| `(service)` | เปลี่ยน service layer |
| `(controller)` | เปลี่ยน controller |
| `(model)` | เปลี่ยน model/entity |
| `(redux)` | เปลี่ยน redux slice |
| `(api)` | เปลี่ยน api client |
| `(merge)` | merge code |
| `(release)` | release version |
| `(config)` | เปลี่ยน configuration |
| `(deps)` | เปลี่ยน dependencies/packages |

## การเปลี่ยนแปลงสำคัญ (Breaking Change)

หากมีการเปลี่ยนแปลงที่ทุกคนต้องรู้ (เพิ่ม config ที่จำเป็น, เปลี่ยน API signature):
- ใส่ `!` ก่อน `:` เช่น `feat!:` หรือ `feat(api)!:`
- หรือเพิ่ม `BREAKING CHANGE: คำอธิบาย` ใน footer

## กฎการเขียน Commit Message

1. ต้องขึ้นต้นด้วย type เสมอ
2. `feat` — ใช้เมื่อเพิ่ม feature ใหม่เท่านั้น
3. `fix` — ใช้เมื่อแก้ bug เท่านั้น
4. description ต้องอยู่หลัง type:scope ทันที
5. description ไม่เกิน 50 คำ ภาษาไทยหรืออังกฤษ (อังกฤษใช้ imperative form ละประธาน)
6. body เพิ่มเติมได้ โดยเว้นบรรทัดว่าง 1 บรรทัดหลัง description
7. footer สำหรับ reference เช่น `fixes #13, #5` เว้นบรรทัดว่าง 1 บรรทัด

## ตัวอย่าง Commit Message

### ทั่วไป

```
chore: initial project
docs: clean up code
docs: update README.md
chore(merge): pull request #1
chore(release): v1.0.1
chore(config): update appsetting.json
chore(deps): update restsharp version to 109.0.5
perf: improve performance of order service
test: add test for order service
```

### Backend

```
feat: add new feature (api-1)
feat(service): add order service
feat(controller): add order controller
feat(model): add order table
fix: fix bug in order service
refactor: change folder structure
refactor: change order status to enum
```

### Frontend

```
feat: add new feature (ui-1)
feat(redux): add new auth slice
feat(api): add new api client
fix: fix bug in login page
style: change color of button
```

### Breaking Change

```
feat(api)!: change response format of order endpoint

BREAKING CHANGE: Response now returns array instead of object.
Update all frontend clients to handle the new format.
```

---

## Semantic Versioning

รูปแบบ: `MAJOR.MINOR.PATCH`

| ส่วน | เพิ่มเมื่อ | ตัวอย่าง |
|------|-----------|----------|
| MAJOR | Breaking change — โค้ดเก่าใช้ไม่ได้ | `1.0.0` → `2.0.0` |
| MINOR | เพิ่ม feature ใหม่ (backward compatible) | `1.0.0` → `1.1.0` |
| PATCH | แก้ bug (backward compatible) | `1.0.0` → `1.0.1` |

ตัวอย่าง:
- `1.0.0` — เวอร์ชันแรก
- `1.1.0` — เพิ่ม feature
- `1.1.1` — แก้ bug
- `2.0.0` — เปลี่ยนแปลงที่ทำให้โค้ดเก่าใช้ไม่ได้

---

## Release-it

### การติดตั้ง

```bash
npm install -g @release-it/conventional-changelog@8.0.1 release-it@17.3.0
```

### เงื่อนไขการใช้
- Repository ต้องมีเพียง **1 โปรแกรมต่อ 1 Repository**
- Git บนเครื่องต้องเชื่อมกับ GitHub ของ SiamSmileDev แล้ว
- หากมีมากกว่า 1 โปรแกรม ให้แจ้งหัวหน้าทีมเพื่อแยก Repository

### การตั้งค่า
1. แก้ `package.json` ให้ `version` ตรงกับเวอร์ชันปัจจุบัน
2. ดาวน์โหลดและวางไฟล์ `.release-it.json` ไว้ที่ root folder
3. commit: `build: add release-it`

### การใช้งาน

```bash
# 1. Switch ไป develop branch ก่อน
git checkout develop

# 2. รัน release-it
release-it

# 3. เลือก version type: major / minor / patch

# 4. ตอบคำถาม:
# Commit? Yes
# Tag? Yes
# Push? Yes
# Create a release on GitHub? Yes
```
