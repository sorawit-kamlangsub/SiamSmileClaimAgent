import dayjs, { Dayjs } from "dayjs";
import { GetCustomerDetailByIdDtoResponse, GetCustomerSearchDtoResponse } from "../../../api/coreClaimApi.client";
import { CoverageType, safeAtob } from "../../../functionHelpers";
import { calcIpdDays } from "../hooks/useDaysCalculate";
import { ClaimSimulatePrefill } from "./claimSimulateSlice";

// FormatTypeId: 2 = SSS, 3 = Disability, 4 = Death, 6 = SIM B2 (ค่า default ของหน้าคำนวณวงเงินเคลม)
const FORMAT_TYPE_BY_COVERAGE: Record<number, number> = {
    [CoverageType.Medical]: 6,
    [CoverageType.Compensate]: 2,
    [CoverageType.Disability]: 3,
    [CoverageType.Death]: 4,
};

/** ชื่อ query string ของหน้า /claim-simulation ที่ใช้ส่งค่าเริ่มต้น */
export const CLAIM_SIMULATE_PREFILL_PARAM = "prefill";

const DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";

/**
 * prefill ชุดล่าสุดที่ใส่ลง Redux แล้ว — เก็บระดับ module (ไม่ใช่ state) เพราะต้องรอดการ unmount/remount ของหน้า
 * คำนวณตอนไปหน้าสรุปแล้วกดกลับ ไม่งั้นจะใส่ prefill ซ้ำแล้วล้างรายการค่ารักษาที่ผู้ใช้กรอกไว้ทิ้ง
 * ล้างเมื่อออกจากเมนูคำนวณวงเงินเคลม (ClaimSimulateLayout — พร้อมกับ Redux) และตอน refresh (module โหลดใหม่)
 */
let lastAppliedPrefill: string | null = null;
export const getAppliedClaimSimulatePrefill = () => lastAppliedPrefill;
export const setAppliedClaimSimulatePrefill = (encoded: string | null) => {
    lastAppliedPrefill = encoded;
};
export const clearAppliedClaimSimulatePrefill = () => {
    lastAppliedPrefill = null;
};

/**
 * DFUAT-083 : ข้อมูล App + ข้อมูลเคลมที่กรอกในหน้าแจ้งเคลม ส่งต่อให้หน้า "คำนวณวงเงินเคลม" ผ่าน URL
 * (เปิดเป็น tab ใหม่ จึงใช้ Redux ของ tab เดิมไม่ได้ และต้องอยู่รอดตอน refresh) — เก็บเฉพาะ id / วันที่
 * ข้อมูลผู้เอาประกันให้หน้าคำนวณโหลดเองจาก customerDetailId
 */
export type ClaimSimulatePrefillParams = {
    customerDetailId: string | undefined;
    incidentTypeId: number | undefined;
    coverageTypeId: number | undefined;
    medicalTypeId: number | undefined;
    causeOfIncidentId: number | undefined;
    /** วันที่เป็น string รูปแบบ YYYY-MM-DDTHH:mm:ss */
    incidentDate: string | undefined;
    admissionDate: string | undefined;
    dischargeDate: string | undefined;
    isContinuous: boolean;
    /** claimId ของเคลมเดิม (เคลมต่อเนื่อง) — ตัวเลือก "ต่อเนื่องจากเคลม" ของหน้าคำนวณจับคู่ด้วย claimId */
    continuousFromClaimId: string | undefined;
};

export const formatPrefillDate = (date: Dayjs | undefined): string | undefined =>
    date && dayjs(date).isValid() ? dayjs(date).format(DATE_TIME_FORMAT) : undefined;

const parsePrefillDate = (value: string | undefined): Dayjs | undefined => {
    if (!value) return undefined;
    const date = dayjs(value);
    return date.isValid() ? date : undefined;
};

/** path ของหน้าคำนวณวงเงินเคลม พร้อมค่าเริ่มต้น (btoa แบบเดียวกับ param ของ route แจ้งเคลม) */
export const buildClaimSimulatePath = (params: ClaimSimulatePrefillParams): string =>
    `/claim-simulation?${CLAIM_SIMULATE_PREFILL_PARAM}=${encodeURIComponent(btoa(JSON.stringify(params)))}`;

/** อ่านค่าเริ่มต้นจาก query string — รูปแบบไม่ถูกต้องคืน undefined (เปิดหน้าคำนวณแบบปกติ) */
export const parseClaimSimulatePrefill = (encoded: string | null): ClaimSimulatePrefillParams | undefined => {
    const json = safeAtob(encoded ?? undefined);
    if (!json) return undefined;
    try {
        const parsed: unknown = JSON.parse(json);
        return parsed && typeof parsed === "object" ? (parsed as ClaimSimulatePrefillParams) : undefined;
    } catch {
        return undefined;
    }
};

/**
 * แปลงค่าจาก URL + ข้อมูลผู้เอาประกัน เป็น state เริ่มต้นของหน้า "คำนวณวงเงินเคลม"
 * (ผู้เอาประกัน, เหตุของการเคลม, ประเภทความคุ้มครอง, ประเภทการรักษา, วันที่เกิดเหตุ/เข้า/ออก รพ., เคลมต่อเนื่อง)
 * ค่าเหล่านี้คือค่าที่หน้าคำนวณใช้ยิง /calculate/caseclaim
 */
export const buildClaimSimulatePrefill = (
    params: ClaimSimulatePrefillParams,
    insured: GetCustomerDetailByIdDtoResponse | undefined
): ClaimSimulatePrefill => {
    // หน้าคำนวณเก็บผู้เอาประกันเป็นรูปแบบผลค้นหา (GetCustomerSearchDtoResponse) — หยิบเฉพาะฟิลด์ที่ใช้ร่วมกัน
    const selectedInsured: GetCustomerSearchDtoResponse | null = insured
        ? {
              customerDetailId: insured.customerDetailId,
              cardTypeId: insured.cardTypeId,
              cardDetail: insured.cardDetail,
              customerName: insured.customerName,
              productTypeId: insured.productTypeId,
              productTypeName: insured.productTypeName,
              policyCode: insured.policyCode,
              customerCode: insured.customerCode,
              appStatusId: insured.appStatusId,
              coverageFrom: insured.coverageFrom,
              coverageTo: insured.coverageTo,
              productName: insured.productName,
              mobilePhoneNumber: insured.mobilePhoneNumber,
              productId: insured.productId,
              productCategoryCode: insured.productCategoryCode,
              productCategoryName: insured.productCategoryName,
          }
        : null;

    const admitDate = parsePrefillDate(params.admissionDate);
    const dischargeDate = parsePrefillDate(params.dischargeDate);
    // จำนวนวันนอนคำนวณจากวันที่เข้า/ออก รพ. ด้วยสูตรเดียวกับหน้าคำนวณ (default ลง IPD ทั้งหมด แก้ต่อได้)
    const bedDays = calcIpdDays(admitDate, dischargeDate);
    const isContinuous = params.isContinuous && !!params.continuousFromClaimId;

    return {
        selectedInsured,
        header: {
            claimCause: params.incidentTypeId,
            coverageType: params.coverageTypeId,
            medicalType: params.medicalTypeId,
            causeOfIncident: params.causeOfIncidentId,
            formatTypeId: params.coverageTypeId ? FORMAT_TYPE_BY_COVERAGE[params.coverageTypeId] : undefined,
        },
        daysCalculate: {
            claimCause: params.incidentTypeId,
            coverageType: params.coverageTypeId,
            medicalType: params.medicalTypeId,
            dateHappen: parsePrefillDate(params.incidentDate),
            admitDate,
            dischargeDate,
            ipdDays: bedDays,
            icuDays: 0,
            bedDays,
            isContinuous,
            continuousFromClaimNo: isContinuous ? params.continuousFromClaimId ?? "" : "",
        },
    };
};
