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

/**
 * generated client เรียก `JSON.parse(response.data)` กับทุก status ที่ไม่ใช่ 200 แต่ axios parse body เป็น
 * object ให้แล้ว จึงโยน SyntaxError และ HTTP status หายไป (แยก 409/404/500 ไม่ได้) — แปลง body ของ error
 * กลับเป็น string ให้ client parse เองได้และ throw envelope (มี `code` = HTTP status) ออกมาตามปกติ
 *
 * ผูกกับ axios ตัวกลาง (auth interceptor อยู่ที่ instance นี้) แต่จำกัดเฉพาะ `/billing/hospital/*`
 * client อื่นจึงไม่ถูกกระทบ
 */
const HOSPITAL_BILLING_URL_PREFIX = `${API_URL}/billing/hospital/`;
axios.interceptors.response.use(undefined, (error) => {
    const response = axios.isAxiosError(error) ? error.response : undefined;
    if (
        response &&
        error.config?.url?.startsWith(HOSPITAL_BILLING_URL_PREFIX) &&
        typeof response.data === "object" &&
        response.data !== null
    ) {
        response.data = JSON.stringify(response.data);
    }
    return Promise.reject(error);
});

const getHospitalBillingFilterQueryKey = ["getHospitalBillingFilter"];
const getHospitalBillingDetailQueryKey = ["getHospitalBillingDetail"];
const getHospitalBillingHistoryQueryKey = ["getHospitalBillingHistory"];

/**
 * GET /billing/hospital/filter — ตาราง list + dashboard counts
 *
 * `statusId` รับเฉพาะ 1 (รอตรวจสอบ) / 2 (รอแก้ไข) / 4 (ไม่ผ่าน) / 5 (ยกเลิก) — ส่ง 3 (ผ่าน) จะได้ 400
 *
 * `items[].amount` คือ `totalClaimedAmount` ของ BillingDetail (ผลรวม `expenses[].claimAmount`) ไม่ใช่
 * `netBillableAmount` (hospital-billing-fe.md ข้อ 4)
 */
export const useGetHospitalBillingFilter = (
    statusId?: number | undefined,
    searchBy?: string | undefined,
    searchDetail?: string | undefined,
    orderingField?: string | undefined,
    ascendingOrder?: boolean | undefined,
    page?: number | undefined,
    recordsPerPage?: number | undefined
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

/**
 * GET /billing/hospital/{billingDetailId}/history — รอบวางบิล (rounds) + ผลตรวจย้อนหลัง (revisions)
 *
 * `enabled = false` : ไม่ยิงตอน mount ใช้ `refetch()` ดึงเองเมื่อจำเป็น (เช่นตรวจหลักฐานหลัง timeout)
 */
export const useGetHospitalBillingHistory = (billingDetailId: string | undefined, enabled = true) => {
    return useQuery<BillingHistoryDtoServiceResponse>(
        [getHospitalBillingHistoryQueryKey, billingDetailId],
        () => hospitalBillingClient.history(billingDetailId ?? ""),
        { enabled: enabled && !!billingDetailId, refetchOnWindowFocus: false }
    );
};

/**
 * ข้อผิดพลาดจาก POST submit / publish ที่ normalize แล้ว
 *
 * `HospitalBillingClient.process*` throw ค่าที่ parse จาก response body ตรง ๆ (ไม่ใช่ Error) เมื่อ
 * parse สำเร็จ — envelope ที่ throw ออกมามี `code` เป็น HTTP status ชนิด number แต่ axios error ตอน
 * network ขาด/timeout (ไม่มี response เลย) ก็มี `code` เหมือนกันแต่เป็น string เช่น
 * "ECONNABORTED"/"ERR_NETWORK" จึงต้องแยกชนิดก่อนใช้เป็น httpStatus, และเช็ค `status` (จาก ApiException
 * เมื่อ body ว่าง) เป็น fallback
 */
export type SubmitBillingError = {
    httpStatus?: number;
    message: string;
    /** 409 — สถานะปัจจุบันไม่อนุญาตให้ทำรายการ ต้องโหลดข้อมูลใหม่ ห้ามส่งซ้ำอัตโนมัติ */
    isConflict: boolean;
    /** 404 — รายการไม่พบ หรือ revision ไม่ตรงกับ BillingDetail */
    isNotFound: boolean;
    /**
     * 5xx / network / timeout / อ่าน status ไม่ได้ — ยังสรุปไม่ได้ว่าบันทึกแล้วหรือไม่ ต้องตรวจ
     * Detail/History ก่อนตัดสินใจส่งอีกครั้ง
     */
    isOutcomeUnknown: boolean;
};

export const normalizeSubmitError = (error: unknown): SubmitBillingError => {
    const asRecord = error as Record<string, unknown> | undefined;
    const rawCode = asRecord?.code;
    const httpStatus =
        (typeof rawCode === "number" ? rawCode : undefined) ??
        (typeof asRecord?.status === "number" ? (asRecord.status as number) : undefined);
    const message =
        (asRecord?.message as string | undefined) ||
        (asRecord?.exceptionMessage as string | undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        "เกิดข้อผิดพลาด ไม่สามารถบันทึกผลตรวจสอบได้";
    return {
        httpStatus,
        message,
        isConflict: httpStatus === 409,
        isNotFound: httpStatus === 404,
        isOutcomeUnknown: httpStatus === undefined || httpStatus >= 500,
    };
};

/**
 * POST /billing/hospital/{billingDetailId}/submit — ยืนยันผลตรวจสอบ
 *
 * ไม่มี idempotency key แล้ว — BE lock ต่อ BillingDetail และตรวจสถานะใน transaction คำขอที่สถานะ
 * ไม่อนุญาตได้ 409 caller ต้องกันกดซ้ำเองและห้าม retry อัตโนมัติ invalidate ทั้ง filter/detail/history
 * เมื่อสำเร็จ
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

/**
 * POST /billing/hospital/{billingDetailId}/revisions/{revisionId}/publish — ส่งผลของ revision ที่บันทึกแล้ว
 * อีกครั้ง (ไม่มี body)
 *
 * ใช้ snapshot เดิม ไม่สร้าง revision/ยอดใหม่ — HTTP 200 ไม่ได้แปลว่าปลายทางประมวลผลเรียบร้อย ให้แสดง
 * ตาม `returnStatus` ที่ API คืน
 */
export const useRepublishHospitalBillingReview = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (params: { billingDetailId: string; revisionId: string }) =>
            hospitalBillingClient.republishHospitalBillingReview(params.billingDetailId, params.revisionId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries([getHospitalBillingFilterQueryKey]);
                queryClient.invalidateQueries([getHospitalBillingDetailQueryKey]);
                queryClient.invalidateQueries([getHospitalBillingHistoryQueryKey]);
            },
        }
    );
};
