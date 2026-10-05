import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "../../../../redux";
import { resetClaimSimulate } from "../store/claimSimulateSlice";
import { clearAppliedClaimSimulatePrefill } from "../store/claimSimulatePrefill";

/**
 * Layout ของเมนู "คำนวณวงเงินเคลม" (/claim-simulation และ /claim-simulation/summary)
 *
 * DFUAT-108 : ค่าของหน้านี้อยู่ใน Redux (claimsimulate) ซึ่งไม่ถูกล้างเองตอนเปลี่ยนเมนู — เปิดเมนูนี้อีกครั้งจึง
 * เห็นค่าเดิมค้าง ล้างที่นี่ตอน unmount = ตอนออกจากเมนูนี้จริง ๆ เท่านั้น (สลับ หน้าคำนวณ ↔ หน้าสรุป ไม่ unmount
 * layout นี้ ค่าที่กรอกจึงยังอยู่)
 */
const ClaimSimulateLayout: React.FC = () => {
    const dispatch = useAppDispatch();

    useEffect(
        () => () => {
            dispatch(resetClaimSimulate());
            // ให้กลับเข้ามาด้วยลิงก์ prefill เดิม (DFUAT-083) แล้วใส่ค่าเริ่มต้นใหม่ได้อีกครั้ง
            clearAppliedClaimSimulatePrefill();
        },
        [dispatch]
    );

    return <Outlet />;
};

export default ClaimSimulateLayout;
