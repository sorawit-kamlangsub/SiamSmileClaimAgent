
# SSD React Component — มาตรฐานการเขียน React Component

## บริบท

การเขียน React component ของ SSD ต้องใช้รูปแบบ functional component ด้วย TypeScript (TSX) และต้องปฏิบัติตาม naming convention ที่กำหนด เพื่อให้โค้ดอ่านง่าย บำรุงรักษาง่าย และสามารถทำ automation test ได้

## กฎหลัก

1. ต้องสร้าง 1 component ต่อ 1 ไฟล์ (ยกเว้น Stateless/Pure components)
2. ต้องใช้ TSX ร่วมกับ React เสมอ ห้ามใช้ `React.createElement`
3. ต้อง declare Props type และ export ออกมาทุกครั้งที่มี Props
4. ชื่อ Props type ต้องตั้งตามรูปแบบ `[ComponentName]Props`
5. ต้องใช้ arrow function สำหรับ event handler
6. ต้องใช้ shorthand fragment `<>...</>` แทน `<React.Fragment>`
7. ต้องใช้ `ref callback` ไม่ใช้ string ref
8. ไฟล์ component ภายใน module ต้องอยู่ใน `<Module>/components/` subfolder เสมอ — ห้ามวางไฟล์ลอยที่ root ของ module
9. ไฟล์ page ภายใน module ต้องอยู่ใน `<Module>/pages/` subfolder เสมอ และทุก module ต้องมี `pages/IndexPage.tsx`
10. ทั้ง `components/` และ `pages/` ต้องมี `index.ts` barrel เป็น named re-export พร้อม prefix ชื่อ module เช่น `export { default as OrderTable } from "./Table"`

## ขั้นตอนการสร้าง Component

### ขั้นตอนที่ 1: ใช้ snippet tsrafce
พิมพ์ `tsrafce` ใน VS Code เพื่อสร้าง template component จาก plugin ES7+ React snippets

### ขั้นตอนที่ 2: ประกาศ Props type
```typescript
// ชื่อ Props type ต้องลงท้ายด้วย Props และขึ้นต้นด้วยชื่อ Component
export type OrderTableProps = {
    orderId: number;
    orderDate: string;
    isActive?: boolean; // optional ใช้ ? แทน | undefined
}
```

### ขั้นตอนที่ 3: เขียน Component
```typescript
// Naming Convention:
// - ชื่อ Component = PascalCase
// - ชื่อ Props type = [ComponentName]Props
// - ลงท้ายด้วย Props เสมอ
export type OrderTableProps = {
    title: string;
    onSubmit?: () => void;
}

const OrderTable = ({ title, onSubmit }: OrderTableProps) => {
    return (
        <div>
            <h1>{title}</h1>
        </div>
    );
};

export default OrderTable;
```

## มาตรฐาน Props

### ตั้งชื่อ Props ด้วย camelCase
```typescript
// ไม่ดี
<Foo UserName="hello" phone_number={12345678} />

// ดี
<Foo userName="hello" phoneNumber={12345678} />
```

### Props ที่เป็น boolean ไม่ต้องระบุค่า true
```typescript
// ไม่ดี
<Foo hidden={true} />

// ดี
<Foo hidden />
```

### ห้ามใช้ index เป็น key ใน map
```typescript
// ไม่ดี
{todos.map((todo, index) => <Todo {...todo} key={index} />)}

// ดี
{todos.map((todo) => <Todo {...todo} key={todo.id} />)}
```

### ห้ามใช้ DOM props เป็นชื่อ props
```typescript
// ไม่ดี
<MyComponent style="fancy" />
<MyComponent className="fancy" />

// ดี
<MyComponent variant="fancy" />
```

## มาตรฐาน Method และ Event Handler

ใช้ arrow function เสมอ โดยเฉพาะเมื่อต้องส่งข้อมูลเพิ่มเติม:

```typescript
const ItemList = ({ items }: ItemListProps) => {
    const doSomethingWith = (
        event: React.MouseEvent,
        name: string,
        index: number
    ) => {
        // do something
    };

    return (
        <ul>
            {items.map((item, index) => (
                <Item
                    key={item.key}
                    onClick={(event) => {
                        doSomethingWith(event, item.name, index);
                    }}
                />
            ))}
        </ul>
    );
};
```

## มาตรฐาน Refs

```typescript
// ไม่ดี
<Foo ref="myRef" />

// ดี
<Foo ref={myRef} />
```

## มาตรฐาน Fragment

```typescript
// ไม่ดี
return (
    <React.Fragment>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
    </React.Fragment>
);

// ดี
return (
    <>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
    </>
);
```

## มาตรฐาน Import

```typescript
// ชื่อ component ต้องใช้ PascalCase เมื่อ import
// ไม่ดี
import reservationCard from "./ReservationCard";

// ดี
import ReservationCard from "./ReservationCard";

// component หลักของ folder ให้ import จากชื่อ folder
// ไม่ดี
import Footer from "./Footer/Footer";
// ไม่ดี
import Footer from "./Footer/index";

// ดี
import Footer from "./Footer";
```

## หลักการตั้งชื่อ Component, Page, Module

### Module
- ขึ้นต้นด้วยตัวใหญ่ PascalCase
- ไม่เกิน 3 คำ

### Component
- ขึ้นต้นด้วยตัวใหญ่ PascalCase
- ไม่เกิน 3 คำ
- Custom hook แยกไฟล์และตั้งชื่อด้วย `.hook.tsx`
- Naming suffixes: `Container`, `View`, `Card`, `Form`, `Table`, `List`, `Item`
- Formik components: ลงท้ายด้วยชื่อ MUI component เช่น `ProvinceSelect`, `GenderRadioGroup`

### Page
- ขึ้นต้นด้วยตัวใหญ่, ลงท้ายด้วย `Page`
- ไม่เกิน 3 คำ
- หน้าแรกของ module ต้องชื่อ `IndexPage`
- ทุก module ต้องมี `IndexPage`

## โครงสร้างไฟล์ภายใน Module + Barrel Export

ไฟล์ component และ page ต้องแยกอยู่ใน subfolder ของตัวเอง พร้อม `index.ts` barrel — ห้ามวางไฟล์ลอยที่ root ของ module:

```
src/app/modules/Order/
├── components/
│   ├── Table.tsx
│   ├── Form.tsx
│   └── index.ts
├── pages/
│   ├── IndexPage.tsx
│   ├── DetailPage.tsx
│   └── index.ts
└── orderSlice.ts
```

```typescript
// components/index.ts — named re-export พร้อม prefix ชื่อ module
export { default as OrderTable } from "./Table";
export { default as OrderForm } from "./Form";

// pages/index.ts
export { default as OrderPage } from "./IndexPage";
export { default as OrderDetailPage } from "./DetailPage";
```

## การตรวจสอบสิทธิ์ใน Component

```typescript
import { PermissionList } from "/src/Const";
import { checkPermissions, useAuth } from "/src/app/modules/_auth";

const { permissions } = useAuth();

// เช็ค permission (default condition เป็น "OR")
const hasPermission: boolean = checkPermissions(
    permissions,
    [
        PermissionList.employee_read,
        PermissionList.employee_write,
    ],
    "AND" // หรือ "OR"
);
```

### ดึงข้อมูล User
```typescript
import { useAuth } from "/src/app/modules/_auth";

const { user, userProfile, isAuthenticated, permissions, roles } = useAuth();

// ใช้ข้อมูลจาก userProfile
// userProfile.userId, userProfile.userName, userProfile.email
// userProfile.employeeId, userProfile.employeeCode, userProfile.fullName
// userProfile.branchId, userProfile.departmentId, userProfile.teamId, userProfile.positionId
```
