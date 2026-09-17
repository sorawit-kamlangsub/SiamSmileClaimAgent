
# SSD dotnet-scaffold — EF Core Reverse Engineer ผ่าน CLI

## บริบท

SSD ใช้ **EF Core Power Tools** ผ่าน Visual Studio GUI เป็นมาตรฐาน แต่เมื่อทำงานใน terminal, WSL, หรือต้องการให้ AI assistant รัน scaffold แทน สามารถใช้ `dotnet ef dbcontext scaffold` CLI ได้ — ผลลัพธ์และ conventions เหมือนกันทุกประการกับ GUI approach ใน `backend-setup.md`

---

## กฎหลัก

1. Context ต้องอยู่ใน `Data/` เสมอ — ชื่อ `AppDbContext` (หรือ `[DbName]Context` หากหลายฐานข้อมูล)
2. Models ต้องอยู่ใน `Models/` เสมอ
3. ใช้ `--use-database-names` เสมอ — ห้ามให้ EF Core rename column/table โดยอัตโนมัติ
4. ใช้ `--data-annotations` เสมอ — ตรงกับ EF Core Power Tools setting ของ SSD
5. Connection string ต้องดึงจาก `appsettings.json` หรือ .NET User Secrets — ห้าม hardcode ใน command
6. ใช้ `--force` เมื่อ re-scaffold ตาราง/context เดิม (ครั้งแรกไม่ต้องใช้)
7. Partial class ที่สร้างเพิ่มเองต้องอยู่ใน `Models/Partial/` และ `Data/Partial/` — ไม่ถูกทับเมื่อ re-scaffold

---

## ขั้นตอนที่ 1: ตรวจสอบ Prerequisites

### 1a. dotnet-ef global tool

```bash
dotnet ef --version
```

ถ้าไม่พบ → ติดตั้ง:

```bash
dotnet tool install --global dotnet-ef --version 6.*
```

### 1b. NuGet packages ที่จำเป็น (ตรวจสอบใน .csproj)

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="6.0.*" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="6.0.*" />
```

ถ้ายังไม่มี → ติดตั้ง:

```bash
dotnet add package Microsoft.EntityFrameworkCore.Design --version 6.0.36
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 6.0.36
```

---

## ขั้นตอนที่ 2: อ่าน Connection String

อ่าน `appsettings.json` (หรือ `appsettings.Development.json`) เพื่อดึง connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=MyDatabase;User Id=sa;Password=***;TrustServerCertificate=True;"
  }
}
```

**ห้ามพิมพ์ connection string ที่มี password ตรงๆ ใน prompt** — ให้ใช้ตัวแปรหรืออ่านจากไฟล์แทน:

```bash
# อ่าน connection string จากไฟล์ แล้วใส่ใน variable ก่อนรัน
CS=$(node -e "const c=require('./appsettings.json'); console.log(c.ConnectionStrings.DefaultConnection)")
```

---

## ขั้นตอนที่ 3: รัน Scaffold Command

### กรณีฐานข้อมูลเดียว (AppDbContext)

```bash
dotnet ef dbcontext scaffold \
  "connection_string_here" \
  Microsoft.EntityFrameworkCore.SqlServer \
  --output-dir Models \
  --context-dir Data \
  --context AppDbContext \
  --use-database-names \
  --data-annotations \
  --framework net6.0 \
  --no-onconfiguring
```

### กรณีเลือกเฉพาะบางตาราง

เพิ่ม `--table` ต่อท้าย (สามารถใส่หลายครั้ง):

```bash
dotnet ef dbcontext scaffold "..." Microsoft.EntityFrameworkCore.SqlServer \
  --output-dir Models \
  --context-dir Data \
  --context AppDbContext \
  --use-database-names \
  --data-annotations \
  --framework net6.0 \
  --no-onconfiguring \
  --table Employee \
  --table Order \
  --table OrderDetail
```

### กรณีหลายฐานข้อมูล

```bash
# ฐานข้อมูลที่ 2: context ชื่อ LogDbContext, models ใน Models/Log/
dotnet ef dbcontext scaffold "cs_log_db" Microsoft.EntityFrameworkCore.SqlServer \
  --output-dir Models/Log \
  --context-dir Data \
  --context LogDbContext \
  --use-database-names \
  --data-annotations \
  --framework net6.0 \
  --no-onconfiguring
```

### Re-scaffold (อัปเดต models เมื่อ schema เปลี่ยน)

```bash
dotnet ef dbcontext scaffold "..." Microsoft.EntityFrameworkCore.SqlServer \
  --output-dir Models \
  --context-dir Data \
  --context AppDbContext \
  --use-database-names \
  --data-annotations \
  --framework net6.0 \
  --no-onconfiguring \
  --force
```

**`--force` จะเขียนทับไฟล์ที่ generate ไว้เดิม** — ไฟล์ใน `Models/Partial/` และ `Data/Partial/` ปลอดภัย ไม่ถูกแตะ

---

## ขั้นตอนที่ 4: ตรวจสอบผลลัพธ์

หลัง scaffold เสร็จ ตรวจสอบ:

```
Models/
├── Employee.cs          ← generated (อย่าแก้ตรง)
├── Order.cs             ← generated
├── Partial/             ← แก้ไขได้ ไม่ถูกทับเมื่อ --force
│   └── Employee.cs      ← relationship เพิ่มเอง
Data/
├── AppDbContext.cs      ← generated (อย่าแก้ตรง)
├── Partial/             ← แก้ไขได้
│   └── AppDbContext.cs  ← OnModelCreatingPartial
```

**Build check:**

```bash
dotnet build
```

ต้องผ่านโดยไม่มี error

---

## ขั้นตอนที่ 5: ลงทะเบียน DbContext ใน DI (ถ้าเพิ่งสร้างใหม่)

**ตรวจสอบก่อนเพิ่ม — Grep `AddDbContext` ในไฟล์เหล่านี้ก่อน:**

- พบใน `Startup.cs` → **ข้ามขั้นตอนนี้ทั้งหมด** (template ลงทะเบียน DbContext ใน `Startup.cs` อยู่แล้ว ห้ามเพิ่มซ้ำ)
- พบใน `ProjectSetup.cs` แล้ว → **ข้ามขั้นตอนนี้ทั้งหมด** (เคยเพิ่มไว้แล้ว)
- ไม่พบในไฟล์ใดเลย → เพิ่มใน `ProjectSetup.cs` ส่วน `ConfigDependency`:

```csharp
services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
```

และตรวจสอบว่ามี connection string ใน `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=MyDatabase;..."
  }
}
```

---

## Flag Reference

| Flag | ความหมาย | SSD default |
|------|----------|-------------|
| `--output-dir` | folder สำหรับ Model files | `Models` |
| `--context-dir` | folder สำหรับ DbContext | `Data` |
| `--context` | ชื่อ DbContext class | `AppDbContext` |
| `--use-database-names` | ใช้ชื่อ table/column ตามใน DB ตรงๆ | ✔ เสมอ |
| `--data-annotations` | ใช้ Data Annotations แทน Fluent API | ✔ เสมอ |
| `--no-onconfiguring` | ไม่ generate `OnConfiguring` (connection string ใน code) | ✔ เสมอ |
| `--framework` | Target framework | `net6.0` |
| `--force` | เขียนทับไฟล์เดิม (re-scaffold) | ใช้เฉพาะตอน update |
| `--table` | เลือกเฉพาะตาราง (ใส่ได้หลายครั้ง) | optional |
