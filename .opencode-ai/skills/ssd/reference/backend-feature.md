
# SSD Backend Feature — สร้าง Feature ใหม่จาก Natural Language

## บริบท

ใช้ skill นี้ในโปรเจค ASP.NET Core ที่ setup ด้วย `backend-setup` ไปแล้ว เพื่อสร้าง feature ใหม่จากคำอธิบายแบบ natural language (เช่น "API จัดการ order พร้อม list/create/update") ให้เป็นโค้ดครบ Service → Controller → DTO สำหรับ entity เดียว — ถ้าต้องการ review code ที่มีอยู่แล้วใช้ `backend-review` แทน

**ข้อจำกัดสำคัญที่ต่างจาก `frontend-feature`/`python-feature`:** backend ของ SSD ใช้ database-first (`backend-setup.md` กฎข้อ 4) — EF Core `Model` class ถูกสร้างผ่าน EF Core Power Tools Reverse Engineer (Visual Studio GUI extension) เท่านั้น ไม่ใช่ CLI หรือ AI ที่เขียนเองได้ ดังนั้น skill นี้**ไม่สร้าง EF Core Model class แทนผู้ใช้เด็ดขาด** — ดูขั้นตอนที่ 0a

## กฎหลัก

1. ต้องตีความ feature description ก่อนเขียนโค้ดเสมอ (ดูขั้นตอนที่ 0) — ห้ามเดาแล้วเริ่มเขียนโค้ดทันทีถ้าข้อมูลไม่พอ ใช้ AskUserQuestion ถาม
2. **ต้องเช็คว่า EF Core Model ของ entity มีอยู่จริงก่อนเขียนโค้ดชั้นอื่นเสมอ** (ขั้นตอนที่ 0a) — ถ้าไม่มี ต้องหยุดและบอกผู้ใช้ให้ออกแบบตารางแล้วทำ EF Core Power Tools Reverse Engineer เอง ห้ามเขียน Model class ขึ้นมาเองเป็นทางลัดเด็ดขาด เพราะจะขัดกับ Reverse Engineer รอบจริงที่จะ overwrite/conflict กับไฟล์ที่เขียนมือ
3. ต้องสร้างตามลำดับ layer เดียวกับ `dotnet-service.md`/`dotnet-controller.md` เสมอ: Service (Interface + Implementation + DTO + AutoMapper) → Controller — ห้ามข้ามลำดับ
4. ทุก service ต้องมี interface คู่กันและ inject ผ่าน DI เท่านั้น (`dotnet-service.md` กฎข้อ 1-3) — ห้าม `new` class ใน service
5. ทุก endpoint ใหม่ต้องตาม REST policy เดิม (GET/POST เท่านั้น, ห้าม PUT/PATCH/DELETE, update/delete ใช้ POST + `{id}/update`/`{id}/delete`)
6. ต้องใช้ AutoMapper ผ่าน `AutoMapperProfile.cs` เท่านั้น ห้ามใช้ `MappingExtension` class
7. ก่อนเขียนโค้ดแต่ละชั้น ต้องอ่านไฟล์ reference ของชั้นนั้นด้วย Read tool ก่อนเสมอ (`dotnet-service.md`, `dotnet-controller.md`, และ `dotnet-infra.md` ถ้ามี external API/background job) — ห้ามเขียนจากความจำ

---

## ขั้นตอนที่ 0: ตีความ Feature Description

จาก feature description ที่ user ให้มา ต้องตอบคำถามเหล่านี้ก่อนเริ่มเขียนโค้ด (ถ้าไม่ชัดเจน ใช้ AskUserQuestion ถาม):

| คำถาม | ผลต่อโค้ด |
|-------|----------|
| Entity/table ชื่ออะไร (PascalCase เอกพจน์ ตาม `database.md`)? | ใช้เป็น `{Entity}` ตลอด — ต้องเช็ค Model ก่อนเสมอ (ขั้นตอนที่ 0a) |
| ต้องเรียก external API (เช่น LINE, payment gateway) ไหม? | ต้อง → สร้าง RestSharp client ตาม `dotnet-infra.md` ส่วนที่ 3 |
| ต้องมี scheduled/background job ไหม? | ต้อง → สร้าง Quartz job ตาม `dotnet-infra.md` ส่วนที่ 2 |
| โปรเจคเปิด `OAuth.EnableOAuth: true` ไหม? | เปิด → Controller ต้องอ่าน Scope/Audience จริงจาก `appsettings.json` ตาม `dotnet-controller.md` กฎข้อ 9 |

## ขั้นตอนที่ 0a: เช็คว่า EF Core Model มีอยู่จริง (หยุดถ้าไม่มี)

ก่อนเขียนโค้ดใดๆ ที่อ้างถึง `{Entity}` ต้องตรวจสอบว่า Model มีอยู่จริงในโปรเจค:

1. ใช้ Glob tool หา `**/Models/{Entity}.cs` (และ `**/Models/{Entity}*.cs` เผื่อชื่อไม่ตรงเป๊ะ)
2. ถ้าไม่เจอ ใช้ Grep tool หา `class {Entity}` ทั้งโปรเจค เผื่อ Model อยู่ folder อื่น

**ถ้าไม่เจอ Model เลย — ถามผู้ใช้ก่อนด้วย AskUserQuestion:**

> คำถาม: "ยังไม่มี EF Core Model สำหรับ `{Entity}` — ต้องการให้ช่วยออกแบบตารางและ scaffold ให้เลยไหม?"
>
> - "ช่วยออกแบบและ scaffold ให้เลย" → ดำเนินการ **Path A** (ด้านล่าง)
> - "จัดการเองก่อน" → ดำเนินการ **Path B** (ด้านล่าง)

### Path A: AI-Assisted Design + Scaffold

เมื่อผู้ใช้เลือก "ช่วยออกแบบและ scaffold ให้เลย":

**A1. ถามคอลัมน์ (AskUserQuestion)**

ถามว่าต้องการคอลัมน์อะไรนอกจาก standard columns (`IsActive`, `CreatedByUserId`, `CreatedDate`, `UpdatedByUserId`, `UpdatedDate`) — เช่น ชื่อ, ราคา, FK ไปตารางอื่น

**A2. ออกแบบ DDL ตาม `database.md`**

- อ่าน `reference/database.md` ด้วย Read tool ก่อนเสมอ
- สร้าง CREATE TABLE SQL: PascalCase, `datetime2` สำหรับวันที่, standard columns ครบทุกตาราง
- บันทึกเป็น `Migrations/NNN_Create{Entity}.sql` ในโปรเจค

**A3. ตรวจ / ถาม Connection String**

- อ่าน `appsettings.Development.json` → `ConnectionStrings.DefaultConnection`
- ถ้าค่าเป็น placeholder หรือไม่มี — ถามผู้ใช้ด้วย AskUserQuestion

**A4. รัน DDL ด้วย sqlcmd**

```bash
sqlcmd -S "<server>" -E -d "<database>" -i "Migrations/NNN_Create{Entity}.sql"
```

ตรวจสอบว่าตารางถูกสร้างจริง:

```bash
sqlcmd -S "<server>" -E -d "<database>" -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
```

**A5. รัน EF Core Scaffold (ทำตาม `dotnet-scaffold.md` ขั้นตอน 1–5)**

ตรวจ dotnet-ef tool, NuGet packages (`Microsoft.EntityFrameworkCore.Design`, `.SqlServer`) แล้วรัน:

```bash
dotnet ef dbcontext scaffold "<ConnectionString>" Microsoft.EntityFrameworkCore.SqlServer \
  --output-dir Models --context-dir Data --context AppDBContext \
  --use-database-names --data-annotations --framework net6.0 --no-onconfiguring --force
```

**A6. ยืนยัน Model ถูกสร้างแล้ว → ไปขั้นตอน 0b**

ตรวจว่า `Models/{Entity}.cs` มีอยู่แล้ว → ดำเนินการต่อที่ขั้นตอน 0b และ 1 ตามปกติ

ห้ามเขียน Model class ด้วยมือเอง แม้ในขั้นตอนนี้ — ต้องใช้ scaffold เท่านั้น เพื่อให้ตรงกับ schema จริงใน database

---

### Path B: ผู้ใช้จัดการเอง

> ยังไม่มี EF Core Model สำหรับ `{Entity}` ต้องออกแบบตาราง `{Entity}` ก่อนตาม `database.md` (PascalCase, standard columns: `IsActive`/`CreatedByUserId`/`CreatedDate`/`UpdatedByUserId`/`UpdatedDate`, `datetime2` สำหรับวันที่) แล้วทำ EF Core Power Tools → Reverse Engineer ตาม `backend-setup.md` (คลิกขวา Project → EF Core Power Tools → Reverse Engineer → เลือกตารางนี้) หรือใช้ `/ssd dotnet-scaffold` เพื่อ reverse-engineer ผ่าน CLI ก่อน จากนั้นเรียก `backend-feature` ใหม่อีกครั้ง

ห้ามเขียน Model class ขึ้นมาเองแทน แม้จะรู้ schema คร่าวๆ จาก feature description ก็ตาม — Reverse Engineer รอบจริงจะ generate ทับหรือขัดกับไฟล์ที่เขียนมือ

---

**ถ้าเจอ Model แล้ว** — ไปขั้นตอนที่ 0b ก่อน แล้วค่อยไปขั้นตอนที่ 1

---

## ขั้นตอนที่ 0b: Inspect Project Context (เก็บค่าไว้ใช้ทุก step ถัดไป)

**ทำทันทีหลังจากยืนยันว่า EF Core Model มีอยู่แล้ว — ก่อนเขียนโค้ดบรรทัดแรก**

### 1. อ่าน .csproj — หา RootNamespace และ Serilog

ใช้ Glob `**/*.csproj` แล้ว Read ไฟล์ที่เจอ ดึง:

- `<RootNamespace>` — ถ้าไม่มี tag นี้ ใช้ `<AssemblyName>` ถ้าไม่มีอีก ใช้ชื่อ folder โปรเจค (ชื่อ folder ที่มี `.csproj` อยู่)
- ตรวจสอบว่ามี `<PackageReference Include="Serilog` (ครอบคลุมทั้ง `Serilog`, `Serilog.AspNetCore`, `Serilog.Extensions.Logging`) ไหม → เก็บเป็น **{UsesSerilog}** = true/false

### 2. หาชื่อ DbContext จริง

ใช้ Glob `**/Data/*.cs` → Read หรือ Grep pattern `class \w+(Db|DB)?Context` ในไฟล์ที่เจอ → เก็บชื่อ class จริงเป็น **{DbContextClass}**

- ถ้าเจอหลายชื่อ ให้เลือก `AppDbContext` หรือ `AppDBContext` ก่อน — ถ้าไม่มีทั้งสองชื่อนั้น ให้ถาม user ด้วย AskUserQuestion
- ถ้าไม่เจอไฟล์ใน `Data/` เลย ให้ Grep ทั้งโปรเจค pattern `class \w+Context` เพื่อหาใน folder อื่น

### 3. สรุปค่าที่จะใช้

| ตัวแปร | ค่าที่ได้ | ใช้ที่ |
|--------|---------|-------|
| `{RootNamespace}` | เช่น `SkillTest`, `MyApi` | namespace declaration ทุกไฟล์ที่ generate |
| `{DbContextClass}` | เช่น `AppDBContext`, `LogContext` | constructor injection ใน Service |
| `{UsesSerilog}` | true/false | ตัดสินใจเรื่อง using alias ในขั้นตอนที่ 0c |

---

## ขั้นตอนที่ 0c: ILogger Alias (ถ้า {UsesSerilog} = true)

.NET 6 เปิด `<ImplicitUsings>enable</ImplicitUsings>` โดย default ซึ่ง include `Microsoft.Extensions.Logging` อัตโนมัติ — ถ้า project ใช้ Serilog ด้วยจะเกิด ambiguous reference ระหว่าง `Serilog.ILogger` กับ `Microsoft.Extensions.Logging.ILogger`

**ทุกไฟล์ที่ generate และมีการใช้ `ILogger` ต้องเพิ่ม using alias บรรทัดบนสุดของ using block:**

```csharp
using ILogger = Serilog.ILogger;
```

ห้ามใช้แค่ `using Serilog;` เพียงอย่างเดียว — ต้องมี alias เพื่อหลีกเลี่ยง ambiguous reference

---

## ขั้นตอนที่ 1: Service Layer

**อ่านไฟล์ `reference/dotnet-service.md` ด้วย Read tool ก่อนเขียนโค้ด** ใช้โค้ดตัวอย่างในไฟล์นั้นตรงๆ:

> **ทุกไฟล์ที่ generate ต้องขึ้นต้น namespace declaration ด้วย `{RootNamespace}` จากขั้นตอนที่ 0b เสมอ** เช่น `namespace SkillTest.Services.Order` — ห้ามใช้ชื่อ namespace จากความจำหรือเดา

1. Interface — `Services/{Entity}/I{Entity}Service.cs`
2. Service Implementation — `Services/{Entity}/{Entity}Service.cs` (inject **`{DbContextClass}`** จากขั้นตอนที่ 0b + `IMapper` เป็นพื้นฐาน, เพิ่ม `ILoginDetailServices` ถ้าต้องข้อมูล user)
3. DTOs — `DTOs/{Entity}/{Entity}TableDto.cs`, `{Entity}ResponseDto.cs`, `{Entity}RequestDto.cs`, `{Entity}FilterDto.cs` (ตาม naming convention ในไฟล์นั้น)
4. AutoMapper entries — เพิ่มใน `AutoMapperProfile.cs`
5. DI registration — เพิ่มใน `ProjectSetup.cs` ส่วน `ConfigDependency`

## ขั้นตอนที่ 2: Controller

**อ่านไฟล์ `reference/dotnet-controller.md` ด้วย Read tool ก่อนเขียนโค้ด** สร้าง `Controllers/{Entity}Controller.cs`:

- Route `api/{entity-kebab-case}`, ทุก HTTP attribute ต้องมี `Name=`
- GET/POST เท่านั้น — update/delete ใช้ `[HttpPost("{id}/update")]`/`[HttpPost("{id}/delete")]`
- Return ผ่าน `ResponseResult` + `ServiceResponse` ทุก method
- ใช้ `ClaimPermission` attribute ถ้า feature ต้องจำกัดสิทธิ์
- ถ้า `OAuth.EnableOAuth: true` — อ่าน Scope/Audience จริงจาก `appsettings.json` ตามกฎข้อ 9 ของไฟล์นั้น (fallback `demo_pos` ถ้ายังไม่มีค่าจริง)

> **สำคัญ — Permission.cs pattern:** ทุก `const string` ที่เพิ่มใน `Permission.cs` ต้องมี `public static AuthorizationPolicy {Name}Permission` คู่กันเสมอ โดยใช้ pattern `.RequireClaim({Name}).Build()` — `AuthorizationServices.cs` ของ template ใช้ reflection loop เพื่อลงทะเบียน policy จาก `const string` ทุกตัว และถ้าไม่เจอ policy คู่กัน app จะ crash ที่ startup ด้วย `Sequence contains no elements`
>
> ตัวอย่าง:
> ```csharp
> public const string ProductAdmin = "product_api:admin";
>
> public static AuthorizationPolicy ProductAdminPermission
>     = new AuthorizationPolicyBuilder()
>         .RequireClaim(ProductAdmin)
>         .Build();
> ```

## ขั้นตอนที่ 3: External API / Background Job (เฉพาะถ้าต้องใช้)

**อ่านไฟล์ `reference/dotnet-infra.md` ด้วย Read tool ก่อนเขียนโค้ด**:
- เรียก external API → ส่วนที่ 3 (RestSharp) — สร้าง `Clients/{Name}Client.cs`, Option Pattern config
- ต้องมี scheduled job → ส่วนที่ 2 (Quartz) — สร้าง `HostedServices/{Name}Job.cs` พร้อม `[DisallowConcurrentExecution]`, ตั้ง cron ใน `appsettings.json`

---

## ตัวอย่างแบบสมบูรณ์: API จัดการ Order (List/Create/Update)

สมมติเช็คขั้นตอนที่ 0a แล้วพบว่ามี `Models/Order.cs` อยู่แล้ว (Reverse Engineer ไปแล้ว) — ไฟล์ที่ต้องสร้าง/แก้ทั้งหมด:

```
Services/Order/IOrderService.cs            # Interface (1)
Services/Order/OrderService.cs             # GetAllAsync, GetByIdAsync, CreateAsync, UpdateAsync (1)
DTOs/Order/OrderTableDto.cs                # แสดงในตาราง (1)
DTOs/Order/OrderResponseDto.cs             # ส่งกลับ client (1)
DTOs/Order/OrderRequestDto.cs              # รับจาก client (1)
DTOs/Order/OrderFilterDto.cs               # filter สำหรับ GetAll (1)
AutoMapperProfile.cs                       # เพิ่ม CreateMap<Order, OrderTableDto/ResponseDto>(), CreateMap<OrderRequestDto, Order>() (1)
ProjectSetup.cs                            # services.AddScoped<IOrderService, OrderService>() (1)
Controllers/OrderController.cs             # GetAll, GetById, Create, Update — GET/POST เท่านั้น (2)
```

ถ้าไม่พบ `Models/Order.cs` ในขั้นตอนที่ 0a ต้องหยุดที่นั่นและบอกผู้ใช้ตามข้อความในขั้นตอนที่ 0a — ไม่ไปขั้นตอนที่ 1 ต่อ

---

## ขั้นตอนที่ 4: Verify

```bash
dotnet build
dotnet run
```

เปิด Swagger UI (`/swagger`) ตรวจว่า endpoint ใหม่ขึ้นครบ (GET all, GET by id, POST create, POST `{id}/update`), ทดสอบเรียกจริงแล้วตรวจ response เป็น `ServiceResponse` ที่มี `isSuccess`/`data` ตามรูปแบบเดิม
