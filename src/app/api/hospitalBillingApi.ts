import axios from "axios";
import {
    BillingDetailDtoServiceResponse,
    BillingHistoryDtoServiceResponse,
    BillingListDtoServiceResponse,
    BillingSubmitResultDtoServiceResponse,
    HospitalBillingClient,
    SubmitHospitalBillingDto,
} from "./coreClaimApi.client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../../Const";

/**
 * วางบิลเคลม - เคลมโรงพยาบาล (`/billing/hospital/*`)
 *
 * `HospitalBillingClient` เป็น generated client อยู่แล้ว (ดู CLAUDE.md "Generated API binding")
 * ไฟล์นี้เป็น wrapper hook ตาม pattern เดียวกับ coreClaimApi.ts — ห้ามแก้ coreClaimApi.client.ts
 */
const hospitalBillingClient = new HospitalBillingClient(API_URL, axios);

const getHospitalBillingFilterQueryKey = ["getHospitalBillingFilter"];
const getHospitalBillingDetailQueryKey = ["getHospitalBillingDetail"];
const getHospitalBillingHistoryQueryKey = ["getHospitalBillingHistory"];

/**
 * GET /billing/hospital/filter — ตาราง list + dashboard counts
 *
 * `statusId` รับเฉพาะ 1 (รอตรวจสอบ) / 2 (รอแก้ไข) / 4 (ไม่ผ่าน) / 5 (ยกเลิก) — ส่ง 3 (ผ่าน) จะได้ 400
 */
export const useGetHospitalBillingFilter = (
    statusId: number | undefined,
    searchBy: string | undefined,
    searchDetail: string | undefined,
    orderingField: string | undefined,
    ascendingOrder: boolean | undefined,
    page: number | undefined,
    recordsPerPage: number | undefined
) => {
    return useQuery<BillingListDtoServiceResponse>(
        [
            getHospitalBillingFilterQueryKey,
            statusId,
            searchBy,
            searchDetail,
            orderingField,
            ascendingOrder,
            page,
            recordsPerPage,
        ],
        () =>
            hospitalBillingClient.filter(
                statusId,
                searchBy,
                searchDetail,
                orderingField,
                ascendingOrder,
                page,
                recordsPerPage
            ),
        { keepPreviousData: true, refetchOnWindowFocus: false }
    );
};

/** GET /billing/hospital/{billingDetailId} — รายละเอียด/ข้อมูลตั้งต้นของแบบฟอร์ม */
export const useGetHospitalBillingDetail = (billingDetailId: string | undefined) => {
    return useQuery<BillingDetailDtoServiceResponse>(
        [getHospitalBillingDetailQueryKey, billingDetailId],
        () => hospitalBillingClient.hospital(billingDetailId ?? ""),
        { enabled: !!billingDetailId, refetchOnWindowFocus: false }
    );
};

/** GET /billing/hospital/{billingDetailId}/history — รอบวางบิล (rounds) + ผลตรวจย้อนหลัง (revisions) */
export const useGetHospitalBillingHistory = (billingDetailId: string | undefined) => {
    return useQuery<BillingHistoryDtoServiceResponse>(
        [getHospitalBillingHistoryQueryKey, billingDetailId],
        () => hospitalBillingClient.history(billingDetailId ?? ""),
        { enabled: !!billingDetailId, refetchOnWindowFocus: false }
    );
};

/**
 * ข้อผิดพลาดจาก POST submit ที่ normalize แล้ว
 *
 * `HospitalBillingClient.processSubmit` throw ค่าที่ parse จาก response body ตรง ๆ (ไม่ใช่ Error) เมื่อ
 * parse สำเร็จ — envelope ที่ throw ออกมามี `code` เป็น HTTP status (ตาม handoff ข้อ 10) จึงต้องเช็คทั้ง
 * `code` (จาก envelope) และ `status` (จาก ApiException เมื่อ parse ไม่สำเร็จ/response ไม่มี body)
 */
export type SubmitBillingError = {
    httpStatus?: number;
    message: string;
    isConflict: boolean;
};

export const normalizeSubmitError = (error: unknown): SubmitBillingError => {
    const asRecord = error as Record<string, unknown> | undefined;
    const httpStatus = (asRecord?.code as number | undefined) ?? (asRecord?.status as number | undefined);
    const message =
        (asRecord?.message as string | undefined) ||
        (asRecord?.exceptionMessage as string | undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        "เกิดข้อผิดพลาด ไม่สามารถบันทึกผลตรวจสอบได้";
    return { httpStatus, message, isConflict: httpStatus === 409 };
};

/**
 * POST /billing/hospital/{billingDetailId}/submit — ยืนยันผลตรวจสอบ
 *
 * Idempotent ด้วย `requestId` ในตัว body — caller ต้องคุม `requestId` เอง (สร้างใหม่ต่อ 1 ความตั้งใจ
 * บันทึก, ใช้ค่าเดิมซ้ำเมื่อ retry คำขอเดิม) invalidate ทั้ง filter/detail/history เมื่อสำเร็จ
 */
export const useSubmitHospitalBilling = (
    onSuccessCallback?: (response: BillingSubmitResultDtoServiceResponse) => void,
    onErrorCallback?: (error: SubmitBillingError) => void
) => {
    const queryClient = useQueryClient();
    return useMutation(
        (params: { billingDetailId: string; body: SubmitHospitalBillingDto }) =>
            hospitalBillingClient.submit(params.billingDetailId, params.body),
        {
            onSuccess: (response) => {
                queryClient.invalidateQueries([getHospitalBillingFilterQueryKey]);
                queryClient.invalidateQueries([getHospitalBillingDetailQueryKey]);
                queryClient.invalidateQueries([getHospitalBillingHistoryQueryKey]);
                if (!response.isSuccess) {
                    onErrorCallback?.(normalizeSubmitError(response));
                } else {
                    onSuccessCallback?.(response);
                }
            },
            onError: (error: unknown) => {
                onErrorCallback?.(normalizeSubmitError(error));
            },
        }
    );
};
