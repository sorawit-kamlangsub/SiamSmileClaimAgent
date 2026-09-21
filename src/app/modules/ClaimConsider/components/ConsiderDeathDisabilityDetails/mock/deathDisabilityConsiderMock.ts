/**
 * Mock data ส่วนที่ยังไม่มี API ของ tab "ข้อมูลการเคลม" หน้าพิจารณาเคลม - Death & Disability
 * (รายละเอียดเคลม และสแกนเอกสาร ใช้ API จริงแล้ว)
 *
 * TODO(death-disability-api): หน้านี้เป็น Mock UI ตาม mockup ยังไม่ได้เชื่อม API — ลบไฟล์นี้เมื่อ BE มี endpoint
 * แล้ว map จาก DTO จริงแทน (Master สาเหตุ รอแก้ไข/ปฏิเสธ/ยกเลิก ใช้ของจริงอยู่แล้ว)
 */

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
