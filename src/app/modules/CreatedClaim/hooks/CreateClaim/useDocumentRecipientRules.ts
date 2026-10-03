import { useEffect, useMemo, useRef } from "react";
import { FormikProps } from "formik";
import { useAuth } from "../../../_auth";
import { useGetUser, useGetZebraCarOwner } from "../../../../api/coreClaimMastersApi";
import { DocumentRecipientType, OFFICE_EMPLOYEE_CODE } from "../../../../functionHelpers";
import { CarOwnerValues } from "../../store/claimPHSlice";

/** field ของ Claim Entry ที่ rule ผู้รับเอกสารใช้ — ชื่อเดียวกันทั้ง PH (ClaimFormValues) และ PA (ClaimPAFormValues) */
export interface DocumentRecipientFields extends CarOwnerValues {
    documentRecipientTypeId: number | undefined;
    serviceProviderId: number | undefined;
    serviceProviderCode: string | undefined;
    serviceProviderName: string | undefined;
    walkOutCarOwner: CarOwnerValues | undefined;
}

type ServiceProviderValues = Pick<
    DocumentRecipientFields,
    "serviceProviderId" | "serviceProviderCode" | "serviceProviderName"
>;

const EMPTY_CAR_OWNER: CarOwnerValues = {
    zebraId: undefined,
    zebraCode: undefined,
    zebraNo: undefined,
    employeeCode: undefined,
    employeeName: undefined,
};

const pickCarOwner = (values: CarOwnerValues): CarOwnerValues => ({
    zebraId: values.zebraId,
    zebraCode: values.zebraCode,
    zebraNo: values.zebraNo,
    employeeCode: values.employeeCode,
    employeeName: values.employeeName,
});

/**
 * กติกาผู้รับเอกสาร (หน้าแจ้งเคลม PH / PA ใช้ร่วมกัน)
 * | ผู้รับเอกสาร | ผู้ให้บริการ                | เจ้าของรถ                          |
 * | Walk Out   | ผู้ Login (แก้ไขได้)          | เลือกเอง (คืนค่าเดิมเมื่อสลับกลับมา) |
 * | Walk in    | ผู้ Login (แก้ไขได้)          | 000 - คุณสำนักงาน (ปิดแก้ไข)        |
 * | Pivot      | 000 - คุณสำนักงาน (ปิดแก้ไข) | 000 - คุณสำนักงาน (ปิดแก้ไข)        |
 * ค่าทั้งหมดเขียนลง formik ของ Claim Entry ตัวเดียวกับที่ส่งต่อ (setClaimForm) — ไม่มี state แยกฝั่ง UI
 */
export const useDocumentRecipientRules = <TValues extends DocumentRecipientFields>(formik: FormikProps<TValues>) => {
    const { userProfile } = useAuth();
    const { data: userData } = useGetUser();
    const { data: zebraData } = useGetZebraCarOwner();

    const loginProvider = useMemo((): ServiceProviderValues | undefined => {
        if (!userProfile?.userId) return undefined;
        const user = userData?.data?.find((u) => u.userId === userProfile.userId);
        return {
            serviceProviderId: userProfile.userId,
            serviceProviderCode: user?.employeeCode,
            serviceProviderName: user?.personName,
        };
    }, [userData, userProfile?.userId]);

    // TODO: รอ Master มีรายการ "000 - คุณสำนักงาน" — ถ้ายังไม่มีจะปล่อยว่างไว้ (validation required จะเตือน)
    const officeProvider = useMemo((): ServiceProviderValues | undefined => {
        const user = userData?.data?.find((u) => u.employeeCode === OFFICE_EMPLOYEE_CODE);
        if (!user?.userId) return undefined;
        return {
            serviceProviderId: user.userId,
            serviceProviderCode: user.employeeCode,
            serviceProviderName: user.personName,
        };
    }, [userData]);

    const officeCarOwner = useMemo((): CarOwnerValues | undefined => {
        const zebra = zebraData?.data?.find((z) => z.employeeCode === OFFICE_EMPLOYEE_CODE);
        if (!zebra?.zebraId) return undefined;
        return {
            zebraId: zebra.zebraId,
            zebraCode: zebra.zebraCode,
            zebraNo: zebra.zebraNo,
            employeeCode: zebra.employeeCode,
            employeeName: zebra.employeeName,
        };
    }, [zebraData]);

    const recipientTypeId = formik.values.documentRecipientTypeId;
    const isServiceProviderDisabled = recipientTypeId === DocumentRecipientType.Pivot;
    const isCarOwnerDisabled =
        recipientTypeId === DocumentRecipientType.WalkIn || recipientTypeId === DocumentRecipientType.Pivot;

    // ── สลับประเภท : ทำเฉพาะตอนค่าเปลี่ยนจริง (เทียบ prev) — ตอน remount กลับจาก Step ถัดไป ค่าที่ restore
    // จาก Redux ต้องไม่ถูกทับ ──
    const prevRecipientTypeId = useRef(recipientTypeId);
    useEffect(() => {
        const prev = prevRecipientTypeId.current;
        if (prev === recipientTypeId) return;
        prevRecipientTypeId.current = recipientTypeId;

        const values = formik.values;
        const leavingWalkOut = prev === DocumentRecipientType.WalkOut;
        const walkOutCarOwner = leavingWalkOut ? pickCarOwner(values) : values.walkOutCarOwner;

        let provider: ServiceProviderValues | undefined;
        let carOwner: CarOwnerValues;
        switch (recipientTypeId) {
            case DocumentRecipientType.WalkOut:
                provider = loginProvider;
                carOwner = walkOutCarOwner ?? EMPTY_CAR_OWNER;
                break;
            case DocumentRecipientType.WalkIn:
                provider = loginProvider;
                carOwner = officeCarOwner ?? EMPTY_CAR_OWNER;
                break;
            case DocumentRecipientType.Pivot:
                provider = officeProvider;
                carOwner = officeCarOwner ?? EMPTY_CAR_OWNER;
                break;
            default:
                provider = undefined;
                carOwner = pickCarOwner(values);
        }

        formik.setValues(
            {
                ...values,
                ...(provider ?? {}),
                ...carOwner,
                walkOutCarOwner,
            },
            false
        );
    }, [recipientTypeId]);

    // ── ช่องที่ปิดแก้ไขต้องเป็น "000 - คุณสำนักงาน" เสมอ — รองรับกรณี Master โหลดมาไม่ทันตอนสลับประเภท ──
    useEffect(() => {
        const values = formik.values;
        let next: Partial<DocumentRecipientFields> | undefined;
        if (isCarOwnerDisabled && officeCarOwner && values.zebraId !== officeCarOwner.zebraId) {
            next = { ...officeCarOwner };
        }
        if (
            isServiceProviderDisabled &&
            officeProvider &&
            values.serviceProviderId !== officeProvider.serviceProviderId
        ) {
            next = { ...next, ...officeProvider };
        }
        if (next) formik.setValues({ ...values, ...next }, false);
    }, [isCarOwnerDisabled, isServiceProviderDisabled, officeCarOwner, officeProvider]);

    return { isServiceProviderDisabled, isCarOwnerDisabled };
};

export default useDocumentRecipientRules;
