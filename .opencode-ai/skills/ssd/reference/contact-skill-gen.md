
# SSD Contact Skill Generator — สร้าง SKILL.md สำหรับ Shared Library และ Contact Service

## บริบท

เมื่อ SSD มี shared library ใหม่หรือ contact service ใหม่ที่ต้องใช้ร่วมกันหลาย project ให้แปลง setup document / prompt เป็น SKILL.md มาตรฐาน SSD เพื่อให้ทีมสามารถ integrate ได้ถูกต้องโดยไม่ต้องอ่านเอกสารต้นฉบับทุกครั้ง

ตัวอย่าง input → output:
- `LineOAPA.Shared.md` → `skills/ssd-lineoa-contact/SKILL.md`
- `Payment.Shared.md` → `skills/ssd-payment-contact/SKILL.md`
- `SMS.Gateway.md` → `skills/ssd-sms-contact/SKILL.md`

---

## กฎหลัก

1. SKILL.md ที่สร้างต้องเขียนเป็นภาษาไทย ยกเว้น code, command, path, และชื่อ class
2. ทุก code block ต้องสามารถ copy-paste แล้วใช้ได้ทันที ห้ามมี placeholder ที่คลุมเครือ
3. Path ที่ขึ้นกับแต่ละ project ให้ใช้ `{PROJECT}` หรือ `{ProjectFolder}` เป็น placeholder
4. ถ้า library มาจาก GitHub private repo ต้องระบุว่าใช้ `gh` เท่านั้น ห้ามใช้ `curl`
5. Version ของ library ต้องระบุให้ชัดเจนในคำสั่งดาวน์โหลด
6. สิ่งที่ห้ามแก้ไขต้องขึ้นต้นด้วย "ห้าม" เสมอ — อย่าใช้คำอ่อนแอเช่น "ควรหลีกเลี่ยง"
7. ขั้นตอนสุดท้ายต้องมี build verification + file verification เสมอ

---

## ขั้นตอนที่ 1: วิเคราะห์ Setup Document

อ่านเอกสารและสกัดข้อมูลตามหมวดนี้ก่อนเขียน SKILL.md

### 1.1 ข้อมูลพื้นฐาน

| สิ่งที่ต้องหา | คำถาม |
|--------------|-------|
| ชื่อ library | DLL / package / service ชื่ออะไร? |
| แหล่งที่มา | GitHub release (private/public)? NuGet? local path? URL? |
| Version | เวอร์ชันที่ต้องใช้คืออะไร? |
| วัตถุประสงค์ | ทำอะไร? ใช้กับ service หรือ protocol ไหน? (RabbitMQ, HTTP, gRPC, ฯลฯ) |

### 1.2 การติดตั้ง

| สิ่งที่ต้องหา | คำถาม |
|--------------|-------|
| คำสั่งดาวน์โหลด | `gh release download`? `dotnet add package`? `nuget install`? |
| ปลายทางของไฟล์ | DLL/package ต้องวางที่ไหน? |
| กฎ path พิเศษ | มีความต่างระหว่าง workspace และ PROJECT folder หรือไม่? |
| ขั้นตอน cleanup | ต้องลบไฟล์หรือโฟลเดอร์อะไรหลังติดตั้ง? |

### 1.3 การตั้งค่า Project

| ไฟล์ | สิ่งที่ต้องหา |
|------|--------------|
| `.csproj` | `<Reference>`, `<PackageReference>`, `<HintPath>` ที่ต้องเพิ่ม |
| `appsettings.json` | keys ที่ต้องเพิ่มหรือแก้ไข (และค่าที่ต้องไม่ลบ) |
| `ProjectSetup.cs` / `Startup.cs` | `using`, DI registration, clients/services ที่ต้อง add |

### 1.4 Clients / Interfaces ที่ Library Expose

ระบุทุก class/interface ที่ library ให้ใช้:
- Request clients (เช่น `SendSmsRequest`, `ProcessPaymentRequest`)
- Service interfaces (เช่น `IPaymentGateway`, `ISmsProvider`)
- DTO/Models (เช่น `PaymentResponse`, `SmsDeliveryStatus`)

### 1.5 สิ่งที่ห้ามแก้ไข

จาก setup document ระบุทุกสิ่งที่เอกสารบอกว่า "ห้ามทำ" หรือ "อย่าเปลี่ยน":
- ไฟล์ที่ห้ามแก้ถ้ามี key อยู่แล้ว (เช่น Startup.cs ถ้ามี AddMassTransit)
- Setting ที่ต้องแก้เฉพาะบางส่วน (เช่น เพิ่ม EnableRabbitMQ แต่ห้ามลบ KafkaSetting)
- ข้อจำกัด ItemGroup ใน .csproj

### 1.6 การตรวจสอบ

| สิ่งที่ต้องหา | คำถาม |
|--------------|-------|
| Build command | `dotnet build {path}` — path คืออะไร? |
| File verification | path ที่ต้องมีไฟล์อยู่ (`test -f ...`) |
| Negative checks | path/folder ที่ต้องไม่มี (`! test -d ...`) |

---

## ขั้นตอนที่ 2: สร้าง SKILL.md

สร้างไฟล์ที่ `skills/{skill-name}/SKILL.md` โดยใช้โครงสร้างนี้:

### 2.1 YAML Frontmatter

```yaml
---
name: ssd-{ชื่อย่อ-service}-contact
description: ใช้ skill นี้เมื่อต้องการเชื่อมต่อ {ชื่อ service} เข้า .NET project, ติดตั้ง {ชื่อ DLL/package}, ตั้งค่า {ชื่อ integration}, หรือใช้งาน {ชื่อ clients} ตามมาตรฐาน SSD
version: 1.0.0
---
```

**กฎตั้งชื่อ skill:**
- รูปแบบ: `ssd-{service-name}-contact`
- ใช้ kebab-case ทั้งหมด ขึ้นต้นด้วย `ssd-`
- `description` ต้องบอก trigger condition ที่ชัดเจน — AI agent จะใช้ข้อความนี้ตัดสินใจว่าจะ activate skill นี้หรือไม่

### 2.2 โครงสร้างเนื้อหา (เรียงตามลำดับนี้เสมอ)

```markdown
# SSD {ชื่อ Service} Contact — การเชื่อมต่อ {ชื่อ Service} ใน .NET Project

## บริบท
{อธิบาย service/library นี้คืออะไร}
{บอกว่า SSD ใช้เพื่ออะไร}
{ระบุ clients/interfaces ที่มีให้ใช้พร้อมคำอธิบายสั้น}

---

## กฎหลัก
1. {กฎ path / workspace / PROJECT — ถ้ามีกฎพิเศษ}
2. {สิ่งที่ห้ามแก้ไข — ขึ้นต้นด้วย "ห้าม"}
3. {กฎเพิ่มเติม...}

{ตาราง path ถูก/ผิด — เฉพาะเมื่อ library ติดตั้งเป็น DLL ที่มีกฎ path}

---

## ขั้นตอนที่ 1: ตรวจหา Workspace และ PROJECT
{เฉพาะเมื่อ path ต้องการ workspace/PROJECT distinction}

## ขั้นตอนที่ 2: {ชื่อขั้นตอน — ติดตั้ง / ดาวน์โหลด}
{คำสั่ง shell พร้อม code block}

## ขั้นตอนที่ 3: เพิ่มการตั้งค่าใน Project Files
### ไฟล์ที่ 1: `{ProjectFolder}/{ProjectFolder}.csproj`
{code block}
### ไฟล์ที่ 2: `{ProjectFolder}/appsettings.json`
{code block}
### ไฟล์ที่ 3: `{ProjectFolder}/ProjectSetup.cs`
{code block}

## ขั้นตอนที่ N: ตรวจสอบ Build
{คำสั่ง build + verify}
```

### 2.3 Pattern ตาราง Path (ใช้เมื่อ library เป็น DLL ที่ต้องวางใน folder)

```markdown
| mkdir command | เมื่อ | ผล |
|---|---|---|
| `mkdir $PROJECT/Contracts` | workspace มี .sln, PROJECT เป็น subfolder | **ถูก** |
| `mkdir Contracts` | PROJECT เป็น subfolder | **ผิด** |
| `mkdir $PROJECT/$PROJECT/Contracts` | อยู่ใน PROJECT แล้ว | **ผิด** |
```

### 2.4 Pattern การ Register ใน ProjectSetup.cs

| ประเภท integration | pattern |
|-------------------|---------|
| MassTransit request client | `configure.AddRequestClient<{ClientName}>();` |
| Scoped service | `services.AddScoped<I{Name}, {Name}>();` |
| Singleton | `services.AddSingleton<{Name}>();` |
| Options pattern | `services.Configure<{Name}Setting>(Configuration.GetSection({Name}Setting.Section));` |

---

## ขั้นตอนที่ 3: ตรวจสอบ SKILL.md ที่สร้าง

ก่อน save ให้ตรวจสอบรายการนี้:

- [ ] frontmatter มี `name`, `description`, `version` ครบ
- [ ] `description` บอก trigger condition ที่ชัดเจนและ activate ได้ถูกสถานการณ์
- [ ] มีส่วน **บริบท** อธิบาย service/library อย่างชัดเจน
- [ ] มีส่วน **กฎหลัก** ระบุสิ่งที่ห้ามทำ
- [ ] ทุก code block ใช้ `{PROJECT}` หรือ `{ProjectFolder}` แทน hardcode path
- [ ] มีขั้นตอน verify ที่สุดท้ายเสมอ
- [ ] เนื้อหาเป็นภาษาไทย ยกเว้น code/path/ชื่อ class

---

## ตัวอย่าง SKILL.md ที่สร้างโดย skill นี้

ตัวอย่าง output จาก `LineOAPA.Shared.md` → `skills/ssd-lineoa-contact/SKILL.md`

### Frontmatter ที่ได้

```yaml
name: ssd-lineoa-contact
description: ใช้ skill นี้เมื่อต้องการเชื่อมต่อ Line OA contact เข้า .NET project,
  ติดตั้ง LineOAPA.Shared.dll จาก private GitHub release, ตั้งค่า MassTransit RabbitMQ
version: 1.0.0
```

### บริบทที่ได้

> SSD มี shared library `LineOAPA.Shared.dll` สำหรับ Line OA Platform API  
> Request clients: `LinkUserToAccessRichMenu`, `UnlinkUserFromAccessRichMenu`, `RequestSendMessagesToUsers`

### กฎหลักที่ได้ (8 ข้อ)

1. **Workspace** = root ของ repo (มี .sln) — ห้าม cd เข้า subfolder
2. **PROJECT** = folder ที่มี .csproj — ต้องหาก่อนเสมอ
3. DLL ต้องอยู่ที่ `{PROJECT}/Contracts/LineOAPA.Shared.dll` เท่านั้น
4. ห้ามสร้าง `Contracts/` ที่ workspace root
5. ห้ามแก้ `Startup.cs` ถ้ามี `AddMassTransit` อยู่แล้ว
6. ห้ามลบ `KafkaSetting` — แก้เฉพาะ `EnableRabbitMQ` และ `Port`
7. ห้ามแก้ ItemGroup อื่นใน .csproj
8. ห้ามสร้าง service file ถ้าไม่ได้รับคำสั่ง

### ขั้นตอนที่ได้ (4 ขั้น)

1. ตรวจหา workspace + PROJECT (`ls *.sln`, `ls */*.csproj`)
2. ดาวน์โหลด DLL (`gh release download`, extract, cleanup)
3. แก้ไข .csproj + appsettings.json + ProjectSetup.cs
4. `dotnet build` + verify path
