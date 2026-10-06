---
name: ssd-react-state
description: ใช้ skill นี้เมื่อใช้งาน Redux ใน React, สร้าง slice, ตั้งค่า rootReducer, หรือ dispatch/subscribe state ใน component ตามมาตรฐาน SSD
version: 1.0.0
---

# SSD React State — มาตรฐานการใช้งาน Redux

## บริบท

SSD ใช้ Redux Toolkit สำหรับ global state management ใน React ทุก module ที่มี global state ต้องสร้าง slice ของตัวเอง และเพิ่มเข้า rootReducer ที่ `src/redux/rootReducer.ts`

## หลักการทำงานของ Redux

Redux ทำงานผ่าน 3 ส่วนหลัก:
1. **Store** — ที่เก็บข้อมูล state ทั้งหมด
2. **Action** — คำสั่งพร้อม payload ที่ส่งให้ reducer เปลี่ยน state
3. **Reducer** — กระบวนการเปลี่ยน state ตาม action

Component ทำงานกับ Redux ด้วย:
- **Subscribe** (`useAppSelector`) — รับค่า state จาก store
- **Dispatch** (`useAppDispatch`) — ส่ง action ไปยัง reducer

## กฎหลัก

1. ต้องสร้าง slice ใน `src/app/modules/[ModuleName]/[moduleName]Slice.ts`
2. ต้อง export type ของ State และ Payload ทุกครั้ง
3. ต้อง export `actions`, `reducer`, และอาจ export `selector`
4. ต้องเพิ่ม reducer เข้า rootReducer ใน `src/redux/rootReducer.ts`
5. ต้องใช้ `useAppSelector` และ `useAppDispatch` จาก `src/redux/hook.ts` เท่านั้น

## ขั้นตอนที่ 1: สร้าง Slice

สร้างไฟล์ที่ `src/app/modules/[ModuleName]/[moduleName]Slice.ts`

```typescript
// src/app/modules/counter/counterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. สร้าง Type ของ State (ต้องทำ)
export type CounterState = {
    count: number;
    settings: {
        showCount: boolean;
    };
};

// 2. กำหนดค่าเริ่มต้น (ต้องทำ)
const initialState: CounterState = {
    count: 0,
    settings: {
        showCount: true,
    },
};

// 3. สร้าง Type ของ Payload สำหรับ action ที่มีหลายตัวแปร (ควรทำ)
// ตั้งชื่อตาม Action และลงท้ายด้วย Payload
export type SetShowCountPayload = {
    count: number;
    showCount: boolean;
};

// 4. สร้าง Slice (ต้องทำ)
const counterSlice = createSlice({
    name: "counter", // ชื่อ slice ควรเป็นชื่อ Module
    initialState,
    reducers: {
        setCount: (state, action: PayloadAction<number>) => {
            state.count = action.payload;
        },
        setShowCount: (state, action: PayloadAction<SetShowCountPayload>) => {
            state.count = action.payload.count;
            state.settings.showCount = action.payload.showCount;
        },
    },
});

// 5. Export actions (ต้องทำ)
export const { setCount, setShowCount } = counterSlice.actions;

// 6. Export selector (ไม่จำเป็น แต่แนะนำ)
export const countSelector = (state: RootState) => state.counter;

// 7. Export reducer (ต้องทำ)
export default counterSlice.reducer;
```

### หากมีหลาย slice ใน module เดียว
ตั้งชื่อแบบ `[moduleName][SubModule]Slice.ts` เช่น `orderDetailSlice.ts`, `orderListSlice.ts`

## ขั้นตอนที่ 2: เพิ่มเข้า rootReducer

แก้ไฟล์ `src/redux/rootReducer.ts`:

```typescript
import { counterSlice } from "../app/modules/counter/counterSlice";
import { combineReducers } from "@reduxjs/toolkit";

export const rootReducer = combineReducers({
    layout: persistReducer(persistConfig, layoutSlice),
    counter: counterSlice, // เพิ่ม slice ใหม่ที่นี่
});
```

## ขั้นตอนที่ 3: ใช้งานใน Component

```typescript
import { useAppSelector, useAppDispatch } from "../../redux/hook";
import { setCount, setShowCount, countSelector } from "./counterSlice";

export const CounterComponent = () => {
    // Subscribe ค่าจาก Redux
    const { count, settings } = useAppSelector(countSelector);
    // หรือ: const { count } = useAppSelector(state => state.counter);

    // เรียกใช้ dispatch
    const dispatch = useAppDispatch();

    const handleIncrement = () => {
        // dispatch action ที่มี payload เดียว
        dispatch(setCount(count + 1));
    };

    const handleToggleShow = () => {
        // dispatch action ที่ payload เป็น object
        dispatch(setShowCount({
            count: count,
            showCount: !settings.showCount,
        }));
    };

    return (
        <div>
            <h1>Count: {count}</h1>
            <button onClick={handleIncrement}>เพิ่ม</button>
            <button onClick={handleToggleShow}>
                {settings.showCount ? "ซ่อน" : "แสดง"}
            </button>
        </div>
    );
};
```

## โครงสร้างไฟล์ Redux

```
src/
├── redux/
│   ├── rootReducer.ts  # รวม reducer ทั้งหมด
│   └── hook.ts         # useAppSelector, useAppDispatch
└── app/modules/
    └── [ModuleName]/
        └── [moduleName]Slice.ts  # slice ของแต่ละ module
```