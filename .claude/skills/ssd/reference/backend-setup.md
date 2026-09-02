
# SSD Backend Setup — การตั้งค่าโปรเจค Backend

## บริบท

Backend ของ SSD ใช้ ASP.NET Core 6 ด้วยภาษา C# v10 ทุกโปรเจคต้องใช้ Template ของ SSD จาก GitHub Organization Repository และใช้ Package ชุดเดียวกัน

## กฎหลัก

1. ต้องใช้ Template ของ SSD เป็นพื้นฐาน ห้ามสร้างโปรเจคเปล่า
2. ต้องบันทึกไฟล์เป็น encoding UTF-8, CRLF line endings
3. ต้องใช้ Package ที่กำหนดเท่านั้น หากจะใช้ Package อื่นต้องปรึกษาหัวหน้างานก่อน
4. ต้องเริ่มจากการออกแบบฐานข้อมูลก่อน แล้วทำ EF Core Reverse Engineer

## เครื่องมือที่ต้องติดตั้ง

- Visual Studio 2022
- Extension: **EF Core Power Tools** — สำหรับ Reverse Engineer
- Extension: **NUnit Visual Studio Test Generator** — สำหรับ unit test

**VS Code Settings (Tool → Options):**
- Text Editor → C# → Tabs: Indenting=Smart, Tab size=4, Indent size=4, Insert spaces=True
- Text Editor → C# → Code Style → Naming:
  - Interface: Begin with I
  - Type: Pascal Case
  - Non-Field Members: Pascal Case
  - Private/Internal Field: Begin with `_` (camelCase ต่อท้าย)

## Package มาตรฐานที่ต้องใช้

**ต้องใช้:**
- Entity Framework Core (SQL Server) 6.0.16
- Swashbuckle.AspNetCore — Swagger UI
- Serilog 6.1.0 — Logging
- AutoMapper 12.0.1 — Object mapping
- RestSharp 109.0.1 — HTTP client
- Quartz 3.6.2 — Background jobs

**ควรใช้ตามความเหมาะสม:**
- MassTransit 7.2.4 — Message Queue
- NPOI 2.6.0 — Excel
- FluentValidation — Input validation
- CSVHelper — CSV files

## Naming Conventions

### Code (C#)

| รูปแบบ | ใช้กับ |
|--------|--------|
| `PascalCase` | class, method, enum, public field, public property, namespace |
| `camelCase` | local variable, parameter |
| `_camelCase` | private/protected/internal field, property |
| `INameHere` | interface (ขึ้นต้นด้วย I) |

**กฎสำหรับตัวย่อ:**
- ตัวย่อ 2+ คำ: ตัวใหญ่ทั้งหมด เช่น `DTO`, `IT`, `SMI`, `API`, `HTML`
- ตัวย่อ 1 คำ: ตัวใหญ่เฉพาะตัวแรก เช่น `Id`, `Cust`, `Doc`, `Temp`
- ใน camelCase พยางค์แรก: ตัวเล็กทั้งหมด เช่น `html`, `xml`
- ใน camelCase พยางค์ 2+: ตัวใหญ่ทั้งหมด เช่น `docHTML`, `docXML`
- ยกเว้นตัวย่อ 1 คำ พยางค์ 2+: camelCase เช่น `docId`, `custId`

### Files
- ชื่อไฟล์และ folder ใช้ PascalCase เช่น `MyRequestDTO.cs`, `SMIDataService.cs`
- ชื่อไฟล์ต้องเป็นชื่อเดียวกับ class หลักในไฟล์
- 1 ไฟล์ = 1 class หลัก

### การเรียงลำดับ Modifiers
```csharp
public protected internal private new abstract virtual override sealed static readonly extern unsafe volatile async
```

### การเรียงลำดับ Class Members
1. class ย่อย, enums, delegates, events
2. static, const, readonly fields
3. fields และ properties
4. constructors และ finalizers
5. methods

ภายในแต่ละกลุ่ม: public → internal → protected internal → protected → private

## โครงสร้าง Folder มาตรฐาน

```
ProjectName/
├── Attributes/
│   ├── Auth/           # Permission attributes
│   └── Validation/     # Validation attributes
├── Clients/            # RestSharp API clients
├── Configurations/     # Configuration classes (Option Pattern)
├── Consumers/          # MassTransit consumers
├── Controllers/        # API controllers
├── Data/               # EF Core DbContext
├── DTOs/
│   ├── Auth/           # Auth DTOs
│   └── Pagination/     # Pagination DTOs
├── Exceptions/
├── Helpers/            # Helper / Extension Methods
├── HostedServices/     # Quartz background jobs
├── Logs/
├── Middleware/
├── Models/
│   ├── Base/           # Base models
│   ├── Partial/        # Partial class extensions
│   └── Response/       # Response models
├── Services/
│   ├── Auth/           # User authentication service
│   └── Base/           # Base service examples
├── Startups/
├── AutoMapperProfile.cs  # AutoMapper mappings
└── ProjectSetup.cs       # DI configuration
```

**ไฟล์สำคัญ:**
- `AutoMapperProfile.cs` — เก็บ Mapping ระหว่าง Model และ DTO ทั้งหมด
- `ProjectSetup.cs` — เก็บ DI setup ทั้งหมด มีส่วน `ConfigDependency`, `ConfigQuartz`, `ConfigRabbitMQ`, `ConfigKafka`

## EF Core Database Reverse Engineer

### ขั้นตอนที่ 1: คลิกขวาที่ Project
เลือก **EF Core Power Tools → Reverse Engineer**

### ขั้นตอนที่ 2: เลือก Database Connection
เลือกฐานข้อมูลที่ต้องการ หรือ Add Connection String ใหม่ → EF Core version = **EF Core 6.0**

### ขั้นตอนที่ 3: เลือกตาราง
เลือกตารางที่จะใช้งาน

### ขั้นตอนที่ 4: ตั้งค่า Settings
- **Context Name:**
  - ฐานข้อมูลเดียว: `AppDbContext`
  - หลายฐานข้อมูล: `[DatabaseName]Context` เช่น `LogDbContext`
- **EntityTypes path:** `Models`
- **DbContext path:** `Data`
- **Naming — เลือก Configuration:**
  - ✔ Pluralize or singularize generated object names (English)
  - ✔ Use table and column names directly from the database
  - ✔ Use DataAnnotations attributes to configure the model

### ขั้นตอนที่ 5: หากต้องการเปลี่ยนชื่อ Class/Field
กด F2 บนชื่อ table หรือ field ที่ต้องการเปลี่ยน → โปรแกรมจะสร้างไฟล์ `efpt.renaming.json` อัตโนมัติ
(ต้องปิด option "Use table and column names directly from the database" ด้วย)

### กรณีหลายฐานข้อมูล
1. เปลี่ยนชื่อ `efpt.config.json` เป็น `efpt.[ชื่อDb].config.json`
2. Reverse Engineer ฐานข้อมูลที่ 2: Context Name = `[ชื่อDb]Context`, EntityTypes path = `Models/[ชื่อDb]`
3. เพิ่ม `AddDbContext` ใน Startup.cs และ Connection String ใน appsettings.json

## Model Relationships ด้วย Partial Class

เมื่อต้องเพิ่ม relationship ที่ไม่ได้สร้างใน Database ให้ใช้ Partial Class:

```csharp
// /Models/Partial/Agent.cs
namespace MyProject.Models
{
    public partial class Agent
    {
        public virtual ICollection<CallResult> CallResults { get; set; }
    }
}
```

```csharp
// /Data/Partial/AppDbContext.cs
namespace MyProject.Data
{
    public partial class AppDbContext
    {
        partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Agent>(entity =>
            {
                entity.HasMany(e => e.CallResults)
                    .WithOne(e => e.Agent)
                    .HasForeignKey(e => e.AgentId);
            });
        }
    }
}
```
