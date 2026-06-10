import dayjs, { Dayjs } from "dayjs";

export interface ClaimHistoryItem {
    claimNo: string;
    chiefComplain: string;
    incidentDate: Dayjs;
    totalClaim: number;
    totalPaid: number;
}

export const mockClaimHistory: ClaimHistoryItem[] = [
    {
        claimNo: "CL01",
        chiefComplain: "ปวดท้องเฉียบพลัน",
        incidentDate: dayjs(),
        totalClaim: 500,
        totalPaid: 500,
    },
    {
        claimNo: "CL01",
        chiefComplain: "ลำไส้อักเสบจากเชื้อโรตาไวรัส",
        incidentDate: dayjs(),
        totalClaim: 22581.1,
        totalPaid: 22581.1,
    },
    {
        claimNo: "CL01",
        chiefComplain: "โดนแมวข่วน",
        incidentDate: dayjs(),
        totalClaim: 1800,
        totalPaid: 1800,
    },
    {
        claimNo: "CL02",
        chiefComplain: "ไข้หวัดใหญ่",
        incidentDate: dayjs(),
        totalClaim: 3200,
        totalPaid: 2800,
    },
];
