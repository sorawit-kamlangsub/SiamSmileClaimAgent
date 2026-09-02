
# SSD React API — มาตรฐานการเรียก API ด้วย Axios และ React Query

## บริบท

SSD ใช้ Axios สำหรับ HTTP request และ TanStack React Query สำหรับ server state management ทุกไฟล์ที่เกี่ยวกับ API ต้องเก็บใน `src/app/api/` โดยมี 2 วิธีสร้าง API client: ใช้ NSwag (แนะนำ) หรือเขียนเอง

## กฎหลัก

1. ไฟล์ NSwag generated (`.client.ts`) เก็บที่ root ของ `src/app/api/` — ไฟล์ wrapper (`.api.ts`) และ React Query hooks (`.query.ts`) เก็บใน `src/app/api/query/`
2. **ต้องรัน `npm run codegen` ด้วยตัวเอง (ใช้ Bash) ก่อนเขียน client เสมอ** — ห้ามข้ามไปเขียน client function เอง เว้นแต่ codegen ล้มเหลวจริง (ไม่มี swagger endpoint, build ล้มเหลว) และต้องแจ้งผู้ใช้ก่อนว่าทำไมถึง fallback
3. ไฟล์ React Query hooks ตั้งชื่อตาม Controller และลงท้ายด้วย `.query.ts`
4. ต้องประกาศ `queryKeys` เป็น object สำหรับทุก query ไฟล์
5. ต้องจัดการ error response จาก API เสมอ (`isSuccess` check)
6. **ห้ามเรียก `axios.put`, `axios.patch`, `axios.delete`** — มาตรฐานบริษัทใช้ REST API (ไม่ใช่ RESTful) คือมีแค่ `GET` กับ `POST` เท่านั้น การ update/delete ให้ใช้ `axios.post` พร้อม action suffix ต่อท้าย URL เช่น `/order/{id}/update`, `/order/{id}/delete`

## โครงสร้างไฟล์ API

```
src/app/api/
├── orderApi.client.ts       # NSwag generated (root) — ห้ามแก้ไขตรงๆ, regenerate ทุกครั้งที่รัน codegen
│
└── query/
    ├── orderApi.api.ts      # wrapper — instantiate client class จาก ../orderApi.client.ts
    └── order.query.ts       # React Query hooks — import orderClient จาก ./orderApi.api.ts
```

## วิธีที่ 1: ใช้ NSwag สร้าง API Client (แนะนำ — บังคับลองก่อนเสมอ)

### ขั้นตอนที่ 1: ตั้งค่า VITE_API_URL ใน .env
```
VITE_API_URL="http://localhost:5000/api"
# ต้องมี /api suffix เสมอ (มาตรฐานบริษัท — ดู Const.ts: export const API_URL = VITE_API_URL)
# npm run codegen จะตัด /api ออกเองตอนดึง swagger spec (ดึงจาก http://localhost:5000/swagger/v1/swagger.json) — ห้ามตัดเองใน .env
# รองรับหลาย backend ได้โดยใส่หลาย URL คั่นด้วย comma เช่น VITE_API_URL="https://a.com/api,https://b.com/api"
```

### ขั้นตอนที่ 2: รัน code generation ด้วยตัวเอง
```bash
npm run codegen
```
ต้องรันเองด้วย Bash จริงๆ — ห้ามสมมติว่ารันแล้วหรือเขียน client เองโดยไม่ลองรันก่อน คำสั่งนี้ทำ post-processing ให้อัตโนมัติแล้ว (ตัด `/api/` ออกจาก path ที่ generate, ปรับ date format เป็น dayjs, เพิ่ม custom formatter import) — ไม่ต้องทำเพิ่มเอง

### ขั้นตอนที่ 3: ตรวจไฟล์ที่ถูกสร้าง/เปลี่ยนแปลงจริง
```bash
git status src/app/api/
```
ไฟล์ดิบที่ได้ตั้งชื่อตาม **hostname** ของ `VITE_API_URL` เสมอ (เช่น `VITE_API_URL="http://localhost:5000/api"` → ได้ไฟล์ `localhost.api.ts`) ไม่เกี่ยวกับชื่อ controller หรือ project — ถ้าตั้งหลาย URL คั่น comma จะได้ไฟล์แยกตาม hostname ของแต่ละ URL คนละไฟล์

### ขั้นตอนที่ 4: เปลี่ยนชื่อไฟล์ตาม Standard
ไฟล์ดิบ (เช่น `localhost.api.ts`) ตั้งชื่อตาม hostname ไม่มีความหมาย — เปลี่ยนชื่อตาม **class ที่ generate ออกมาในไฟล์** (เช่นเจอ `export class OrderClient` → เปลี่ยนชื่อไฟล์เป็น `orderApi.client.ts`) เก็บไว้ที่ root ของ `src/app/api/` (**ไม่ใช่** `src/api/`)

### ขั้นตอนที่ 5: สร้าง wrapper instantiate client
NSwag สร้างไฟล์เป็น **class** (เช่น `OrderClient`) ต้องสร้างไฟล์ wrapper ใน `src/app/api/query/<name>.api.ts` เพื่อ import class แล้ว instantiate ด้วย `API_URL` + `axios` — ไม่มีไฟล์นี้แล้วเขียน `.query.ts` เรียก `orderClient.method()` ตรงๆ จะ undefined:
```typescript
// src/app/api/query/orderApi.api.ts
import axios from "axios";
import { API_URL } from "../../../Const"; // API_URL = VITE_API_URL ซึ่งมี /api อยู่แล้ว — ห้ามต่อ/ตัด /api เพิ่ม
import { OrderClient } from "../orderApi.client";

export const orderClient = new OrderClient(API_URL, axios);
```

### ขั้นตอนที่ 6: เขียน React Query hooks
สร้าง `.query.ts` ใน `src/app/api/query/` ที่ import `orderClient` จาก wrapper ในขั้นตอนที่ 5 (ดูตัวอย่างเต็มในหัวข้อ "การเขียน React Query Hooks" ด้านล่าง)

## วิธีที่ 2: เขียน Axios API Client เอง (ทางเลือกสุดท้ายเท่านั้น)

ใช้เฉพาะเมื่อรัน `npm run codegen` ไม่ได้จริงๆ — ไม่มี swagger endpoint ให้ดึง, backend ยังไม่มี controller, หรือ build ล้มเหลว **ต้องแจ้งผู้ใช้ก่อนว่าทำไมถึง fallback มาใช้วิธีนี้** ห้ามใช้วิธีนี้เป็นทางลัดแทนการลองรัน codegen ก่อน

ไฟล์กลุ่มนี้ไม่มี class ให้ instantiate — `.query.ts` ที่เรียกใช้ต้อง import free function ตรงๆ (เช่น `getOrderGetAll(...)`) แทน `orderClient.method()`:

```typescript
import axios, { AxiosResponse } from "axios";
import { API_URL } from "../../Const";

// ต้องประกาศ Interface ของ Response
export interface OrderResponseDtoListServiceResponse {
    data?: OrderResponseDto[] | undefined;
    isSuccess?: boolean;
    message?: string | undefined;
    code?: number | undefined;
    exceptionMessage?: any | undefined;
    totalAmountRecords?: number | undefined;
    currentPage?: number | undefined;
    recordsPerPage?: number | undefined;
}

// GET — ดึงรายการ
export const getOrderGetAll = (
    page?: number,
    recordsPerPage?: number,
    sortColumn?: string,
    ordering?: string
): Promise<OrderResponseDto[]> => {
    return axios
        .get(`${API_URL}/order`, {
            params: { page, recordsPerPage, sortColumn, ordering },
        })
        .catch((_error: any) => {
            if (_error.response) return _error.response;
            else throw _error;
        })
        .then((response: AxiosResponse<OrderResponseDtoListServiceResponse>) => {
            if (!response.data.isSuccess)
                throw new Error(response.data.exceptionMessage);
            return response.data.data;
        });
};

// GET — ดึงรายการเดียว
export const getOrderGetById = (id: number): Promise<OrderResponseDto> => {
    return axios
        .get(`${API_URL}/order/${id}`)
        .catch((_error: any) => {
            if (_error.response) return _error.response;
            else throw _error;
        })
        .then((response: AxiosResponse<OrderResponseDtoServiceResponse>) => {
            if (!response.data.isSuccess)
                throw new Error(response.data.exceptionMessage);
            return response.data;
        });
};

// POST — สร้างข้อมูลใหม่
export const postOrderCreate = (
    orderRequestDto: OrderRequestDto
): Promise<OrderResponseDto> => {
    return axios
        .post(`${API_URL}/order`, orderRequestDto)
        .catch((_error: any) => {
            if (_error.response) return _error.response;
            else throw _error;
        })
        .then((response: AxiosResponse<OrderResponseDtoServiceResponse>) => {
            if (!response.data.isSuccess)
                throw new Error(response.data.exceptionMessage);
            return response.data.data;
        });
};

// POST — อัพเดทข้อมูล (มาตรฐานบริษัทใช้ REST API ไม่ใช่ RESTful — มีแค่ GET/POST ห้ามใช้ PUT/PATCH/DELETE)
export const postOrderUpdate = (
    id: number,
    orderRequestDto: OrderRequestDto
): Promise<OrderResponseDto> => {
    return axios
        .post(`${API_URL}/order/${id}/update`, orderRequestDto)
        .catch((_error: any) => {
            if (_error.response) return _error.response;
            else throw _error;
        })
        .then((response: AxiosResponse<OrderResponseDtoServiceResponse>) => {
            if (!response.data.isSuccess)
                throw new Error(response.data.exceptionMessage);
            return response.data;
        });
};
```

## การเขียน React Query Hooks

ชื่อไฟล์: `[controllerName].query.ts` เช่น `order.query.ts`

```typescript
// order.query.ts
import { useQuery, useMutation } from "react-query";
import { API_URL } from "../../Const";

// ต้องประกาศ queryKeys เป็น object
export const queryKeys = {
    orderGetAll: "orderGetAll",
    orderGetById: "orderGetById",
};

// Interface สำหรับ request parameters
export interface OrderGetAllRequest {
    page?: number;
    sortBy?: string;
    sortOrder?: string;
    recordsPerPage?: number;
}

// useQuery — ดึงข้อมูล
export const useOrderGetAll = (
    request: OrderGetAllRequest,
    onSuccessCallback?: (data: OrderListResponse) => void,
    onErrorCallback?: (error: Error) => void
) => {
    return useQuery<OrderListResponse, Error>(
        [queryKeys.orderGetAll, request], // query key + dependency
        () => orderClient.getAll(
            request.page,
            request.sortBy,
            request.sortOrder,
            request.recordsPerPage
        ),
        {
            staleTime: 1000 * 60 * 5,       // ข้อมูล stale หลัง 5 นาที
            cacheTime: 1000 * 60 * 10,      // cache ไว้ 10 นาที
            refetchOnWindowFocus: true,      // refetch เมื่อ focus หน้าต่าง
            onSuccess: (data) => {
                if (!data.isSuccess)
                    onErrorCallback?.(new Error(data.message || "Unknown error"));
                onSuccessCallback?.(data);
            },
            onError: (error) => {
                onErrorCallback?.(error);
            },
        }
    );
};

// useQuery — ดึงรายการเดียว
export const useOrderGetById = (
    id: number,
    onSuccessCallback?: (data: OrderResponse) => void,
    onErrorCallback?: (error: Error) => void
) => {
    return useQuery<OrderResponse, Error>(
        [queryKeys.orderGetById, id],
        () => orderClient.getById(id),
        {
            onSuccess: (data) => {
                if (!data.isSuccess)
                    onErrorCallback?.(new Error(data.message || "Unknown error"));
                onSuccessCallback?.(data);
            },
            onError: (error) => onErrorCallback?.(error),
        }
    );
};

// useMutation — สร้างหรืออัพเดทข้อมูล
export const useOrderCreate = (
    onSuccessCallback?: (data: OrderResponse) => void,
    onErrorCallback?: (error: Error) => void
) => {
    return useMutation<OrderResponse, Error, OrderRequestDto>(
        (request) => orderClient.create(request),
        {
            onSuccess: (data) => {
                if (!data?.isSuccess)
                    onErrorCallback?.(new Error(data?.message || "Unknown error"));
                onSuccessCallback?.(data);
            },
            onError: (error) => onErrorCallback?.(error),
        }
    );
};

export const useOrderUpdate = (
    id: number,
    onSuccessCallback?: (data: OrderResponse) => void,
    onErrorCallback?: (error: Error) => void
) => {
    return useMutation<OrderResponse, Error, OrderRequestDto>(
        (request) => orderClient.update(id, request),
        {
            onSuccess: (data) => {
                if (!data?.isSuccess)
                    onErrorCallback?.(new Error(data?.message || "Unknown error"));
                onSuccessCallback?.(data);
            },
            onError: (error) => onErrorCallback?.(error),
        }
    );
};
```

## แนวคิดหลักของ React Query

- **Fetching + Caching** — ดึงข้อมูลและแคชไว้ ลดการเรียก API ซ้ำ
- **Automatic Refetching** — refetch อัตโนมัติเมื่อ window focus หรือ data stale
- **Background Syncing** — อัพเดท state โดยไม่ต้องรอ user
- **Mutation** — จัดการ create/update/delete พร้อม loading/error state
