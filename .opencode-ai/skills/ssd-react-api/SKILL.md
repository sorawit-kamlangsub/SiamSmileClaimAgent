---
name: ssd-react-api
description: ใช้ skill นี้เมื่อเรียก API ด้วย Axios ใน React, สร้าง React Query hook, ใช้ NSwag สร้าง API client, หรือจัดการ HTTP request/response ตามมาตรฐาน SSD
version: 1.0.0
---

# SSD React API — มาตรฐานการเรียก API ด้วย Axios และ React Query

## บริบท

SSD ใช้ Axios สำหรับ HTTP request และ TanStack React Query สำหรับ server state management ทุกไฟล์ที่เกี่ยวกับ API ต้องเก็บใน `src/app/api/` โดยมี 2 วิธีสร้าง API client: ใช้ NSwag (แนะนำ) หรือเขียนเอง

## กฎหลัก

1. ไฟล์ API client ทุกไฟล์ต้องเก็บใน `src/app/api/`
2. ควรใช้ NSwag สร้าง Axios API client เป็นลำดับแรก
3. ไฟล์ React Query hooks ตั้งชื่อตาม Controller และลงท้ายด้วย `.query.ts`
4. ต้องประกาศ `queryKeys` เป็น object สำหรับทุก query ไฟล์
5. ต้องจัดการ error response จาก API เสมอ (`isSuccess` check)

## โครงสร้างไฟล์ API

```
src/app/api/
├── orderApi.client.ts   # สร้างจาก NSwag (ชื่อลงท้าย .client.ts)
├── orderApi.ts          # เขียนเองกรณี NSwag ไม่พอ
├── order.query.ts       # React Query hooks
│
└── sale/               # กรณีต่อหลาย API ให้สร้าง folder
    ├── saleApi.client.ts
    └── slip.query.ts
```

## วิธีที่ 1: ใช้ NSwag สร้าง API Client (แนะนำ)

### ขั้นตอนที่ 1: ตั้งค่า API_URL ใน .env
```
API_URL=https://localhost:5001
# NSwag จะดึง swagger จาก https://localhost:5001/swagger/v1/swagger.json
```

### ขั้นตอนที่ 2: รัน code generation
```bash
npm run code-gen
```

### ขั้นตอนที่ 3: เปลี่ยนชื่อไฟล์
โปรแกรมจะสร้างไฟล์ `api.ts` ใน `src/api/` ให้เปลี่ยนชื่อตาม Standard เช่น `orderApi.client.ts`

## วิธีที่ 2: เขียน Axios API Client เอง

ใช้เมื่อ NSwag ไม่สามารถตอบสนองได้:

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

// PUT — อัพเดทข้อมูล
export const putOrderUpdate = (
    id: number,
    orderRequestDto: OrderRequestDto
): Promise<OrderResponseDto> => {
    return axios
        .put(`${API_URL}/order/${id}`, orderRequestDto)
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