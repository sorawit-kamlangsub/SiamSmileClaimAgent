
# SSD React Form — มาตรฐานการใช้งาน Formik

## บริบท

SSD ใช้ Formik เป็น library หลักสำหรับจัดการ form ใน React โดยมี MUI (Material UI) Components ที่ถูกปรับแต่งให้ใช้งานร่วมกับ Formik แล้วใน Template ที่ `src/app/modules/_common/components/CustomFormik` สามารถใช้ได้เลย และหากต้องสร้าง custom form component ใหม่ต้องปฏิบัติตามรูปแบบที่กำหนด

## กฎหลัก

1. ต้องใช้ Formik สำหรับ form ทุกตัวที่มีการ submit
2. ต้อง declare type ของ form values และ export ออกมาเสมอ
3. ต้องใส่ `enableReinitialize: true` เสมอเมื่อดึงข้อมูลเริ่มต้นจาก API
4. สามารถแยก validate function ออกมาเป็น function ภายนอกได้หาก logic ยาว
5. Custom Formik component ต้องสร้างใน `src/app/modules/components` เพื่อเป็น shared component

## ขั้นตอนการสร้าง Form

### ขั้นตอนที่ 1: กำหนด Type ของ Form Values
```typescript
// SimpleForm.tsx
import React from "react";
import { useFormik, FormikErrors } from "formik";

// ต้อง export type ออกมาเพื่อให้ component อื่นใช้ได้
export type SimpleFormValues = {
    name: string;
    email: string;
};
```

### ขั้นตอนที่ 2: ดึงข้อมูลเริ่มต้นจาก API (ถ้ามี)
```typescript
// ใช้ react-query ในการดึงข้อมูลจาก api
const { data: user } = useGetUser('1');

const initialValues: SimpleFormValues = {
    name: '',
    email: '',
};
```

### ขั้นตอนที่ 3: สร้าง useFormik
```typescript
const formik = useFormik<SimpleFormValues>({
    // กำหนดค่าเริ่มต้น — ถ้าดึงจาก API ให้ใช้ user || initialValues
    initialValues: user || initialValues,
    // ต้องใส่เสมอเมื่อ initialValues มาจาก API
    enableReinitialize: true,
    // validate function
    validate: (values) => {
        const errors: FormikErrors<SimpleFormValues> = {};
        if (!values.name) {
            errors.name = 'กรุณากรอกชื่อ';
        }
        return errors;
    },
    onSubmit: (values) => {
        // ส่งข้อมูล
        console.log(values);
    },
});
```

### ขั้นตอนที่ 4: Render Form
```typescript
return (
    <div>
        <Typography>ชื่อ</Typography>
        <FormikTextField name="name" formik={formik} fullWidth />

        <Typography>Email</Typography>
        <FormikTextField name="email" formik={formik} fullWidth />

        <Button onClick={() => formik.handleSubmit()}>บันทึก</Button>
        <Button onClick={() => formik.handleReset()}>ยกเลิก</Button>
    </div>
);
```

## ตัวอย่าง Validate Function แยกออกมา

เมื่อ validate logic ยาวหรือซับซ้อน ให้แยกเป็น function ภายนอก:

```typescript
const validate = (values: SimpleFormValues) => {
    const errors: FormikErrors<SimpleFormValues> = {};

    if (!values.name) {
        errors.name = 'กรุณากรอกชื่อ';
    } else if (values.name.length > 15) {
        errors.name = 'ชื่อต้องไม่เกิน 15 ตัวอักษร';
    }

    if (!values.email) {
        errors.email = 'กรุณากรอก Email';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'รูปแบบ Email ไม่ถูกต้อง';
    }

    return errors;
};
```

## การปรับแต่ง MUI Component ให้ใช้กับ Formik

กรณีที่ MUI Component ใน Template ไม่ตอบโจทย์ ให้สร้าง custom component ดังนี้:

### ขั้นตอนที่ 1: สร้างใน shared folder
สร้างไฟล์ใหม่ที่ `src/app/modules/components/`

### ขั้นตอนที่ 2: กำหนด Props ที่ต้องรับ
Component ต้องรับ props ต่อไปนี้:
- `name: string` — ชื่อ field ใน Formik
- `formik: FormikProps<T>` — ตัวแปร formik จาก useFormik

### ขั้นตอนที่ 3: รับค่าและส่งค่าด้วย Formik API
```typescript
import { FormikProps } from 'formik';
import { TextField } from '@mui/material';

type CustomTextFieldProps = {
    name: string;
    formik: FormikProps<any>;
    label?: string;
    fullWidth?: boolean;
};

const CustomTextField = ({ name, formik, label, fullWidth }: CustomTextFieldProps) => {
    // รับค่าด้วย getFieldMeta และ getFieldProps
    const fieldProps = formik.getFieldProps(name);
    const { touched, error } = formik.getFieldMeta(name);

    return (
        <TextField
            {...fieldProps}
            // ต้องตั้ง name และ id เพื่อให้ Robot ค้นหาได้
            name={name}
            id={name}
            label={label}
            fullWidth={fullWidth}
            error={touched && Boolean(error)}
            helperText={touched && error}
            onChange={(e) => formik.setFieldValue(name, e.target.value)}
        />
    );
};
```

## MUI Components พร้อมใช้ใน Template

ดู Component ที่ปรับแต่งแล้วได้ที่ `src/app/modules/_common/components/CustomFormik`:
- `FormikTextField` — text input
- `ProvinceSelect` — select จังหวัด
- `EmployeeAutoComplete` — autocomplete พนักงาน
- `InterestCheckboxGroup` — checkbox group
- `GenderRadioGroup` — radio group

ดูตัวอย่างเพิ่มเติมได้ที่ Demo Pos ของ SSD
