
# SSD DB Doctor — ตรวจสุขภาพ Database Schema

## บริบท

ใช้ skill นี้เพื่อ diagnose database schema ว่าตรงตาม SSD Database conventions หรือไม่ ตรวจจาก DDL scripts (.sql), EF Core model files (.cs), หรือ migration files ใน repo ตรวจ standard columns, datetime2, naming conventions, และ stored procedure prefix

---

## กฎหลัก

1. ตรวจจาก DDL scripts (.sql), EF Core models (.cs ที่ map tables), หรือ Alembic migration files ที่มีใน repo
2. ทุก table ต้องมี standard columns ครบ 5 คอลัมน์ — ขาดแม้ 1 ถือเป็น ❌
3. ห้ามใช้ `datetime` — ต้องใช้ `datetime2` เท่านั้น
4. ชื่อ table และ column ต้องเป็น PascalCase เสมอ ไม่มี underscore ไม่ใช้ plural
5. Stored procedure ทุกตัวต้องขึ้นต้นด้วย `usp_`
6. รายงาน ✅ ผ่าน / ❌ พบปัญหา / ⚠️ ไม่แน่ใจ / ⊘ ไม่พบข้อมูล ต่อทุก check พร้อมระบุชื่อ table/column ที่ผิด

---

## Checklist การตรวจสอบ

### Area 1: Standard Columns

ทุก table ต้องมีคอลัมน์เหล่านี้ครบ:

| Column | Type | Constraint | Default |
|--------|------|-----------|---------|
| `IsActive` | `bit` | NOT NULL | `1` |
| `CreatedByUserId` | `int` | NOT NULL | — |
| `CreatedDate` | `datetime2` | NOT NULL | `GETDATE()` |
| `UpdatedByUserId` | `int` | NOT NULL | — |
| `UpdatedDate` | `datetime2` | NOT NULL | `GETDATE()` |

รายงานทุก table ที่ขาด standard column พร้อมระบุว่าขาด column ไหน

### Area 2: Date Column Type

| Check | กฎ |
|-------|-----|
| ห้ามใช้ `datetime` | ทุก date column ต้องเป็น `datetime2` |
| column ชื่อ `Date` suffix | ตรวจว่าเป็น datetime2 |
| column ชื่อ `CreatedDate`, `UpdatedDate` | ต้องเป็น datetime2 เสมอ |

### Area 3: Naming Conventions

**Table names:**

| กฎ | ถูก | ผิด |
|----|-----|-----|
| Singular PascalCase | `Employee`, `OrderHeader` | `employees`, `order_header`, `OrderHeaders` |
| Sub-tables: ต่อท้ายด้วย Header/Detail | `OrderHeader`, `OrderDetail` | `Orders`, `OrderItems` |
| ไม่ใช้ prefix เช่น `tbl_` | `Employee` | `tbl_Employee`, `TBL_Employee` |

**Column names:**

| กฎ | ถูก | ผิด |
|----|-----|-----|
| PascalCase | `EmployeeName`, `OrderDate` | `employee_name`, `orderdate` |
| Primary key | `{Table}Id` (int IDENTITY) | `Id`, `ID`, `PK_Employee` |
| Foreign key | ลงท้ายด้วย `Id` | `EmployeeFK`, `emp_id` |
| Boolean | ขึ้นต้นด้วย `Is` | `Active`, `Deleted`, `Flag` |
| Date | ลงท้ายด้วย `Date` | `created`, `updated_at` |

### Area 4: Stored Procedures

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ขึ้นต้นด้วย `usp_` | `usp_GetEmployeeById` | `sp_GetEmployee`, `proc_GetEmployee`, `GetEmployee` |
| ตามด้วย PascalCase | `usp_CreateOrder` | `usp_create_order`, `usp_CREATEORDER` |

### Area 5: Primary Key Convention

| กฎ | ถูก | ผิด |
|----|-----|-----|
| int IDENTITY(1,1) | `EmployeeId int NOT NULL IDENTITY(1,1)` | `uuid`, `varchar` PK |
| ชื่อ PK | `{Table}Id` | `Id`, `pkEmployee` |

---

## ขั้นตอนการตรวจสอบ

### ขั้นตอนที่ 1: ระบุแหล่งข้อมูล schema

เลือกแหล่งที่มีในโปรเจค:
- DDL scripts: `*.sql` files, `scripts/`, `database/`, `migrations/`
- EF Core models: `Models/*.cs` ที่มี `[Table(...)]` attribute หรือ OnModelCreating
- Alembic migrations: `migrations/versions/*.py`
- ถ้าผู้ใช้ paste DDL โดยตรง ให้ตรวจจาก text นั้น

### ขั้นตอนที่ 2: List ทุก table และ stored procedure

อ่าน DDL/model files และ extract ชื่อ table, columns, stored procedures ทั้งหมด

### ขั้นตอนที่ 3: ออก Health Report

```
## DB Doctor Report — [database/schema name]

### Area 1: Standard Columns
| Table | IsActive | CreatedByUserId | CreatedDate | UpdatedByUserId | UpdatedDate |
|-------|----------|----------------|-------------|----------------|-------------|
| Employee | ✅ | ✅ | ✅ | ✅ | ✅ |
| OrderHeader | ✅ | ❌ ขาด | ✅ | ❌ ขาด | ✅ |

### Area 2: Date Column Types
| Table.Column | Type | Status |
|-------------|------|--------|
| Employee.HireDate | datetime | ❌ ต้องเป็น datetime2 |
| OrderHeader.OrderDate | datetime2 | ✅ |

### Area 3: Naming
| Object | Issue | Status |
|--------|-------|--------|
| Table: employees | plural lowercase | ❌ ควรเป็น Employee |
| Column: emp_id | snake_case | ❌ ควรเป็น EmployeeId |
| Column: active | ไม่มี Is prefix | ⚠️ ควรเป็น IsActive |

### Area 4: Stored Procedures
| SP Name | Status |
|---------|--------|
| usp_GetEmployeeById | ✅ |
| sp_CreateOrder | ❌ ต้อง prefix usp_ |

### สรุป
- ❌ Critical: X รายการ — ต้องแก้ก่อนขึ้น Production
- ⚠️ Warning: X รายการ — ควรแก้
- ✅ ผ่าน: X รายการ
- Tables ที่ต้องแก้: [ชื่อ table]
- แนะนำ: ดู ssd-database สำหรับ DDL template ที่ถูกต้อง
```
