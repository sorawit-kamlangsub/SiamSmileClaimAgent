
# SSD Backend Refactor — แก้ไข Code C#/.NET อย่างปลอดภัย

## บริบท

Refactor ที่ไม่ระวังทำให้ `dotnet build` พัง หรือเปลี่ยน API behavior ได้ skill นี้แบ่งการแก้ไขเป็น 4 Tiers ตามความเสี่ยง และบังคับ verify หลังทุกไฟล์เพื่อให้มั่นใจว่า code ยังทำงานได้

---

## Safety Tiers — ระดับความเสี่ยงการแก้ไข

| Tier | ประเภทการแก้ไข | Action |
|------|---------------|--------|
| **1 — ปลอดภัยเสมอ** | XML comments, log messages, whitespace, modifier order, member order ใน class | แก้ได้เลย ไม่ต้อง build check |
| **2 — ปลอดภัยหลัง build** | Private `_camelCase` field rename, local variable rename, unused `using`, เพิ่ม Debug/Information log | แก้แล้ว `dotnet build` ทุกครั้ง |
| **3 — ตรวจ usages ก่อน** | DTO property rename, service interface method signature, internal method rename | `grep` หา usages ก่อน แล้วแก้ทุกที่พร้อมกัน |
| **4 — ห้ามแก้** | Controller route path, public API method signature, DB column name, Redux-consumed response shape | skip — บันทึกใน report แจ้ง user |

---

## กฎหลัก

1. แก้ไขทีละ 1 ไฟล์เสมอ — ห้าม batch หลายไฟล์พร้อมกัน
2. Tier 2 ขึ้นไปต้องรัน `dotnet build` หลังทุกไฟล์
3. ถ้า build error → revert ไฟล์นั้นกลับ + บันทึกว่า skip + ไปไฟล์ถัดไป
4. ห้ามเปลี่ยน logic, เปลี่ยนแค่ style/naming/structure
5. Tier 4 ห้ามแก้ไม่ว่าในกรณีใด — ต้อง report ให้ user ตัดสินใจเอง
6. ถ้าไม่มี violation report จาก `ssd-backend-review` ให้ review ก่อนเสมอ

---

## ขั้นตอนการ Refactor

### ขั้นตอนที่ 1: เตรียม violation list และระบุ PROJECT

```bash
# ยืนยัน workspace และ PROJECT
ls *.sln
ls */*.csproj
PROJECT=<ชื่อโฟลเดอร์ที่มี .csproj>
```

รับ report จาก `ssd-backend-review` แล้วจัดเรียงตาม Tier:
- Tier 1 ก่อน → Tier 2 → Tier 3
- Tier 4: แยกออกไป รายงาน user

### ขั้นตอนที่ 2: แก้ไขทีละไฟล์

```
สำหรับแต่ละไฟล์ที่มี violation:

1. อ่านไฟล์
2. แก้ไข violations ตาม Tier (Tier 1 ก่อน)
3. ถ้ามี Tier 2+ → รัน verify ด้านล่าง
4. บันทึกผลลัพธ์
5. ไปไฟล์ถัดไป
```

### ขั้นตอนที่ 3: Verify หลังแต่ละไฟล์ (Tier 2+)

```bash
dotnet build $PROJECT/$PROJECT.csproj
```

ถ้า error → revert file:
```bash
git checkout -- <file-path>
```

### ขั้นตอนที่ 4: สรุปผล

```
## Backend Refactor Report

### ✅ แก้ไขสำเร็จ
| File | Violations ที่แก้ |
|------|-----------------|
| Controllers/OrderController.cs | เพิ่ม XML comment, เพิ่ม Name attribute ใน HttpGet |
| Services/OrderService.cs | private field `orderName` → `_orderName`, เปลี่ยน Map() เป็น ProjectTo() |

### ⏭️ Skip (Tier 4 — ต้องการ user decision)
| File | Line | ปัญหา | เหตุผลที่ skip |
|------|------|-------|--------------|
| Controllers/OrderController.cs | 15 | Route `api/OrderHeader` ควรเป็น `api/order-header` | เปลี่ยน route อาจทำให้ frontend หรือ client อื่นพัง |

### ❌ Skip (build error หลัง edit)
| File | ปัญหา |
|------|-------|
| Services/OrderService.cs | เปลี่ยน DTO property แล้ว build error — revert แล้ว |

### สรุป
- แก้ไขสำเร็จ: X violations ใน Y ไฟล์
- Skip (Tier 4): Z รายการ — รอ user ตัดสินใจ
- Skip (error): W รายการ — แนะนำตรวจด้วยตนเอง
```

---

## ตัวอย่างการแก้ไขที่พบบ่อย

### Tier 1: XML Comment

```csharp
// ก่อน
[HttpGet(Name = "GetOrders")]
public async Task<ActionResult<ServiceResponse<List<OrderDto>>>> GetOrders()

// หลัง
/// <summary>
/// ดึงรายการ Order ทั้งหมด
/// </summary>
[HttpGet(Name = "GetOrders")]
public async Task<ActionResult<ServiceResponse<List<OrderDto>>>> GetOrders()
```

### Tier 1: Modifier Order

```csharp
// ก่อน
static public readonly string _apiName = "OrderAPI";

// หลัง
public static readonly string _apiName = "OrderAPI";
```

### Tier 1: เพิ่ม HTTP method Name attribute

```csharp
// ก่อน
[HttpGet]
public async Task<IActionResult> GetOrders()

// หลัง
[HttpGet(Name = "GetOrders")]
public async Task<IActionResult> GetOrders()
```

### Tier 2: Private Field Rename

```csharp
// ก่อน
private readonly IOrderService orderService;
public OrderController(IOrderService orderService)
{
    this.orderService = orderService;
}

// หลัง
private readonly IOrderService _orderService;
public OrderController(IOrderService orderService)
{
    _orderService = orderService;
}
```

### Tier 2: เพิ่ม Logging

```csharp
// ก่อน — GET method ไม่มี log
public async Task<IActionResult> GetOrders()
{
    var result = await _orderService.GetAllAsync();
    return Ok(ResponseResult.Success(result));
}

// หลัง
public async Task<IActionResult> GetOrders()
{
    _logger.Debug("[{ControllerName}] GetOrders", _controllerName);
    var result = await _orderService.GetAllAsync();
    _logger.Debug("[{ControllerName}] GetOrders result: {@Result}", _controllerName, result);
    return Ok(ResponseResult.Success(result));
}
```

### Tier 2: Map() → ProjectTo()

```csharp
// ก่อน — โหลดทุก entity ก่อนแล้วค่อย map (ช้า)
var orders = await _dbContext.Orders.ToListAsync();
return _mapper.Map<List<OrderDto>>(orders);

// หลัง — map ใน query (เร็วกว่า ดึงเฉพาะ column ที่ต้องการ)
return await _dbContext.Orders
    .ProjectTo<OrderDto>(_mapper.ConfigurationProvider)
    .ToListAsync();
```

### Tier 3: DTO Property Rename (ต้อง grep ก่อน)

```bash
# ขั้นตอน:
# 1. grep หา usages ก่อน
grep -r "OrderName" --include="*.cs" .

# 2. ถ้าพบหลายที่ — แก้ทุกที่พร้อมกัน
# 3. รัน build ตรวจสอบ
dotnet build $PROJECT/$PROJECT.csproj
```
