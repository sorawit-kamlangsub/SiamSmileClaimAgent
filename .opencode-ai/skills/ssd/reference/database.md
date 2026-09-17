
# SSD Database — มาตรฐานการตั้งชื่อ Database และ EF Core

## บริบท

SSD ใช้ SQL Server 2019+ เป็น database และ Entity Framework Core 6 สำหรับ ORM ทุก database object ต้องตั้งชื่อตาม standard ที่กำหนด เพื่อให้สอดคล้องกับการใช้ EF Core Reverse Engineer

## กฎหลัก

1. ชื่อ database object ทุกชนิดต้องใช้ `PascalCase`
2. ใช้คำภาษาอังกฤษเต็ม ห้ามย่อ ยกเว้นคำย่อที่รู้จักกันดี เช่น `Id`, `Ftp`, `Dcr`
3. Columns ประเภทวันที่ต้องใช้ `datetime2` เท่านั้น ห้ามใช้ `datetime`
4. ทุก table ต้องมี standard columns: `IsActive`, `CreatedByUserId`, `CreatedDate`, `UpdatedByUserId`, `UpdatedDate`
5. ก่อนขึ้น Production หากมีการเปลี่ยนแปลงโครงสร้าง DBA ต้องมี Migration Script

## หลักการการตั้งชื่อทั่วไป (Microsoft Standard)

| ประเภท | หลักการ | ตัวอย่างที่ดี | ตัวอย่างที่ไม่ดี |
|--------|---------|--------------|----------------|
| Table, Column | PascalCase | `EmployeeName`, `UserId` | `EmpName`, `UsrId` |
| ตัวย่อ | คำย่อที่รู้จัก | `Id`, `Ftp`, `Dcr` | คำย่อที่คิดเอง |

## หลักการการตั้งชื่อของ SSD

### Table

- ชื่อ table ใช้คำนามเอกพจน์
- ตัวอย่าง: `Employee`, `Order`, `Product`
- หากมีตารางย่อย ให้ต่อท้ายด้วย `Header` และ `Detail`
  - `OrderHeader` — ข้อมูลหัว order
  - `OrderDetail` — รายการสินค้าใน order

### Column

| รูปแบบ | ตัวอย่าง | หมายเหตุ |
|--------|----------|----------|
| Id column | `EmployeeId`, `OrderId` | นำหน้าด้วยชื่อ table |
| Name column | `EmployeeName`, `ProductName` | นำหน้าด้วยชื่อ table |
| Date column | `CreatedDate`, `UpdatedDate` | ต้องใช้ `datetime2` |
| Boolean column | `IsActive`, `IsDeleted` | ขึ้นต้นด้วย `Is` |
| Foreign key | `CreatedByUserId`, `AgentId` | ลงท้ายด้วย `Id` |

### Standard Columns ที่ต้องมีในทุก table

```sql
IsActive          bit           NOT NULL  DEFAULT 1
CreatedByUserId   int           NOT NULL
CreatedDate       datetime2     NOT NULL  DEFAULT GETDATE()
UpdatedByUserId   int           NOT NULL
UpdatedDate       datetime2     NOT NULL  DEFAULT GETDATE()
```

### Stored Procedure

- นำหน้าด้วย `usp_` ตามด้วยชื่อแบบ PascalCase
- ตัวอย่าง: `usp_GetEmployeeById`, `usp_CreateOrder`

**Columns ที่ควร Return เมื่อไม่มีข้อมูลส่งออก:**
```sql
IsResult    bit       -- 1 = สำเร็จ / 0 = ไม่สำเร็จ
Result      nvarchar  -- SUCCESS | FAIL | ค่าที่ return
Msg         nvarchar  -- ข้อความตอบกลับ
```

**Input Parameters สำหรับ Pagination:**
```sql
@IndexStart   int
@PageSize     int       -- ค่า 10-50
@SortField    nvarchar
@OrderType    nvarchar
@SearchDetail nvarchar
```

**Result Column สำหรับ Pagination:**
```sql
TotalCount   int
```

## EF Core Model มาตรฐาน

หลังจาก Reverse Engineer ดู [ssd-backend-setup] สำหรับขั้นตอนการ Reverse Engineer

### Partial Class สำหรับ Relationship

เมื่อต้องเพิ่ม relationship ที่ไม่มีใน database:

```csharp
// Models/Partial/Employee.cs
namespace MyProject.Models
{
    public partial class Employee
    {
        public virtual ICollection<Order> Orders { get; set; }
        public virtual Department Department { get; set; }
    }
}
```

```csharp
// Data/Partial/AppDbContext.cs
namespace MyProject.Data
{
    public partial class AppDbContext
    {
        partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasMany(e => e.Orders)
                    .WithOne(e => e.Employee)
                    .HasForeignKey(e => e.EmployeeId);

                entity.HasOne(e => e.Department)
                    .WithMany(d => d.Employees)
                    .HasForeignKey(e => e.DepartmentId);
            });
        }
    }
}
```

### Partial Class สำหรับ Stored Procedure Model

เมื่อ Reverse Engineer ไม่สามารถสร้าง model ของ Stored Procedure ได้:

```csharp
// Models/Partial/usp_AgentSummary.cs
namespace MyProject.Models
{
    public partial class usp_AgentSummary
    {
        public string AgentName { get; set; }
        public int TotalCalls { get; set; }
        public decimal SuccessRate { get; set; }
    }
}
```

## ตัวอย่าง DDL ที่ดี

```sql
CREATE TABLE Employee (
    EmployeeId          int             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    EmployeeCode        nvarchar(20)    NOT NULL,
    EmployeeName        nvarchar(200)   NOT NULL,
    DepartmentId        int             NOT NULL,
    PositionId          int             NOT NULL,
    HireDate            datetime2       NOT NULL,
    IsActive            bit             NOT NULL DEFAULT 1,
    CreatedByUserId     int             NOT NULL,
    CreatedDate         datetime2       NOT NULL DEFAULT GETDATE(),
    UpdatedByUserId     int             NOT NULL,
    UpdatedDate         datetime2       NOT NULL DEFAULT GETDATE()
);

CREATE TABLE OrderHeader (
    OrderHeaderId       int             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    OrderHeaderNo       nvarchar(50)    NOT NULL,
    CustomerId          int             NOT NULL,
    OrderDate           datetime2       NOT NULL,
    IsActive            bit             NOT NULL DEFAULT 1,
    CreatedByUserId     int             NOT NULL,
    CreatedDate         datetime2       NOT NULL DEFAULT GETDATE(),
    UpdatedByUserId     int             NOT NULL,
    UpdatedDate         datetime2       NOT NULL DEFAULT GETDATE()
);

CREATE TABLE OrderDetail (
    OrderDetailId       int             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    OrderHeaderId       int             NOT NULL,
    ProductId           int             NOT NULL,
    Quantity            int             NOT NULL,
    UnitPrice           decimal(18,2)   NOT NULL,
    IsActive            bit             NOT NULL DEFAULT 1,
    CreatedByUserId     int             NOT NULL,
    CreatedDate         datetime2       NOT NULL DEFAULT GETDATE(),
    UpdatedByUserId     int             NOT NULL,
    UpdatedDate         datetime2       NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (OrderHeaderId) REFERENCES OrderHeader(OrderHeaderId)
);
```
