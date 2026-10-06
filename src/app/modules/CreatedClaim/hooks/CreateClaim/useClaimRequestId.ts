import { useRef } from "react";

const generateRequestId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * RequestId ของ POST /create/coreclaim และ /create/continued-claim — 1 ค่าต่ออายุของหน้าสรุป
 * (= 1 ความตั้งใจสร้างรายการ)
 *
 * กดซ้ำหลัง timeout หรือโอนเงินไม่สำเร็จต้องส่งค่าเดิม ห้ามสร้างใหม่ : BE ใช้ค่านี้กันบันทึกซ้ำ
 * (coreclaim ตอบ `isResult=false` "บันทึกข้อมูลซ้ำ", continued-claim คืน response เดิม) ถ้าสร้างใหม่ทุกครั้ง
 * ที่กดจะได้เคลมซ้ำ
 */
export const useClaimRequestId = () => {
    const requestIdRef = useRef<string>();
    return () => {
        if (!requestIdRef.current) requestIdRef.current = generateRequestId();
        return requestIdRef.current;
    };
};
