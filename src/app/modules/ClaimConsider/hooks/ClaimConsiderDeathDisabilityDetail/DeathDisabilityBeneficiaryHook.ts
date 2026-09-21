import { useCallback, useMemo, useState } from "react";
import { useGetDeathAndDisabilityBeneficiary } from "../../../../api/coreClaimApi";
import {
    GetDeathAndDisabilityBeneficiaryDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
} from "../../../../api/coreClaimApi.client";

/**
 * รายการผู้รับผลประโยชน์ของเคลม Death & Disability (GetDeathAndDisabilityBeneficiary)
 *
 * การแก้ไขจาก dialog "แก้ไขข้อมูล" ยังไม่บันทึกลงฐานข้อมูล — เก็บไว้ใน state แล้วแสดงทับข้อมูลจาก API
 * ค่าที่แก้จะถูกส่งไปพร้อมผลการพิจารณาตอนกด "ยืนยันบันทึก" (ส่งออกผ่าน editedBeneficiaries)
 */
const useDeathDisabilityBeneficiaryHook = (detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined) => {
    const { data, isLoading } = useGetDeathAndDisabilityBeneficiary(detail?.claimId ?? "", detail?.caseId ?? "");
    // key = ตำแหน่งในรายการจาก API — รายการไม่เปลี่ยนลำดับระหว่างอยู่ในหน้านี้ (ไม่มีการเพิ่ม/ลบผู้รับฯ)
    const [editsByIndex, setEditsByIndex] = useState<Record<number, GetDeathAndDisabilityBeneficiaryDtoResponse>>({});

    const beneficiaries = useMemo(
        () => (data?.data ?? []).map((item, index) => editsByIndex[index] ?? item),
        [data, editsByIndex]
    );
    const editedIndexes = useMemo(() => Object.keys(editsByIndex).map(Number), [editsByIndex]);
    const editedBeneficiaries = useMemo(() => Object.values(editsByIndex), [editsByIndex]);
    const totalPayoutAmount = beneficiaries.reduce((sum, item) => sum + (item.payoutAmount ?? 0), 0);

    const updateBeneficiary = useCallback((index: number, updated: GetDeathAndDisabilityBeneficiaryDtoResponse) => {
        setEditsByIndex((prev) => ({ ...prev, [index]: updated }));
    }, []);

    return {
        beneficiaries,
        beneficiaryLoading: isLoading,
        totalPayoutAmount,
        editedIndexes,
        editedBeneficiaries,
        updateBeneficiary,
    };
};

export default useDeathDisabilityBeneficiaryHook;
