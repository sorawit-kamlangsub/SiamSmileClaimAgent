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
 *
 * `items[].amount` คือ `totalClaimedAmount` ของ BillingDetail (ผลรวม `expenses[].claimAmount`) ไม่ใช่
 * `netBillableAmount` (hospital-billing-fe.md ข้อ 4)
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
 * parse สำเร็จ — envelope ที่ throw ออกมามี `code` เป็น HTTP status ชนิด number (ตาม handoff ข้อ 10) แต่
 * axios error ตอน network ขาด/timeout (ไม่มี response เลย) ก็มี `code` เหมือนกันแต่เป็น string เช่น
 * "ECONNABORTED"/"ERR_NETWORK" จึงต้องแยกชนิดก่อนใช้เป็น httpStatus, และเช็ค `status` (จาก ApiException
 * เมื่อ parse ไม่สำเร็จ) เป็น fallback
 */
export type SubmitBillingError = {
    httpStatus?: number;
    message: string;
    /** 409 — ข้อมูลเปลี่ยนไปจากที่อื่นแล้ว ต้องโหลดใหม่และใช้ requestId ใหม่เมื่อ submit อีกครั้ง (handoff ข้อ 7) */
    isConflict: boolean;
    /** 404 — รายการไม่พบ/ไม่ active หรือข้อมูลที่จำเป็นไม่พร้อม (handoff ข้อ 10) */
    isNotFound: boolean;
    /**
     * 500 หรือ network/timeout — ผลบันทึกอาจสำเร็จแล้วแต่ยังไม่แน่ชัด (handoff ข้อ 7/10) ต้อง retry ด้วย
     * `requestId` และ body เดิมทุกค่าภายใต้ผู้ใช้เดิม ห้ามสร้าง `requestId` ใหม่
     */
    isRetryable: boolean;
};

export const normalizeSubmitError = (error: unknown): SubmitBillingError => {
    const asRecord = error as Record<string, unknown> | undefined;
    const rawCode = asRecord?.code;
    const httpStatus =
        (typeof rawCode === "number" ? rawCode : undefined) ??
        (typeof asRecord?.status === "number" ? (asRecord.status as number) : undefined);
    // axios error ที่ไม่มี response เลย (network ขาด/timeout) ถูก rethrow ดิบจาก HospitalBillingClient.submit()
    const isNetworkOrTimeout = asRecord?.isAxiosError === true && httpStatus === undefined;
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
        isRetryable: httpStatus === 500 || isNetworkOrTimeout,
    };
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
