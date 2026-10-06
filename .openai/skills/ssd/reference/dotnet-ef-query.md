
# SSD dotnet-ef-query — EF Core Query Patterns สำหรับ Service Layer

## บริบท

ใช้ skill นี้เมื่อเขียน Service method ที่ query ข้อมูลจาก `AppDbContext` (หรือ `{DbContextClass}` ที่ Reverse Engineer ไว้) — ครอบคลุม AsNoTracking, Include, pagination, transaction, และ async patterns ที่ SSD ใช้จริง ทุก pattern ใน skill นี้ใช้กับโปรเจคที่ทำ **EF Core Reverse Engineer แล้วเท่านั้น** (ดู `backend-setup.md`)

---

## กฎหลัก

1. Query ที่ **ไม่ได้ update/delete** ต้องใช้ `AsNoTracking()` เสมอ — ลด overhead ของ change tracker
2. โหลด navigation property ด้วย `Include()` เท่านั้น — ห้ามโหลดแยกแล้ว join ใน memory
3. Pagination ต้องใช้ `Skip`/`Take` บน `IQueryable` ก่อน `.ToListAsync()` — ห้าม load all แล้ว slice ใน C#
4. ทุก DB operation ต้องเป็น `async` (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`) — ห้ามใช้ sync version
5. Multiple `SaveChangesAsync()` ที่ต้อง atomic ต้องใช้ Transaction (`BeginTransactionAsync`)
6. ห้ามใช้ raw SQL (`FromSqlRaw`, `ExecuteSqlRaw`) ยกเว้น Stored Procedure เท่านั้น

---

## Pattern 1: Read-Only Query (AsNoTracking)

ใช้กับ method ที่ return ข้อมูลโดยไม่ update — **ทุก GetAll / GetById / filter query**

```csharp
// ✅ ถูก — AsNoTracking สำหรับ read-only
var items = await _context.Employee
    .AsNoTracking()
    .Where(e => e.IsActive)
    .ToListAsync();

// ❌ ผิด — ไม่มี AsNoTracking ทำให้ EF track ทุก entity โดยไม่จำเป็น
var items = await _context.Employee
    .Where(e => e.IsActive)
    .ToListAsync();
```

---

## Pattern 2: Eager Loading ด้วย Include

โหลด navigation property ที่ต้องการพร้อมกันใน query เดียว — หลีกเลี่ยง N+1

```csharp
// ✅ ถูก — eager load Department พร้อมกัน
var employees = await _context.Employee
    .AsNoTracking()
    .Include(e => e.Department)              // navigation property จาก Reverse Engineer
    .ThenInclude(d => d.Location)            // nested include
    .Where(e => e.IsActive)
    .ToListAsync();

// ❌ ผิด — N+1: loop แล้ว load Department ทีละตัว
var employees = await _context.Employee.AsNoTracking().ToListAsync();
foreach (var e in employees)
{
    e.Department = await _context.Department.FindAsync(e.DepartmentId); // N queries!
}
```

**เมื่อใช้ Include:**
- ใช้เฉพาะ navigation property ที่ Reverse Engineer สร้างไว้จริงใน Model
- ถ้าไม่มี navigation property ใน Model แต่ต้องการ join ให้ใช้ LINQ join แทน (ดู Pattern 5)

---

## Pattern 3: Pagination (ตรง SSD Standard)

SSD Stored Procedure ใช้ `@IndexStart` + `@PageSize` — ใช้ pattern เดียวกันใน LINQ:

```csharp
// FilterDto สำหรับ pagination (ตาม SSD standard)
public class EmployeeFilterDto
{
    public int IndexStart { get; set; } = 0
    public int PageSize   { get; set; } = 20    // ค่า 10-50 ตาม SP standard
    public string? SortField   { get; set; }
    public string? OrderType   { get; set; }    // "asc" / "desc"
    public string? SearchDetail { get; set; }
}

// Service method
public async Task<ServiceResponse<List<EmployeeTableDto>>> GetAllAsync(EmployeeFilterDto filter)
{
    var query = _context.Employee
        .AsNoTracking()
        .Where(e => e.IsActive);

    // Search
    if (!string.IsNullOrEmpty(filter.SearchDetail))
        query = query.Where(e => e.EmployeeName.Contains(filter.SearchDetail));

    // TotalCount ก่อน paginate
    var totalCount = await query.CountAsync();

    // Sort
    query = filter.SortField switch
    {
        "EmployeeName" => filter.OrderType == "desc"
            ? query.OrderByDescending(e => e.EmployeeName)
            : query.OrderBy(e => e.EmployeeName),
        _ => query.OrderBy(e => e.EmployeeId)
    };

    // Paginate — Skip/Take บน IQueryable (ไม่ใช่ใน memory)
    var items = await query
        .Skip(filter.IndexStart)
        .Take(filter.PageSize)
        .Select(e => new EmployeeTableDto
        {
            EmployeeId   = e.EmployeeId,
            EmployeeName = e.EmployeeName,
            TotalCount   = totalCount   // ส่งกลับไปด้วยตาม SSD SP pattern
        })
        .ToListAsync();

    return new ServiceResponse<List<EmployeeTableDto>> { IsSuccess = true, Data = items };
}
```

---

## Pattern 4: Projection ด้วย Select

ดึงเฉพาะ field ที่ต้องการ — ลด data transfer และ memory

```csharp
// ✅ ถูก — Select เฉพาะ field ที่ใช้จริง
var names = await _context.Employee
    .AsNoTracking()
    .Where(e => e.IsActive)
    .Select(e => new { e.EmployeeId, e.EmployeeName })
    .ToListAsync();

// ❌ ผิด — ดึงทุก column แล้ว map ทีหลัง
var all = await _context.Employee.AsNoTracking().ToListAsync();
var names = all.Select(e => new { e.EmployeeId, e.EmployeeName });
```

---

## Pattern 5: LINQ Join (เมื่อไม่มี Navigation Property)

ใช้เมื่อ Reverse Engineer ไม่มี navigation property ระหว่าง 2 table (ไม่มี FK จริงใน DB):

```csharp
var result = await (
    from emp in _context.Employee.AsNoTracking()
    join dep in _context.Department.AsNoTracking()
        on emp.DepartmentId equals dep.DepartmentId
    where emp.IsActive
    select new EmployeeResponseDto
    {
        EmployeeId     = emp.EmployeeId,
        EmployeeName   = emp.EmployeeName,
        DepartmentName = dep.DepartmentName
    }
).ToListAsync();
```

---

## Pattern 6: Create / Update / Delete

Change tracking ใช้ได้เฉพาะ insert/update/delete — **ห้ามใช้ AsNoTracking**

```csharp
// Create
public async Task<ServiceResponse<bool>> CreateAsync(EmployeeRequestDto dto)
{
    var entity = _mapper.Map<Employee>(dto);
    entity.IsActive        = true;
    entity.CreatedDate     = DateTime.Now;
    entity.CreatedByUserId = _currentUserId;
    entity.UpdatedDate     = DateTime.Now;
    entity.UpdatedByUserId = _currentUserId;

    _context.Employee.Add(entity);
    await _context.SaveChangesAsync();

    return new ServiceResponse<bool> { IsSuccess = true, Data = true };
}

// Update — Find ใช้ tracking (ไม่ใส่ AsNoTracking)
public async Task<ServiceResponse<bool>> UpdateAsync(int id, EmployeeRequestDto dto)
{
    var entity = await _context.Employee.FindAsync(id);
    if (entity == null)
        return new ServiceResponse<bool> { IsSuccess = false, Message = "Not found" };

    _mapper.Map(dto, entity);
    entity.UpdatedDate     = DateTime.Now;
    entity.UpdatedByUserId = _currentUserId;

    await _context.SaveChangesAsync();
    return new ServiceResponse<bool> { IsSuccess = true, Data = true };
}

// Soft Delete (SSD ใช้ IsActive flag ไม่ลบจริง)
public async Task<ServiceResponse<bool>> DeleteAsync(int id)
{
    var entity = await _context.Employee.FindAsync(id);
    if (entity == null)
        return new ServiceResponse<bool> { IsSuccess = false, Message = "Not found" };

    entity.IsActive        = false;
    entity.UpdatedDate     = DateTime.Now;
    entity.UpdatedByUserId = _currentUserId;

    await _context.SaveChangesAsync();
    return new ServiceResponse<bool> { IsSuccess = true, Data = true };
}
```

---

## Pattern 7: Transaction (หลาย SaveChanges ที่ต้อง Atomic)

```csharp
public async Task<ServiceResponse<bool>> CreateOrderWithDetailsAsync(
    OrderRequestDto dto,
    List<OrderDetailRequestDto> details)
{
    await using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        var order = _mapper.Map<OrderHeader>(dto);
        _context.OrderHeader.Add(order);
        await _context.SaveChangesAsync();   // ได้ OrderHeaderId

        var orderDetails = details.Select(d =>
        {
            var detail = _mapper.Map<OrderDetail>(d);
            detail.OrderHeaderId = order.OrderHeaderId;
            return detail;
        }).ToList();

        _context.OrderDetail.AddRange(orderDetails);
        await _context.SaveChangesAsync();

        await transaction.CommitAsync();
        return new ServiceResponse<bool> { IsSuccess = true, Data = true };
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        _logger.Error(ex, "CreateOrderWithDetailsAsync failed");
        return new ServiceResponse<bool> { IsSuccess = false, Message = ex.Message };
    }
}
```

---

## Pattern 8: Stored Procedure (กรณีพิเศษ)

ใช้ SP เฉพาะเมื่อ business logic ซับซ้อนและอยู่ใน DB อยู่แล้ว:

```csharp
// SP ที่มี output columns ตาม SSD standard (IsResult, Result, Msg + TotalCount)
var result = await _context.Set<usp_GetEmployeeById>()
    .FromSqlRaw("EXEC usp_GetEmployeeById @EmployeeId = {0}", id)
    .AsNoTracking()
    .ToListAsync();
```

Model ของ SP ต้องอยู่ใน `Models/Partial/` (สร้างมือ ไม่ถูก Reverse Engineer ทับ — ดู `database.md`)
