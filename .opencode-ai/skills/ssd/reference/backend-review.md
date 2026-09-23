
# SSD Backend Review — ตรวจสอบ Code C#/.NET

## บริบท

ใช้ skill นี้เพื่อ audit code backend ก่อน PR หรือก่อน refactor เพื่อให้ได้รายงาน violations ที่ชัดเจน ใช้ร่วมกับ `ssd-backend-refactor` เพื่อแก้ไขสิ่งที่พบ

---

## กฎหลัก

1. อ่าน code เท่านั้น — ห้ามแก้ไขไฟล์ใดๆ ในขั้นตอน review
2. รายงานทุก violation พร้อม file path และ line number
3. จัดกลุ่ม violations ตาม category ไม่ใช่ตาม file
4. ถ้าไม่แน่ใจว่า violation จริงหรือไม่ ให้ระบุเป็น Warning

---

## Checklist การตรวจสอบ

### Category 1: Naming Conventions

| สิ่ง | รูปแบบที่ถูก | ตัวอย่างที่ผิด |
|-----|-------------|--------------|
| Class, Method, Property | PascalCase | `orderService`, `get_order` |
| Private field | `_camelCase` | `camelCase`, `m_camelCase`, `camelCase_` |
| Interface | `I` + PascalCase | `OrderService` (ไม่มี I), `IorderService` |
| ตัวย่อ 2+ คำ | ALL CAPS | `Dto` (ควรเป็น `DTO`), `Api` (ควรเป็น `API`) |
| ตัวย่อ 1 คำ | First letter cap | `ID` (ควรเป็น `Id`), `DOC` (ควรเป็น `Doc`) |

### Category 2: Controller

| กฎ | ถูก | ผิด |
|----|-----|-----|
| Route attribute | `[Route("api/order-header")]` (kebab-case) | `[Route("api/OrderHeader")]`, `[Route("api/order_header")]` |
| HTTP method Name | `[HttpGet(Name = "GetOrders")]` | `[HttpGet]` (ไม่มี Name) |
| ใช้เฉพาะ GET และ POST | `[HttpGet]`, `[HttpPost]` | `[HttpPut]`, `[HttpPatch]`, `[HttpDelete]` |
| Update/Delete ต้องใช้ POST + action path | `[HttpPost("{id}/update")]` | `[HttpPut("{id}")]` |
| XML comment | `/// <summary>...</summary>` บน method | ไม่มี XML comment |
| Return type | `ActionResult<ServiceResponse<T>>` หรือ `IActionResult` + `ResponseResult` | return DTO ตรงๆ |
| Controller-level auth | `[Authorize]` บน class | ไม่มี `[Authorize]` |
| Method-level permission | `[ClaimPermission("...")]` | ไม่มี permission attribute บน method ที่ต้อง restrict |

### Category 3: Logging

| กฎ | ถูก | ผิด |
|----|-----|-----|
| GET method | Debug log อย่างน้อย 1 ครั้งเมื่อเข้า method | ไม่มี log เลย |
| POST | Information log เมื่อสำเร็จ | Debug เมื่อสำเร็จ, หรือไม่มี log |
| Log body | Debug | Information หรือสูงกว่า |
| ห้าม log ข้อมูลส่วนบุคคล | Mask ก่อน หรือไม่ log | log เลขบัตร, เบอร์โทร, รหัสผ่านตรงๆ |
| ใช้ ForContext สำหรับ operation ซับซ้อน | `_logger.ForContext("CollationId", Guid.NewGuid())` | log แยกโดยไม่ผูก trace ID |

### Category 4: Service

| กฎ | ถูก | ผิด |
|----|-----|-----|
| Interface คู่กับ Implementation | `IOrderService` + `OrderService` | `OrderService` อย่างเดียว |
| Constructor injection | `private readonly IOrderService _orderService` | new ใน constructor หรือ static call |
| DTO naming | ลงท้าย `Dto`, `RequestDto`, `ResponseDto`, `CreateDto`, `UpdateDto`, `FilterDto`, `TableDto` | `OrderModel`, `OrderData`, `OrderVM` |

### Category 5: AutoMapper

| กฎ | ถูก | ผิด |
|----|-----|-----|
| Query + map | `_dbContext.Orders.ProjectTo<OrderDto>(_mapper.ConfigurationProvider)` | `_dbContext.Orders.ToList()` แล้วค่อย `.Select()` หรือ `_mapper.Map()` |
| ห้ามใช้ `MappingExtension` | `AutoMapperProfile.cs` | `MappingExtension.cs` class |
| Map single object | `_mapper.Map<OrderDto>(entity)` | ยอมรับได้ — แต่ถ้า query หลาย record ต้องใช้ `ProjectTo` |

### Category 6: Authorization

| กฎ | ถูก | ผิด |
|----|-----|-----|
| Controller class | `[Authorize]` | ไม่มี `[Authorize]` (เว้นแต่เป็น public endpoint) |
| Protected method | `[ClaimPermission("permission-name")]` | ไม่มี permission check |
| OAuth Scope/Audience (ถ้า `EnableOAuth: true`) | อ้างอิงค่าจาก `appsettings.json` ของโปรเจคจริง | hardcode scope/audience จาก template หรือโปรเจคอื่น (เช่น `net60_apitemplate_2023` ที่ไม่ตรงกับโปรเจคปัจจุบัน) |

### Category 7: Modifier Order

ลำดับที่ถูกต้อง: `public` → `protected` → `internal` → `private` → `new` → `abstract` → `virtual` → `override` → `sealed` → `static` → `readonly`

ตัวอย่างที่ผิด: `static public readonly` ควรเป็น `public static readonly`

### Category 8: Member Order ใน Class

ลำดับที่ถูกต้อง:
1. Nested types
2. Static fields/properties
3. Instance fields
4. Instance properties
5. Constructors
6. Methods

---

## ขั้นตอนการ Review

### ขั้นตอนที่ 1: กำหนด scope

```
# ระบุว่าจะ review ไฟล์ไหน เช่น:
# - Controllers/OrderController.cs
# - Services/OrderService.cs + IOrderService.cs
# - ทุก .cs ใน project นี้
```

### ขั้นตอนที่ 2: อ่านไฟล์และตรวจตาม Checklist

อ่านทีละไฟล์ ตรวจทุก category ด้านบน บันทึก violations พร้อม line number

### ขั้นตอนที่ 3: สร้างรายงาน

```
## Backend Review Report

### ❌ Violations (ต้องแก้ไข)

| File | Line | Category | ปัญหา | แนวทางแก้ไข |
|------|------|----------|-------|-------------|
| Controllers/OrderController.cs | 23 | Controller | HTTP method ไม่มี Name attribute | เพิ่ม `Name = "GetOrders"` |
| Services/OrderService.cs | 45 | AutoMapper | ใช้ `_mapper.Map()` หลัง `.ToList()` | เปลี่ยนเป็น `ProjectTo<T>()` ก่อน execute |
| Services/OrderService.cs | 12 | Naming | private field `orderName` | เปลี่ยนเป็น `_orderName` |

### ⚠️ Warnings (ควรแก้ไข)

| File | Line | Category | ข้อสังเกต |
|------|------|----------|----------|
| Controllers/OrderController.cs | 15 | Logging | GET method ไม่มี Debug log เมื่อเข้า method |

### ✅ ผ่าน

- Authorization: มี [Authorize] ทุก controller
- DTO naming: ใช้ suffix ถูกต้องทุกตัว
- Interface pattern: มี IService คู่กับ Service ทุกตัว

### สรุป

- Violations: X รายการ ใน Y ไฟล์
- Warnings: X รายการ
- พร้อม refactor ด้วย `ssd-backend-refactor`: ใช่ / ต้องพิจารณา Tier 4 ก่อน
```
