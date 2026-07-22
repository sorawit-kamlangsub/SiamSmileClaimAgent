import dayjs from "dayjs";
import { GetClaimContinueDtoResponse } from "../../../api/coreClaimApi.client";

// TODO: ไฟล์นี้ไว้ทดสอบ UI เฉยๆ ลบทิ้งหรือ disable การใช้งานตอนต่อ backend จริงแล้ว
export const mockClaimContinueData: GetClaimContinueDtoResponse[] = [
    {
        claimId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        claimNo: "CLPA6904000193",
        incidentDate: dayjs("2026-03-25"),
        admissionDate: dayjs("2026-03-25"),
        chiefComplaint: "ไข้ + ปวดท้อง",
        chiefComplaintCustom: undefined,
        icD10Detail: "W540 : Bitten or struck by dog: at home | ถูกสุนัขกัดหรือทำร้าย ที่บ้าน",
        totalCaseAmount: 500.0,
        totalPaidAmount: 500.0,
        claimDetail: "อุบัติเหตุ / ค่ารักษา / OPD",
        remainAmount: 3200.0,
        totalCount: 2,
    },
    {
        claimId: "9c3b1a2e-4f6d-4a1b-8e2f-1a2b3c4d5e6f",
        claimNo: "CLPA6904000021",
        incidentDate: dayjs("2026-03-16"),
        admissionDate: dayjs("2026-03-16"),
        chiefComplaint: "สุนัขกัด",
        chiefComplaintCustom: undefined,
        icD10Detail: "W540 : Bitten or struck by dog: at home | ถูกสุนัขกัดหรือทำร้าย ที่บ้าน",
        totalCaseAmount: 1800.0,
        totalPaidAmount: 1800.0,
        claimDetail: "อุบัติเหตุ / ค่ารักษา / OPD",
        remainAmount: 1800.0,
        totalCount: 2,
    },
];