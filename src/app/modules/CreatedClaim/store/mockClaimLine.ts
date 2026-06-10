import { ClaimLineInsured } from "../store/claimLineSlice";

export const REASON_OPTIONS = [
    { value: "", label: "----------" },
    { value: "1", label: "ไม่คุ้มครอง" },
    { value: "2", label: "เกินวงเงิน" },
    { value: "3", label: "ไม่ตรงเงื่อนไข" },
    { value: "4", label: "รอเอกสารเพิ่มเติม" },
];

export interface TreatmentTypeOption {
    CaseTypeId: number;
    CaseTypeName: string;
}

export const TREATMENT_TYPE_OPTIONS: TreatmentTypeOption[] = [
    { CaseTypeId: 2, CaseTypeName: "IPD" },
    { CaseTypeId: 3, CaseTypeName: "OPD" },
    { CaseTypeId: 4, CaseTypeName: "DAY_Surgery" },
    { CaseTypeId: 5, CaseTypeName: "DeathCase" },
    { CaseTypeId: 6, CaseTypeName: "Disability" },
];

export const CONTINUOUS_CLAIM_OPTIONS = [
    { value: "CL2024001", label: "CL2024001 - 01/03/2567" },
    { value: "CL2024002", label: "CL2024002 - 15/03/2567" },
];

export const mockInsuredSearchResults: ClaimLineInsured[] = [
    {
        appId: "9199293",
        prefix: "เด็กชาย",
        firstName: "ชลชาติ",
        lastName: "รุกขชาติ",
        nationalId: "1-6299-00964-54-6",
        plan: "502-Silver+",
        status: "ปกติ",
        startCoverDate: "2017-05-01",
        cancelDate: "",
        company: "บริษัท อาคเนย์ประกันภัย จำกัด(มหาชน)",
    },
    {
        appId: "9199293-P30-01",
        prefix: "เด็กชาย",
        firstName: "ชลชาติ",
        lastName: "รุกขชาติ",
        nationalId: "1-6299-00964-54-6",
        plan: "P30",
        status: "ปกติ",
        startCoverDate: "2017-05-01",
        cancelDate: "",
        company: "บริษัท อาคเนย์ประกันภัย จำกัด(มหาชน)",
    },
];

// export const TREATMENT_TYPE_OPTIONS = [
//     { CaseTypeId: "1", CaseTypeName: "ผู้ป่วยใน (IPD)" },
//     { CaseTypeId: "2", CaseTypeName: "ผู้ป่วยนอก (OPD)" },
//     { CaseTypeId: "3", CaseTypeName: "อุบัติเหตุ" },
//     { CaseTypeId: "4", CaseTypeName: "ผ่าตัด" },
// ];

// export const CONTINUOUS_CLAIM_OPTIONS = [
//     { value: "CLM-2025-0001", label: "CLM-2025-0001" },
//     { value: "CLM-2025-0002", label: "CLM-2025-0002" },
//     { value: "CLM-2025-0003", label: "CLM-2025-0003" },
// ];

export const NOT_COVERED_REASON_OPTIONS = [
    { value: "1", label: "เกินสิทธิ์" },
    { value: "2", label: "ไม่อยู่ในความคุ้มครอง" },
    { value: "3", label: "โรคเดิม" },
    { value: "4", label: "อื่นๆ" },
];

// รายการค่ารักษาที่ใช้บ่อย (เส้นบน)
export const MOCK_FREQUENT_ITEMS = [
    {
        id: 0,
        code: "1.14",
        description: "ค่าบริการทางการพยาบาล-ผดุงครรภ์",
        claimAmount: "",
        discount: "",
        notCovered: "",
        reason: "",
        remark: "",
        color: "#FFD6D6",
        disabled: false,
    },
    {
        id: 1,
        code: "1.28",
        description: "ค่าผู้ประกอบวิชาชีพเวชกรรม ตรวจรักษาทั่วไป",
        claimAmount: "",
        discount: "",
        notCovered: "",
        reason: "",
        remark: "",
        color: "#FFD6D6",
        disabled: false,
    },
];

// หมวดรายการค่ารักษาเพิ่มเติม
export const MOCK_TREATMENT_CATEGORIES = [
    {
        id: 1,
        label: "ค่ารักษาพยาบาลทางการแพทย์",
        icon: "medical",
        children: [
            {
                id: 11,
                label: "1.1 ยาและสารอาหารทางหลอดเลือด",
                children: [],
            },
            {
                id: 12,
                label: "1.2 เวชภัณฑ์และอุปกรณ์ช่วยเหลือผู้ป่วย",
                children: [
                    { id: 121, label: "1.2.1 บัญชีเวชภัณฑ์ 1", children: [] },
                    {
                        id: 122,
                        label: "1.2.2 บัญชีเวชภัณฑ์ 2",
                        children: [
                            { id: 1221, label: "1.2.2.1 อุปกรณ์ช่วยเดินหรือช่วยเคลื่อนที่", children: [] },
                            { id: 1222, label: "1.2.2.3 เก้าอี้รถเข็นสำหรับคนพิการหรือผู้พิการ", children: [] },
                            { id: 1223, label: "1.2.2.4 เครื่องช่วยหายใจ อุปกรณ์ออกซิเจน", children: [] },
                            { id: 1224, label: "1.2.2.5 แว่นตา คอนแทคเลนส์ เลนส์แว่นตา", children: [] },
                            { id: 1225, label: "1.2.2.6 เครื่องช่วยฟัง", children: [] },
                            { id: 1226, label: "1.2.3 บัญชีเวชภัณฑ์ 3", children: [] },
                            { id: 1227, label: "1.2.4 ค่าเวชภัณฑ์อื่นๆ", children: [] },
                        ],
                    },
                ],
            },
            { id: 13, label: "1.3 โลหิตและผลิตภัณฑ์จากเลือด", children: [] },
        ],
    },
    { id: 2, label: "การตรวจวินิจฉัย", icon: "lab", children: [] },
    { id: 3, label: "การผ่าตัด", icon: "surgery", children: [] },
    { id: 4, label: "ทันตกรรม", icon: "dental", children: [] },
    { id: 5, label: "บริการวิชาชีพและการดูแล", icon: "care", children: [] },
    { id: 6, label: "อุปกรณ์เฉพาะทาง", icon: "device", children: [] },
    { id: 7, label: "แพทย์ทางเลือก", icon: "alt", children: [] },
    { id: 8, label: "บริการเหมาจ่าย", icon: "package", children: [] },
    { id: 9, label: "ค่าบริการโรงพยาบาล", icon: "hospital", children: [] },
    { id: 10, label: "ค่าแพทย์", icon: "doctor", children: [] },
    { id: 11, label: "ค่าห้องและสิ่งอำนวยความสะดวก", icon: "room", children: [] },
    { id: 12, label: "ขนส่งและบริการพิเศษ", icon: "transport", children: [] },
    { id: 13, label: "บริการทั่วไป", icon: "general", children: [] },
];
