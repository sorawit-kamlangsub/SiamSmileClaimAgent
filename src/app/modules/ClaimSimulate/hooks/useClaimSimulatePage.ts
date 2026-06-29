import { useClaimLineHeader } from "./useClaimLineHeader";
import { useDaysCalculate } from "./useDaysCalculate";
import { useClaimLineCalculate } from "./useClaimLineCalculate";

/**
 * รวม logic ของ 3 ส่วนเข้าด้วยกันสำหรับหน้าเดียว (ตาม reference HTML):
 * 1) ข้อมูลผู้เอาประกัน + เหตุของการเคลม/ประเภทความคุ้มครอง/ประเภทการรักษา (useClaimLineHeader)
 * 2) วันที่รักษา/จำนวนวัน/เคลมต่อเนื่อง (useDaysCalculate)
 * 3) รายการค่าใช้จ่าย (useClaimLineCalculate)
 *
 * ทั้ง 3 hook อ่าน/เขียน redux slice เดียวกัน (claimsimulate) อยู่แล้ว จึงรวมกันได้โดยไม่ชนกัน
 */
export const useClaimSimulatePage = () => {
    const header = useClaimLineHeader();
    const days = useDaysCalculate();
    const calculate = useClaimLineCalculate();

    // ── "ถัดไป" ของรายการค่าใช้จ่าย = กดคำนวณ แล้วเปิด modal สรุปผล ──────────
    const handleNext = async () => {
        await days.handleCalculate();
    };

    return {
        ...header,
        ...days,
        ...calculate,
        handleNext,
    };
};
