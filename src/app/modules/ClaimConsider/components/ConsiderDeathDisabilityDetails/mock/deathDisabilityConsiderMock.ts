/**
 * Mock data ส่วนที่ยังไม่มี API ของ tab "ข้อมูลการเคลม" หน้าพิจารณาเคลม - Death & Disability
 * (สแกนเอกสาร ใช้ API จริงแล้ว)
 *
 * TODO(death-disability-api): หน้านี้เป็น Mock UI ตาม mockup ยังไม่ได้เชื่อม API — ลบไฟล์นี้เมื่อ BE มี endpoint
 * แล้ว map จาก DTO จริงแทน (Master สาเหตุ รอแก้ไข/ปฏิเสธ/ยกเลิก ใช้ของจริงอยู่แล้ว)
 */

/** รายละเอียดเคลม — รอ API ใหม่ของเคลม Death & Disability (แสดงอย่างเดียว ไม่มี form) */
export type DeathDisabilityClaimInfo = {
    claimType: string;
    incidentType: string;
    coverageType: string;
    causeOfDeath: string;
    incidentDate: string;
    deathDate: string;
    documentReceivedDate: string;
    documentCompleteDate: string;
    hospitalName: string;
    chiefComplaint: string;
    diagnoses: string[];
    remark: string;
};

export const MOCK_DEATH_DISABILITY_CLAIM_INFO: DeathDisabilityClaimInfo = {
    claimType: "เคลมลูกค้า",
    incidentType: "อุบัติเหตุ",
    coverageType: "เสียชีวิต",
    causeOfDeath: "ขับขี่/โดยสารจักรยานยนต์",
    incidentDate: "19/06/2569",
    deathDate: "19/06/2569",
    documentReceivedDate: "19/06/2569",
    documentCompleteDate: "19/06/2569",
    hospitalName: "-",
    chiefComplaint: "เนื้องอกร้ายของกระดูกและกระดูกอ่อนผิวข้อของแขนขา ไม่ระบุตำแหน่ง",
    diagnoses: [
        "C409 : Malignant neoplasm of bone and articular cartilage of limb, unspecified | เนื้องอกร้ายของกระดูกและกระดูกอ่อนผิวข้อของแขนขา ไม่ระบุตำแหน่ง",
    ],
    remark: "-",
};

export type DeathDisabilityExpense = {
    coverageName: string;
    maxLimit: number;
    requestedAmount: number;
};

export type DeathDisabilityBeneficiary = {
    order: number;
    isFromSystem: boolean;
    relationship: string;
    idCardNo: string;
    fullName: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    bankAccount: string;
    accountNo: string;
    amount: number;
};

export type DeathDisabilityDocument = {
    documentId: string;
    documentCode?: string;
    documentTypeName: string;
    fileCount: number;
};

export const MOCK_DEATH_DISABILITY_EXPENSE: DeathDisabilityExpense = {
    coverageName: "เสียชีวิตเนื่องจากอุบัติเหตุทั่วไป / ขับขี่หรือโดยสารรถจักรยานยนต์",
    maxLimit: 120000,
    requestedAmount: 120000,
};

export const MOCK_DEATH_DISABILITY_BENEFICIARIES: DeathDisabilityBeneficiary[] = [
    {
        order: 1,
        isFromSystem: true,
        relationship: "มารดา",
        idCardNo: "4953523518630",
        fullName: "นางณัชชา วรวุฒิอนุกูล",
        firstName: "ณัชชา",
        lastName: "วรวุฒิอนุกูล",
        phoneNumber: "091-2223344",
        bankAccount: "กรุงไทย 18210001122 นางณัชชา วรวุฒิอนุกูล",
        accountNo: "18210001122",
        amount: 120000,
    },
];
