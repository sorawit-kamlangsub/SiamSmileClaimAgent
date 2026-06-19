import { OldClaimInfo, BankAccount, ContactInfo } from "../store/claimPHSlice";
import { InsuredInfoPA, SchoolInfo, ClaimInsuredItem } from "../store/claimPASlice";

// ─────────────────────────────────────────────
// PH Mock Data
// ─────────────────────────────────────────────

// export const mockInsuredPH: InsuredInfoPH = {
//     appId: "0003067",
//     customerName: "นางสาวรัชขน สุวรรณโชค",
//     nationalId: "2494029825403",
//     plan: "631",
//     startCoverDate: "2010-09-01",
//     cancelDate: null,
// };

export const mockOldClaim: OldClaimInfo = {
    claimNo: "CL01",
    incidentDate: "2026-03-08",
    diagnosis: "A281.Cat-scratch disease | โดนมาร์จรั่น",
    totalClaim: 1800,
    totalPaid: 1800,
    remainingBudget: 3200,
    remainingCount: 0,
    isHidden: false,
    cases: [
        {
            seq: 1,
            claimCase: "CC01",
            claimType: "OPD",
            chiefComplain: "โดนมาร์จรั่น",
            admitDate: "2026-03-08",
            status: "อนุมัติ",
            claimAmount: 1250,
            paidAmount: 1250,
        },
        {
            seq: 2,
            claimCase: "CC02",
            claimType: "OPD",
            chiefComplain: "แพทย์นัดติดตามอาการ",
            admitDate: "2026-03-09",
            status: "อนุมัติ",
            claimAmount: 550,
            paidAmount: 550,
        },
    ],
};

export const mockBankAccounts: BankAccount[] = [
    {
        id: "1",
        relationship: "ผู้เอาประกัน",
        bankId: 3,
        bankName: "กรุงไทย",
        accountNo: "5281337123",
        accountName: "นางสาวรัชขน สุวรรณโชค",
        isDefault: true,
        isFromMock: true,
    },
];

export const mockContacts: ContactInfo[] = [
    {
        id: "1",
        relationship: "ผู้ชำระเบี้ย",
        phone: "081-2345678",
        name: "นางสาวรัชขน สุวรรณโชค",
        isDefault: true,
        isFromMock: true,
    },
];

// ─────────────────────────────────────────────
// PA Mock Data
// ─────────────────────────────────────────────

export const mockInsuredPA: InsuredInfoPA = {
    appId: "69360005",
    prefix: "ด.ช.",
    firstName: "ธุรยากาล",
    lastName: "พรทากุล",
    customerName: "ด.ช.ธุรยากาล พรทากุล",
    nationalId: "2620481791269",
    passport: "",
    plan: "เลือกที่",
    startCoverDate: "2026-01-01",
    effectiveDate: "2026-01-01",
    endCoverDate: "2026-01-12",
    insuredType: "นักเรียน",
    schoolName: "ศูนย์เด็กเล็กวัดลาดใหญ่เมือง กรมขนามัย",
};

export const mockSchoolPA: SchoolInfo = {
    appId: "69360005",
    schoolName: "ศูนย์เด็กเล็กวัดลาดใหญ่เมือง กรมขนามัย",
    teacherName: "นายปกรินทร์ พงศ์โกษาล",
    teacherPhone: "091-2233444",
    teacherBank: "กรุงไทย",
    teacherAccountNo: "1821000111",
    teacherAccountName: "นายปกรินทร์ พงศ์โกษาล",
};

export const mockBankAccountsPA: BankAccount[] = [
    {
        id: "pa-bank-1",
        relationship: "ครูผู้ประสานงาน",
        bankId: 3,
        bankName: "กรุงไทย",
        accountNo: "1821000111",
        accountName: "นายปกรินทร์ พงศ์โกษาล",
        isDefault: true,
        isFromMock: true,
    },
];

export const mockContactsPA: ContactInfo[] = [
    {
        id: "pa-contact-1",
        relationship: "ครูผู้ประสานงาน",
        phone: "091-2233444",
        name: "นายปกรินทร์ พงศ์โกษาล",
        isDefault: true,
        isFromMock: true,
    },
];

export const mockClaimItemsPA: ClaimInsuredItem[] = [
    {
        id: "pa-item-1",
        appId: "69360005",
        seq: 1,
        customerName: "ด.ช.ธุรยากาล พรทากุล",
        insuredType: "นักเรียน",
        claimType: "OPD",
        opdSubType: "ค่ารักษา", // ← ตรงกับ type แล้ว
        claimAmount: 1250,
    },
    {
        id: "pa-item-2",
        appId: "69360005",
        seq: 2,
        customerName: "ด.ญ.วิจิตรัน อุตมกัตถ์",
        insuredType: "นักเรียน",
        claimType: "OPD",
        opdSubType: "ค่าชดเชย", // ← ตรงกับ type แล้ว
        claimAmount: 300,
    },
];

export const DOCUMENT_RECEIVER_OPTIONS = [{ value: "ผู้ให้บริการ" }, { value: "FCNT (สกลนคร)" }, { value: "Pivot" }];

export const SERVICE_PROVIDER_OPTIONS = [
    { value: "06590 - นางสาวมัญฑิตา โลวักษา" },
    { value: "06591 - นายสมชาย มีสุข" },
    { value: "06592 - นางสาวสุดา ใจดี" },
];

export const CAR_OWNER_OPTIONS = [
    { value: "006 - 00000 - คุณสำนักงาน - (-)" },
    { value: "007 - 00001 - คุณพนักงาน - (กทม)" },
];

export const CHIEF_COMPLAIN_OPTIONS = [
    { value: "ปวดท้องเฉียบพลัน" },
    { value: "ไข้หวัดใหญ่" },
    { value: "โดนแมวข่วน" },
    { value: "ลำไส้อักเสบจากเชื้อโรตาไวรัส" },
    { value: "โดนมาร์จรั่น" },
    { value: "ประสงค์เบิกยาแก้ปวดหัว" },
];

export interface CoverageItem {
    benefitId: number;
    label: string;
    limit: string;
    limitMax?: string;
}

export const OPD_COVERAGE_ITEMS: CoverageItem[] = [
    {
        benefitId: 6,
        label: "OPD อุบัติเหตุ",
        limit: "ครั้งละไม่เกิน 5,000 บาท",
    },
    {
        benefitId: 7,
        label: "OPD โรคทั่วไป",
        limit: "700 บาท/ครั้ง",
        limitMax: "คงเหลือ 7 ครั้ง",
    },
];

export const IPD_COVERAGE_ITEMS: CoverageItem[] = [
    {
        benefitId: 2,
        label: "ค่าดูแลโดยแพทย์",
        limit: "700 บาท",
    },
    {
        benefitId: 3,
        label: "ค่ารักษาพยาบาล",
        limit: "15,000 บาท",
    },
    {
        benefitId: 5,
        label: "ค่าห้องปกติ",
        limit: "1,500 บาท/คืน/สูงสุด 45 คืน",
        limitMax: "วงเงินสูงสุด 67,500 บาท",
    },
    {
        benefitId: 4,
        label: "ค่าห้อง ICU",
        limit: "5,000 บาท/คืน/สูงสุด 30 คืน",
        limitMax: "วงเงินสูงสุด 150,000 บาท",
    },
    {
        benefitId: 8,
        label: "ค่าชดเชยการนอน",
        limit: "400 บาท/คืน",
        limitMax: "วงเงินสูงสุด 40,000 บาท",
    },
];
