
# SSD Backend Doctor — ตรวจสุขภาพโปรเจค ASP.NET Core

## บริบท

ใช้ skill นี้เพื่อ diagnose โปรเจค ASP.NET Core 6 ว่าถูกตั้งค่าตาม SSD standards ครบถ้วนหรือไม่ ตรวจ NuGet packages, Program.cs middleware pipeline, appsettings.json, และ folder structure — ไม่ใช่ code quality (ใช้ `ssd-backend-review` สำหรับนั้น)

---

## กฎหลัก

1. อ่านไฟล์เท่านั้น — ห้ามแก้ไขไฟล์ใดๆ ในขั้นตอน doctor
2. ตรวจ .csproj ก่อนเสมอ — missing package ถือเป็น ❌
3. ตรวจ Program.cs ว่า middleware pipeline อยู่ในลำดับที่ถูกต้อง
4. ตรวจ appsettings.json ว่ามี section ที่จำเป็น (ConnectionStrings, Serilog)
5. ตรวจว่ามี AutoMapperProfile.cs (ไม่ใช่ MappingExtension.cs)
6. รายงาน ✅ ผ่าน / ❌ พบปัญหา / ⚠️ ไม่แน่ใจ / ⊘ ไม่พบไฟล์ ต่อทุก check item

---

## Checklist การตรวจสอบ

### Area 1: NuGet Packages (.csproj)

| Package | หมายเหตุ |
|---------|----------|
| `Serilog.AspNetCore` | structured logging |
| `Serilog.Sinks.Console` | console sink |
| `Serilog.Sinks.File` | file sink |
| `AutoMapper` | object mapping |
| `AutoMapper.Extensions.Microsoft.DependencyInjection` | DI integration |
| `Microsoft.EntityFrameworkCore.SqlServer` | version 6.x |
| `Microsoft.EntityFrameworkCore.Tools` | devDependency (dotnet-tool) |
| `Swashbuckle.AspNetCore` | Swagger/OpenAPI |

### Area 2: Program.cs Middleware Pipeline

| Check | สิ่งที่ต้องมี |
|-------|-------------|
| Serilog setup | `UseSerilog(...)` หรือ `Log.Logger = new LoggerConfiguration()...` |
| AutoMapper | `builder.Services.AddAutoMapper(...)` |
| DbContext | `builder.Services.AddDbContext<AppDbContext>(...)` |
| Authentication | `app.UseAuthentication()` ก่อน `UseAuthorization()` |
| Authorization | `app.UseAuthorization()` |
| HTTPS | `app.UseHttpsRedirection()` |
| Swagger | `app.UseSwagger()` + `app.UseSwaggerUI()` |

ลำดับ middleware ที่ถูกต้อง:
```
UseHttpsRedirection → UseRouting → UseAuthentication → UseAuthorization → MapControllers
```

### Area 3: appsettings.json Structure

| Section | ต้องมี |
|---------|-------|
| `ConnectionStrings` | key สำหรับ default database connection |
| `Serilog` | WriteTo, MinimumLevel config |
| `JwtSettings` หรือ `Authentication` | ถ้าใช้ JWT (Warning ถ้าไม่มี) |

### Area 4: Folder Structure

| Path | ต้องมี |
|------|-------|
| `Controllers/` | API controllers |
| `Services/` | service layer + interfaces |
| `Models/` หรือ `Data/Models/` | EF Core generated models |
| `Data/` | AppDbContext |
| `DTOs/` | request/response DTOs |

### Area 5: AutoMapper Setup

| Check | สิ่งที่ต้องมี |
|-------|-------------|
| `AutoMapperProfile.cs` | ต้องมีไฟล์นี้ |
| `MappingExtension.cs` | ❌ ห้ามมี — ใช้ AutoMapperProfile แทน |

### Area 6: EF Core

| Check | สิ่งที่ต้องมี |
|-------|-------------|
| `AppDbContext.cs` | ใน Data/ หรือ root project |
| `AppDbContext` partial class | ใน `Data/Partial/AppDbContext.cs` (ถ้ามี custom relationships) |

---

## ขั้นตอนการตรวจสอบ

### ขั้นตอนที่ 1: ระบุ root ของโปรเจค

```
# หา .csproj file
# ถ้าไม่บอก path ให้ glob หา *.csproj ใกล้สุด
```

### ขั้นตอนที่ 2: อ่านและตรวจทุก Area

อ่าน .csproj, Program.cs, appsettings.json และ list folders

### ขั้นตอนที่ 3: ออก Health Report

```
## Backend Doctor Report — [project name]

### Area 1: NuGet Packages
| Package | Status | หมายเหตุ |
|---------|--------|----------|
| Serilog.AspNetCore | ✅ | |
| AutoMapper | ❌ | ไม่พบใน .csproj |

### Area 2: Program.cs
| Check | Status | หมายเหตุ |
|-------|--------|----------|
| Serilog setup | ✅ | |
| UseAuthentication before UseAuthorization | ❌ | ลำดับผิด |

### Area 3: appsettings.json
| Section | Status |
|---------|--------|
| ConnectionStrings | ✅ |
| Serilog | ⊘ ไม่พบ section |

### Area 4: Folder Structure
| Path | Status |
|------|--------|
| Controllers/ | ✅ |
| DTOs/ | ⊘ ไม่พบ |

### Area 5: AutoMapper
| Check | Status |
|-------|--------|
| AutoMapperProfile.cs | ✅ |
| MappingExtension.cs (ห้ามมี) | ✅ ไม่พบ |

### สรุป
- ❌ Critical: X รายการ — ต้องแก้ก่อนพัฒนา
- ⚠️ Warning: X รายการ — ควรแก้
- ✅ ผ่าน: X รายการ
- แนะนำ: [ขั้นตอนถัดไป เช่น ใช้ ssd-backend-setup เพื่อ setup ที่ขาดหายไป]
```
