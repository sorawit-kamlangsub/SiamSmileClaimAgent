import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ClaimSimulate from "../components/ClaimSimulate";
import { LoadingPlaceHolder } from "../../_common";
import { useAppDispatch } from "../../../../redux";
import { useGetCustomerDetailById } from "../../../api/coreClaimApi";
import { prefillClaimSimulate } from "../store/claimSimulateSlice";
import {
    buildClaimSimulatePrefill,
    CLAIM_SIMULATE_PREFILL_PARAM,
    parseClaimSimulatePrefill,
} from "../store/claimSimulatePrefill";

/**
 * prefill ชุดล่าสุดที่ใส่ลง Redux แล้ว — เก็บระดับ module (ไม่ใช่ state) เพราะต้องรอดการ unmount/remount ของหน้านี้
 * ตอนไปหน้าสรุปแล้วกดกลับ ไม่งั้นจะใส่ prefill ซ้ำแล้วล้างรายการค่ารักษาที่ผู้ใช้กรอกไว้ทิ้ง
 * refresh หน้าเว็บ = module โหลดใหม่ ค่านี้กลับเป็น null พร้อมกับ Redux ที่ว่าง จึงใส่ prefill ใหม่ได้ถูกจังหวะ
 */
let lastAppliedPrefill: string | null = null;

const ClaimSimulatePage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();

    /**
     * DFUAT-083 : เปิดมาจากปุ่ม "เปิดโปรแกรมคำนวณวงเงินเคลม" ในหน้าแจ้งเคลม (tab ใหม่) — ค่าเริ่มต้นอยู่ใน
     * query string จึง refresh แล้วไม่หาย ข้อมูลผู้เอาประกันโหลดจาก customerDetailId ที่ส่งมา
     */
    const encodedPrefill = searchParams.get(CLAIM_SIMULATE_PREFILL_PARAM);
    const prefillParams = useMemo(() => parseClaimSimulatePrefill(encodedPrefill), [encodedPrefill]);
    const { data: insuredData, isFetched: isInsuredFetched } = useGetCustomerDetailById(
        prefillParams?.customerDetailId
    );

    /** prefill ชุดที่ใส่ลง Redux แล้ว — ใส่ครั้งเดียวต่อชุด ไม่ทับค่าที่ผู้ใช้แก้ต่อในหน้านี้ */
    const [appliedPrefill, setAppliedPrefill] = useState<string | null>(lastAppliedPrefill);
    const isInsuredReady = !prefillParams?.customerDetailId || isInsuredFetched;

    useEffect(() => {
        if (!prefillParams || appliedPrefill === encodedPrefill || !isInsuredReady) return;
        dispatch(prefillClaimSimulate(buildClaimSimulatePrefill(prefillParams, insuredData?.data)));
        lastAppliedPrefill = encodedPrefill;
        setAppliedPrefill(encodedPrefill);
    }, [prefillParams, encodedPrefill, appliedPrefill, isInsuredReady, insuredData, dispatch]);

    // ฟอร์มของหน้าคำนวณอ่านค่าเริ่มต้นจาก Redux ตอน mount — ต้องรอใส่ prefill ให้เสร็จก่อนค่อย render
    if (prefillParams && appliedPrefill !== encodedPrefill) {
        return (
            <LoadingPlaceHolder isLoading>
                <></>
            </LoadingPlaceHolder>
        );
    }

    // คง query string ไว้ตอนไปหน้าสรุป — กดย้อนกลับ/refresh แล้วยังรู้ว่าเปิดมาจากเคลมไหน
    return <ClaimSimulate onNext={() => navigate({ pathname: "summary", search: searchParams.toString() })} />;
};

export default ClaimSimulatePage;
