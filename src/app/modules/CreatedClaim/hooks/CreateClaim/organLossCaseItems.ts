import { CaseItemV2Request, GetCustomerBenefitDetailHalfDtoResponse } from "../../../../api/coreClaimApi.client";
import { amountNumber, FingerKey, OrganLossItem } from "./organLoss.types";

/**
 * caseItem ของเคลมทุพพลภาพ (PA/PH) จากรายการอวัยวะที่เลือก — อวัยวะเดี่ยว/combo = 1 รายการ, กลุ่มนิ้ว = 1 รายการต่อ 1 นิ้ว
 * แต่ละรายการใส่ bodyPartId ของตัวเอง (นิ้วใช้ bodyPartId ที่ผูกตาม นิ้ว/ข้าง/จำนวนข้อ)
 * ยอดไม่คุ้มครอง/สาเหตุกรอกระดับอวัยวะ — กลุ่มนิ้วลงไว้ที่นิ้วแรก ยอดสุทธิรวมทั้งกลุ่มจึงเท่ากับ organ.totalAmount
 */
export const mapOrganLossToCaseItems = (
    organLossItems: OrganLossItem[],
    benefitItem: GetCustomerBenefitDetailHalfDtoResponse | undefined
): CaseItemV2Request[] => {
    const toCaseItem = (
        bodyPartId: number | undefined,
        amount: number,
        nonCoveredAmount: number,
        nonCoveredReasonId: number | undefined
    ): CaseItemV2Request => ({
        inputToStandardMappingId: benefitItem?.inputToStandardMappingId ?? 0,
        standardMedicalExpenseId: benefitItem?.standardMedicalExpenseId ?? 0,
        quantity: 1,
        perUnit: benefitItem?.pricePerUnit ?? 0,
        originalAmount: amount,
        discountAmount: 0,
        netCaseAmount: amount - nonCoveredAmount,
        medicalTypeId: benefitItem?.medicalTypeId ?? undefined,
        nonCoveredAmount,
        nonCoveredReasonId: nonCoveredReasonId || undefined,
        bodyPartId,
    });

    return organLossItems.flatMap((organ): CaseItemV2Request[] => {
        const nonCoveredAmount = amountNumber(organ.uncoveredAmount);
        if (!organ.fingers) {
            return [toCaseItem(organ.bodyPartId, amountNumber(organ.amount), nonCoveredAmount, organ.uncoveredReason)];
        }
        const sides: ("left" | "right")[] = ["left", "right"];
        const fingers = sides.flatMap((side) =>
            (Object.keys(organ.fingers![side]) as FingerKey[])
                .map((fingerKey) => organ.fingers![side][fingerKey])
                .filter((finger) => finger.selected && finger.bodyPartId)
        );
        return fingers.map((finger, index) =>
            toCaseItem(
                finger.bodyPartId,
                amountNumber(finger.amount),
                index === 0 ? nonCoveredAmount : 0,
                index === 0 ? organ.uncoveredReason : undefined
            )
        );
    });
};
