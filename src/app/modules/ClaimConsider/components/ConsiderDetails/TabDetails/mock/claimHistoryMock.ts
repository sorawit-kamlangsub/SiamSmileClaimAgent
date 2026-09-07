/**
 * Mock data สำหรับแท็บ "ประวัติการเคลม" (หน้าพิจารณาเคลมลูกค้า)
 *
 * ยังไม่ได้เชื่อม API จริง — โครงสร้าง type/ฟังก์ชันด้านล่างตั้งใจทำให้เหมือนผลลัพธ์จาก
 * React Query hook จริง (envelope `{ data, isSuccess, totalAmountRecords }` ตาม convention
 * ของโปรเจค) เพื่อให้ภายหลังแค่เปลี่ยน `fetchMockClaimHistory` เป็น axios call จริงใน
 * src/app/api/coreClaimApi.ts แล้วสลับ hook ใน useClaimHistoryTab.ts จุดเดียวพอ
 */

export type ClaimHistoryStatus = "Open" | "Re-Open" | "Closed";

export interface ClaimHistoryItem {
    claimId: string;
    claimNo: string;
    /** เหตุของการเคลม */
    incidentTypeName: string;
    /** ประเภทความคุ้มครอง */
    coverageTypeName: string;
    /** ประเภทการรักษา */
    medicalTypeName: string;
    hospitalName: string;
    chiefComplaint: string;
    /** คำวินิจฉัย1 (Diagnosis1) */
    diagnosis1: string;
    /** ISO date string */
    incidentDate: string;
    isContinuousClaim: boolean;
    claimStatus: ClaimHistoryStatus;
    /** ยอดเบิก */
    claimAmount: number;
    /** จ่ายจริง */
    paidAmount: number;
    /** ปีกรมธรรม์ (พ.ศ.) สำหรับคอลัมน์ "ครั้งที่ OPD" — undefined เมื่อไม่ใช่ OPD */
    opdPolicyYear?: number;
    /** ลำดับครั้งที่ใช้สิทธิ OPD ในปีกรมธรรม์นั้น */
    opdSeq?: number;
}

export interface ClaimHistorySummary {
    /** จำนวนรายการเคลมย้อนหลังทั้งหมด */
    totalCount: number;
    /** OPD คงเหลือในปีกรมธรรม์ปัจจุบัน (ครั้ง) */
    opdRemaining: number;
    /** จำนวนรายการที่เป็นเคลมต่อเนื่อง */
    continuousCount: number;
    /** ยอดเบิกสะสมในปีกรมธรรม์ปัจจุบัน (บาท) */
    accumulatedClaimAmount: number;
}

export interface ClaimHistoryListServiceResponse {
    data: ClaimHistoryItem[];
    isSuccess: boolean;
    totalAmountRecords: number;
}

const MOCK_CLAIM_HISTORY_ITEMS: ClaimHistoryItem[] = [
    {
        claimId: "cl6807000123",
        claimNo: "CL6807000123",
        incidentTypeName: "เจ็บป่วย",
        coverageTypeName: "สามัญ",
        medicalTypeName: "IPD",
        hospitalName: "รพ.กรุงเทพ",
        chiefComplaint: "ปวดท้องรุนแรง",
        diagnosis1: "ไส้ติ่งอักเสบเฉียบพลัน",
        incidentDate: "2024-05-15",
        isContinuousClaim: false,
        claimStatus: "Closed",
        claimAmount: 45000,
        paidAmount: 45000,
    },
    {
        claimId: "cl6807000124",
        claimNo: "CL6807000124",
        incidentTypeName: "เจ็บป่วย",
        coverageTypeName: "สามัญ",
        medicalTypeName: "OPD",
        hospitalName: "รพ.สมิติเวช สุขุมวิท",
        chiefComplaint: "ไอ เจ็บคอ มีไข้",
        diagnosis1: "หลอดลมอักเสบเฉียบพลัน",
        incidentDate: "2024-05-12",
        isContinuousClaim: false,
        claimStatus: "Open",
        claimAmount: 1200,
        paidAmount: 0,
        opdPolicyYear: 2567,
        opdSeq: 1,
    },
    {
        claimId: "cl6807000125",
        claimNo: "CL6807000125",
        incidentTypeName: "อุบัติเหตุ",
        coverageTypeName: "สามัญ",
        medicalTypeName: "OPD",
        hospitalName: "รพ.บำรุงราษฎร์",
        chiefComplaint: "ปวดศีรษะ มึนศีรษะ",
        diagnosis1: "ไมเกรน",
        incidentDate: "2024-05-10",
        isContinuousClaim: false,
        claimStatus: "Closed",
        claimAmount: 2500,
        paidAmount: 2500,
        opdPolicyYear: 2567,
        opdSeq: 1,
    },
    {
        claimId: "cl6807000126",
        claimNo: "CL6807000126",
        incidentTypeName: "เจ็บป่วย",
        coverageTypeName: "สามัญ",
        medicalTypeName: "OPD",
        hospitalName: "รพ.พญาไท 2",
        chiefComplaint: "ปวดเมื่อยกล้ามเนื้อหลัง",
        diagnosis1: "กล้ามเนื้ออักเสบ",
        incidentDate: "2024-05-08",
        isContinuousClaim: true,
        claimStatus: "Re-Open",
        claimAmount: 1800,
        paidAmount: 1200,
        opdPolicyYear: 2567,
        opdSeq: 2,
    },
    {
        claimId: "cl6807000127",
        claimNo: "CL6807000127",
        incidentTypeName: "เจ็บป่วย",
        coverageTypeName: "สามัญ",
        medicalTypeName: "OPD",
        hospitalName: "รพ.ศิริราช ปิยมหาราชการุณย์",
        chiefComplaint: "ปวดท้อง จุกเสียด",
        diagnosis1: "กระเพาะอาหารอักเสบ",
        incidentDate: "2024-05-05",
        isContinuousClaim: false,
        claimStatus: "Open",
        claimAmount: 1500,
        paidAmount: 0,
        opdPolicyYear: 2567,
        opdSeq: 3,
    },
    {
        claimId: "cl6807000128",
        claimNo: "CL6807000128",
        incidentTypeName: "อุบัติเหตุ",
        coverageTypeName: "สามัญ",
        medicalTypeName: "IPD",
        hospitalName: "รพ.พระรามเก้า",
        chiefComplaint: "แน่นหน้าอก หายใจไม่สะดวก",
        diagnosis1: "หลอดเลือดหัวใจตีบ",
        incidentDate: "2024-05-02",
        isContinuousClaim: false,
        claimStatus: "Closed",
        claimAmount: 120000,
        paidAmount: 100000,
    },
    {
        claimId: "cl6807000129",
        claimNo: "CL6807000129",
        incidentTypeName: "เจ็บป่วย",
        coverageTypeName: "สามัญ",
        medicalTypeName: "OPD",
        hospitalName: "รพ.เวชธานี",
        chiefComplaint: "ผื่นคันตามผิวหนัง",
        diagnosis1: "ผื่นแพ้ผิวหนัง",
        incidentDate: "2024-04-28",
        isContinuousClaim: false,
        claimStatus: "Closed",
        claimAmount: 950,
        paidAmount: 0,
        opdPolicyYear: 2567,
        opdSeq: 1,
    },
    {
        claimId: "cl6807000130",
        claimNo: "CL6807000130",
        incidentTypeName: "เจ็บป่วย",
        coverageTypeName: "สามัญ",
        medicalTypeName: "OPD",
        hospitalName: "รพ.บางปะกอก 1",
        chiefComplaint: "ปวดข้อเข่า",
        diagnosis1: "ข้อเข่าเสื่อม",
        incidentDate: "2024-04-25",
        isContinuousClaim: true,
        claimStatus: "Re-Open",
        claimAmount: 3300,
        paidAmount: 2700,
        opdPolicyYear: 2567,
        opdSeq: 3,
    },
];

/** ปั๊มข้อมูลซ้ำให้ครบ 42 รายการ (ตามตัวเลขใน mock ของสรุปด้านบน) เพื่อโชว์ pagination ทำงานจริง */
const buildMockItems = (): ClaimHistoryItem[] => {
    const items: ClaimHistoryItem[] = [];
    const total = 42;
    for (let i = 0; i < total; i++) {
        const base = MOCK_CLAIM_HISTORY_ITEMS[i % MOCK_CLAIM_HISTORY_ITEMS.length];
        const seq = total - i;
        items.push({
            ...base,
            claimId: `${base.claimId}-${seq}`,
            claimNo: `CL680700${String(1230 - i).padStart(4, "0")}`,
        });
    }
    return items;
};

export const MOCK_CLAIM_HISTORY_ITEMS_FULL = buildMockItems();

export const MOCK_CLAIM_HISTORY_SUMMARY: ClaimHistorySummary = {
    totalCount: MOCK_CLAIM_HISTORY_ITEMS_FULL.length,
    opdRemaining: 8,
    continuousCount: MOCK_CLAIM_HISTORY_ITEMS_FULL.filter((item) => item.isContinuousClaim).length,
    accumulatedClaimAmount: 175250,
};

/**
 * จำลองการเรียก API แบบ server-side search/sort/pagination — รับพารามิเตอร์เหมือน query
 * ที่ API จริงน่าจะรับ (searchText/sortBy/page/pageSize) แล้วกรอง/เรียง/ตัดหน้าให้จากข้อมูล mock
 * ในเมมโมรี เพื่อให้ตอนเปลี่ยนไปเรียก API จริง ฝั่ง caller (useClaimHistoryTab) ไม่ต้องแก้ logic เลย
 */
export const fetchMockClaimHistory = (params: {
    searchText: string;
    sortBy: "incidentDate" | "claimNo" | "claimAmount";
    page: number;
    pageSize: number;
}): ClaimHistoryListServiceResponse => {
    const keyword = params.searchText.trim().toLowerCase();

    const filtered = keyword
        ? MOCK_CLAIM_HISTORY_ITEMS_FULL.filter(
              (item) =>
                  item.claimNo.toLowerCase().includes(keyword) || item.hospitalName.toLowerCase().includes(keyword)
          )
        : MOCK_CLAIM_HISTORY_ITEMS_FULL;

    const sorted = [...filtered].sort((a, b) => {
        switch (params.sortBy) {
            case "claimNo":
                return b.claimNo.localeCompare(a.claimNo);
            case "claimAmount":
                return b.claimAmount - a.claimAmount;
            case "incidentDate":
            default:
                return new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime();
        }
    });

    const start = (params.page - 1) * params.pageSize;
    const pageItems = sorted.slice(start, start + params.pageSize);

    return {
        data: pageItems,
        isSuccess: true,
        totalAmountRecords: sorted.length,
    };
};
