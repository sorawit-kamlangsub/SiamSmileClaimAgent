import { MutableRefObject, useEffect, useRef } from "react";
import { FormikProps } from "formik";
import { useAppSelector } from "../../../../../redux";
import { claimConsiderSelector } from "../../store/claimConsiderSlice";
import { mapDraftPayloadToFormValues } from "../../store/draftRevisionMappers";
import { useGetClaimDetailConsider, useGetClaimEditDraftRevision } from "../../../../api/coreClaimApi";
import { useGetIncidentTypeMapping } from "../../../../api/coreClaimMastersApi";
import { ClaimTypeOption } from "../../../CreatedClaim/components/CreateClaim/ClaimTypeSelector";
import { HospitalConsiderValues } from "./HospitalConsiderDetailHook";

type ClaimDetailConsiderDto = NonNullable<ReturnType<typeof useGetClaimDetailConsider>["data"]>["data"];
type IncidentTypeMappingQueryData = ReturnType<typeof useGetIncidentTypeMapping>["data"];

/**
 * "ดูฉบับร่าง" ของหน้าพิจารณาเคลมโรงพยาบาล — กดจากปุ่มดวงตาใน tab "ประวัติการทำรายการ"
 * (ClaimTransationTab dispatch setViewingDraft เข้า claimConsiderSlice ตัวเดียวกับเคลมลูกค้า)
 *
 * แยกออกมาจาก useHospitalConsiderDetailHook เพราะเป็นฟีเจอร์เสริมที่รันเงื่อนไขซับซ้อนของตัวเอง
 * (ต้องรอ phase 1 sync หลักเสร็จก่อน) แยกแล้วอ่านง่ายกว่ายัดรวมไว้ใน hook เดียว — reuse เฉพาะ
 * mapDraftPayloadToFormValues (ฟิลด์ร่วมกับเคลมลูกค้า) ส่วน hn/an/vn เป็นฟิลด์เฉพาะเคลมโรงพยาบาลที่
 * mapper กลางไม่มี (คืนแค่ ClaimConsiderValues) จึงดึงจาก payload.case เพิ่มเองตรงนี้
 */
const useHospitalDraftViewingHook = (
    formik: FormikProps<HospitalConsiderValues>,
    caseKey: string | undefined,
    detail: ClaimDetailConsiderDto,
    incidentType: ClaimTypeOption[],
    coverageType: ClaimTypeOption[],
    incidentTypeMapping: IncidentTypeMappingQueryData,
    hasSyncedMainRef: MutableRefObject<boolean>,
    hasSyncedMedicalRef: MutableRefObject<boolean>,
    prevIncidentTypeIdRef: MutableRefObject<number | undefined>,
    prevCoverageTypeIdRef: MutableRefObject<number | undefined>
) => {
    const { viewingDraft } = useAppSelector(claimConsiderSelector);
    const draftRevisionId = viewingDraft?.draftRevisionId;
    const { data: draftRevision } = useGetClaimEditDraftRevision(draftRevisionId);

    /** เปลี่ยนเคส : ต้อง apply แบบร่างรอบใหม่ได้อีก แม้ draftRevisionId จะบังเอิญซ้ำกับเคสก่อนหน้า */
    const appliedDraftRevisionIdRef = useRef<string | null>(null);
    const syncedCaseKeyRef = useRef(caseKey);
    if (syncedCaseKeyRef.current !== caseKey) {
        syncedCaseKeyRef.current = caseKey;
        appliedDraftRevisionIdRef.current = null;
    }

    // ---- ทับค่าฟอร์มด้วยข้อมูลจาก "บันทึกแบบร่าง" ----
    // ต้องรันหลัง phase 1 ของ useHospitalConsiderDetailHook เสมอ (เช็ค hasSyncedMainRef.current) —
    // deps คร่อม deps ของ phase 1 ไว้ (detail/incidentType/coverageType) ให้รันซ้ำได้ทั้ง 2 ทาง ไม่ว่า
    // phase 1 จะเสร็จก่อนหรือ draft response จะมาก่อน (pattern เดียวกับ ConsiderDetailHook ฝั่งเคลมลูกค้า)
    useEffect(() => {
        if (!draftRevisionId) return;
        if (appliedDraftRevisionIdRef.current === draftRevisionId) return;
        if (!hasSyncedMainRef.current) return; // phase 1 ต้องลงก่อน ไม่งั้นถูกทับกลับ
        const payload = draftRevision?.data?.payload;
        if (!payload || !incidentTypeMapping?.data) return;

        const draftValues: Partial<HospitalConsiderValues> = mapDraftPayloadToFormValues({
            payload,
            incidentType,
            coverageType,
            mappingData: incidentTypeMapping.data,
        });

        // hn/an/vn : เฉพาะเคลมโรงพยาบาล — mapDraftPayloadToFormValues ไม่มี field พวกนี้
        if (payload.case?.hn !== undefined) draftValues.hn = payload.case.hn;
        if (payload.case?.an !== undefined) draftValues.an = payload.case.an;
        if (payload.case?.vn !== undefined) draftValues.vn = payload.case.vn;

        // diagnoses : mapper กลางคืนแค่ 3 ตำแหน่ง (ฟิลด์ร่วมกับเคลมลูกค้า ที่มีแค่ icD10_1st/2nd/3rdId)
        // แต่ฟอร์มเคลมโรงพยาบาลมี 6 ช่อง ต้องเติมตำแหน่ง 4-6 เอง ไม่งั้น formik.setValues จะทำให้ array
        // สั้นลงเหลือ 3 (ช่อง 4-6 หายไปจาก UI ทันทีที่ดูฉบับร่าง) — ดึงจาก payload.case ตรงๆ เหมือน hn/an/vn
        if (draftValues.diagnoses) {
            draftValues.diagnoses = [
                ...draftValues.diagnoses,
                { icd10Id: payload.case?.icD10_4thId ?? undefined, icd10Detail: undefined },
                { icd10Id: payload.case?.icD10_5thId ?? undefined, icd10Detail: undefined },
                { icd10Id: payload.case?.icD10_6thId ?? undefined, icd10Detail: undefined },
            ];
        }

        // ต้องอัปเดต 2 ref นี้ก่อน setValues ไม่งั้น cascade-reset effect (ใน useHospitalConsiderDetailHook)
        // จะเห็นว่า incident/coverage เปลี่ยนแล้วล้าง coverage/medical ของแบบร่างทิ้งใน commit ถัดไป
        if (draftValues.incidentTypeId !== undefined) prevIncidentTypeIdRef.current = draftValues.incidentTypeId;
        if (draftValues.coverageTypeId !== undefined) prevCoverageTypeIdRef.current = draftValues.coverageTypeId;

        // เคลมโรงพยาบาลมี phase 2 แยกต่างหากที่ sync medicalTypeId/causeOfIncidentId จาก detail (รอ
        // coverageTypeId ก่อน) — ถ้าแบบร่างระบุ medicalTypeId มาแล้วแต่ phase 2 ยังไม่ทันรัน ต้องปัก
        // hasSyncedMedicalRef ไว้เลย ไม่งั้น phase 2 จะรันทีหลังแล้วทับค่าที่เพิ่งใส่จากแบบร่างกลับไปเป็น
        // ของ detail (เคลมลูกค้าไม่มีปัญหานี้เพราะ resolve medicalTypeId ในรอบ phase 1 เดียวจบ)
        if (draftValues.medicalTypeId !== undefined) hasSyncedMedicalRef.current = true;

        formik.setValues((prev) => ({ ...prev, ...draftValues }), false);
        appliedDraftRevisionIdRef.current = draftRevisionId;
    }, [draftRevisionId, draftRevision, incidentType, coverageType, incidentTypeMapping, detail]);
};

export default useHospitalDraftViewingHook;
