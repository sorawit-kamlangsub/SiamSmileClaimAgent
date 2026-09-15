import dayjs, { Dayjs } from "dayjs";
import { ClaimTypeOption } from "../../CreatedClaim/components/CreateClaim/ClaimTypeSelector";
import {
    ClaimEditDraftCaseItemPayloadDto,
    ClaimEditDraftPayloadDto,
    GetIncidentTypeMappingDtoResponse,
    TimeSpan,
} from "../../../api/coreClaimApi.client";
import { ClaimConsiderValues, ClaimExpenseItem } from "./claimConsiderSlice";

/**
 * TimeSpan จาก NSwag พิมพ์เป็น object แต่ backend ส่งจริงเป็น string "HH:mm:ss" เสมอ (ดู asTimeSpan
 * ฝั่งส่งใน ClaimDetailActionHook.tsx ที่ cast กลับด้าน) ห้ามใช้ dayjs(str, "HH:mm:ss") เพราะโปรเจกต์นี้
 * ไม่เคย extend customParseFormat เลย — dayjs จะ parse ไม่ออกและคืน Invalid Date เงียบๆ จึงแยก ":" เอง
 */
export const parseTimeSpan = (time: TimeSpan | string | undefined): Dayjs | undefined => {
    if (!time) return undefined;
    const [h, m, s] = String(time as unknown as string).split(":");
    const hour = Number(h);
    const minute = Number(m);
    const second = Number(s ?? 0);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return undefined;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined; // กัน .NET "1.00:00:00" (เกิน 1 วัน)
    return dayjs()
        .hour(hour)
        .minute(minute)
        .second(Number.isInteger(second) ? second : 0)
        .millisecond(0);
};

/** field วันที่ใน response พิมพ์เป็น Dayjs แต่ NSwag client ไม่ revive JSON เลย จึงเป็น ISO string จริงเสมอ */
const asDate = (value: Dayjs | string | undefined): Dayjs | undefined => {
    if (!value) return undefined;
    const parsed = dayjs(value as unknown as string);
    return parsed.isValid() ? parsed : undefined;
};

type MapDraftArgs = {
    payload: ClaimEditDraftPayloadDto;
    incidentType: ClaimTypeOption[];
    coverageType: ClaimTypeOption[];
    mappingData: GetIncidentTypeMappingDtoResponse[];
};

/**
 * map payload ของ "บันทึกแบบร่าง" (ClaimEditDraftPayloadDto) กลับเข้า ClaimConsiderValues
 * เขียนเฉพาะ field ที่ payload มีค่าจริง เพื่อไม่ให้ undefined ไปล้างค่าที่ phase-1 sync มาจาก detail แล้ว
 */
export const mapDraftPayloadToFormValues = ({
    payload,
    incidentType,
    coverageType,
    mappingData,
}: MapDraftArgs): Partial<ClaimConsiderValues> => {
    const values: Partial<ClaimConsiderValues> = {};
    const c = payload.case;

    if (payload.incidentTypeId !== undefined) {
        values.incidentTypeId = payload.incidentTypeId;
        values.incidentTypeName = incidentType.find((i) => i.id === payload.incidentTypeId)?.name;
    }
    if (c?.coverageTypeId !== undefined) {
        values.coverageTypeId = c.coverageTypeId;
        values.coverageTypeName = coverageType.find((i) => i.id === c.coverageTypeId)?.name;
    }
    if (c?.medicalTypeId !== undefined) {
        values.medicalTypeId = c.medicalTypeId;
        // ห้ามใช้ medicalType ที่ derive ไว้ใน ConsiderDetailHook เพราะมันกรองด้วย coverageTypeId ตัว
        // เก่าที่ยังอยู่ใน formik ณ ตอนคำนวณ — resolve จาก mappingData ตรงๆ แบบเดียวกับ phase-1
        const found = mappingData.find(
            (item) =>
                item.medicalTypeId === c.medicalTypeId &&
                item.incidentTypeId === payload.incidentTypeId &&
                item.coverageTypeId === c.coverageTypeId
        );
        values.medicalTypeName =
            found?.medicalTypeCode ?? mappingData.find((i) => i.medicalTypeId === c.medicalTypeId)?.medicalTypeCode;
    }

    const incidentDate = asDate(payload.incidentDate ?? c?.occurrenceDate);
    if (incidentDate) values.incidentDate = incidentDate;
    const incidentTime = parseTimeSpan(payload.incidentTime ?? c?.occurrenceTime);
    if (incidentTime) values.incidentTime = incidentTime;

    const admissionDate = asDate(c?.admissionDate);
    if (admissionDate) values.admissionDate = admissionDate;
    const admissionTime = parseTimeSpan(c?.admissionTime);
    if (admissionTime) values.admissionTime = admissionTime;

    const dischargeDate = asDate(c?.dischargeDate);
    if (dischargeDate) values.dischargeDate = dischargeDate;
    const dischargeTime = parseTimeSpan(c?.dischargeTime);
    if (dischargeTime) values.dischargeTime = dischargeTime;

    const documentCompleteDate = asDate(c?.caseAssessment?.documentCompleteDate);
    if (documentCompleteDate) values.documentCompleteDate = documentCompleteDate;

    if (c?.hospitalId !== undefined) values.hospitalId = c.hospitalId;
    if (c?.chiefComplaintId !== undefined) values.chiefComplaintId = c.chiefComplaintId;
    if (payload.accidentPlace !== undefined) values.accidentPlace = payload.accidentPlace;
    if (payload.accidentDescription !== undefined) values.detail = payload.accidentDescription;

    if (c?.icD10_1stId !== undefined || c?.icD10_2ndId !== undefined || c?.icD10_3rdId !== undefined) {
        values.diagnoses = [
            { icd10Id: c?.icD10_1stId ?? undefined, icd10Detail: undefined },
            { icd10Id: c?.icD10_2ndId ?? undefined, icd10Detail: undefined },
            { icd10Id: c?.icD10_3rdId ?? undefined, icd10Detail: undefined },
        ];
    }

    const adjudication = c?.caseAdjudication;
    if (adjudication?.decisionId !== undefined) values.considerResult = adjudication.decisionId;
    if (adjudication?.decisionReasonId !== undefined) values.decisionReasonId = adjudication.decisionReasonId;
    if (adjudication?.decisionRemark !== undefined) values.decisionReasonDetail = adjudication.decisionRemark;
    if (adjudication?.approvedIPDDayCount !== undefined) values.ipdDays = adjudication.approvedIPDDayCount;
    if (adjudication?.approvedICUDayCount !== undefined) values.icuDays = adjudication.approvedICUDayCount;

    return values;
};

type CategoryLeaf = {
    inputToStandardMappingId?: number;
    standardMedicalExpenseId?: number;
    code: string;
    label: string;
    maximumLimit?: number;
    bodyPartId?: number;
};

const draftItemKey = (i: { inputToStandardMappingId?: number; standardMedicalExpenseId?: number }) =>
    `${i.inputToStandardMappingId ?? 0}|${i.standardMedicalExpenseId ?? 0}`;

/**
 * merge ยอดจาก caseItem[] ของแบบร่างทับ "รายการที่ใช้บ่อย" (frequentItems) แทนการสร้างใหม่จากศูนย์
 * เพราะ caseItem ของแบบร่างไม่มี code/description/color/maximumLimit/bodyPartId — ถ้าสร้างใหม่ล้วนๆ
 * แถวจะไม่มีชื่อ/สี/เพดานให้แสดง
 *
 * ห้าม match ด้วย caseItemId: ฝั่ง save (ClaimDetailActionHook.tsx) generate uuid ตัวเดียวแล้วใส่ซ้ำทุก
 * แถว ทำให้ caseItemId ในแบบร่างไม่ unique — ต้อง match ด้วย inputToStandardMappingId+standardMedicalExpenseId
 */
export const mergeDraftCaseItems = (
    frequentItems: ClaimExpenseItem[],
    draftItems: ClaimEditDraftCaseItemPayloadDto[],
    categoryLeaves: CategoryLeaf[]
): ClaimExpenseItem[] => {
    const queueByKey = new Map<string, ClaimEditDraftCaseItemPayloadDto[]>();
    draftItems.forEach((item) => {
        const key = draftItemKey(item);
        const queue = queueByKey.get(key) ?? [];
        queue.push(item);
        queueByKey.set(key, queue);
    });

    const merged = frequentItems.map((master): ClaimExpenseItem => {
        const key = draftItemKey(master);
        const queue = queueByKey.get(key);
        const draftItem = queue?.shift();

        if (!draftItem) {
            // แถวนี้ไม่มีในแบบร่าง = ผู้ใช้ไม่ได้กรอกตอนทำร่าง ล้างยอดทิ้งแต่คงแถวไว้ให้เห็น
            return { ...master, claimAmount: undefined, discount: undefined, notCovered: undefined, reason: undefined };
        }

        const notCovered = draftItem.nonCoveredAmount || undefined;
        return {
            ...master,
            claimAmount: draftItem.originalAmount || undefined,
            discount: draftItem.discountAmount || undefined,
            notCovered,
            // forward mapper เขียน DEFAULT_NON_COVERED_REASON_ID (1) ลงทุกแถวแม้ nonCoveredAmount = 0
            // ต้อง guard ไม่งั้นทุกแถวจะโชว์ "สาเหตุไม่คุ้มครอง" มั่วและกระทบ validation ตอนกดถัดไป
            reason: notCovered ? draftItem.nonCoveredReasonId || undefined : undefined,
        };
    });

    const leftoverRows: ClaimExpenseItem[] = [];
    let extraIdx = 0;
    queueByKey.forEach((queue) => {
        queue.forEach((draftItem) => {
            const leaf = categoryLeaves.find(
                (l) =>
                    l.inputToStandardMappingId === draftItem.inputToStandardMappingId &&
                    l.standardMedicalExpenseId === draftItem.standardMedicalExpenseId
            );
            const notCovered = draftItem.nonCoveredAmount || undefined;
            leftoverRows.push({
                // id ต้อง deterministic ไม่ชนกับ index-based id ของ frequentItems (0..n) — ไม่ใช้ Date.now()
                // เพราะเปลี่ยนค่าทุกครั้งที่ merge effect รันซ้ำ (จะกลายเป็นแถวใหม่ทุกรอบ)
                id: 1_000_000 + extraIdx++,
                standardMedicalExpenseId: draftItem.standardMedicalExpenseId,
                inputToStandardMappingId: draftItem.inputToStandardMappingId,
                caseItemId: draftItem.caseItemId,
                code: leaf?.code ?? "",
                description: leaf ? leaf.label.replace(leaf.code, "").trim() : "-",
                claimAmount: draftItem.originalAmount || undefined,
                discount: draftItem.discountAmount || undefined,
                notCovered,
                reason: notCovered ? draftItem.nonCoveredReasonId || undefined : undefined,
                disabled: false,
                maximumLimit: leaf?.maximumLimit,
                bodyPartId: leaf?.bodyPartId,
            });
        });
    });

    return [...merged, ...leftoverRows];
};
