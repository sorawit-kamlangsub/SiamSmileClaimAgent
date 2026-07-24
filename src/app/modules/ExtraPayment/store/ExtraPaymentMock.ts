import {
    BankAccount,
    CpgExtraPaymentDetail,
    ExtraPaymentReasonOption,
    ExtraPaymentListItem,
    BankOption,
    BankAccountRelationOption,
} from "./ExtraPayment.types";

export const USE_MOCK_DATA = true;

export const MOCK_CPG_EXTRA_PAYMENT_DETAIL: CpgExtraPaymentDetail = {
    cpgNo: "CPG000XXX",
    productTypeId: 26, // TODO: เปลี่ยนเป็น productTypeId จริงจาก backend — 6=PH, [26,27,32,33,38,41]=PA
    insuredName: "โรงเรียนบ้านท่ามะกา",
    centralAccountNo: "1921000025",
    centralAccountName: "SMILE TPA CO LTD",
    staffCode: "00054",
    staffName: "สุรัตนา อินทะปัญญา",
    claimCount: 2,
    totalAmount: 2300.0,
    claimItems: [
        {
            claimOnLineId: 1,
            insuredName: "นายรภีพร วรวงศ์คุณากร",
            coverageTypeName: "อุบัติเหตุ/ทำงาน/OPD",
            claimNo: "CL6904000193",
            amount: 500.0,
            extraTransferAmount: null,
        },
        {
            claimOnLineId: 2,
            insuredName: "นางสาวชลธิชา รัตนมณี",
            coverageTypeName: "อุบัติเหตุ/ทำงาน/OPD",
            claimNo: "CL6904000194",
            amount: 1800.0,
            extraTransferAmount: null,
        },
    ],
};

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
    {
        id: 1,
        bankId: 2,
        bankName: "กสิกรไทย",
        bankAccountRelationTypeName: "ผู้เอาประกัน",
        bankAccountNo: "5281137123",
        bankAccountName: "นางสาวรัชนก สุวรรณโชติ",
        isDefault: true,
    },
];

export const MOCK_REASON_OPTIONS: ExtraPaymentReasonOption[] = [
    { id: 1, labelTh: "จ่ายเพิ่มเติมตามความคุ้มครอง" },
    { id: 2, labelTh: "ปรับปรุงยอดจากการคำนวณผิดพลาด" },
    { id: 3, labelTh: "อื่นๆ" },
];

export const MOCK_BRANCH_OPTIONS = [
    { id: 1, name: "กาญจนบุรี" },
    { id: 2, name: "สำนักงานใหญ่" },
];

// ---------------------------------------------------------------------------
// mock สำหรับหน้า list "โอนเพิ่ม" (ExtraPaymentListPage)
// ---------------------------------------------------------------------------

export const MOCK_EXTRA_PAYMENT_LIST: ExtraPaymentListItem[] = [
    {
        cpgNo: "CPG000XXX",
        createdAt: "2026-01-11T13:24:23",
        insuredName: "โรงเรียนบ้านท่ามะกา",
        branchName: "กาญจนบุรี",
        amount: 4000.0,
        extraTransferAmount: 600.0,
        statusId: 2,
        reason: null,
        oldBankAccount: {
            id: 101,
            bankId: 5,
            bankName: "ออมสิน",
            bankAccountRelationTypeName: "ผู้ทำเบี้ย",
            bankAccountNo: "7864380001",
            bankAccountName: "โรงเรียนบ้านท่ามะกา",
            isDefault: true,
        },
    },
    {
        cpgNo: "CPG000XXX",
        createdAt: "2026-01-11T12:24:23",
        insuredName: "นางสาวรัชนก สุวรรณโชค",
        branchName: "สำนักงานใหญ่",
        amount: 1700.0,
        extraTransferAmount: 300.0,
        statusId: 2,
        reason: null,
        oldBankAccount: {
            id: 102,
            bankId: 2,
            bankName: "กสิกรไทย",
            bankAccountRelationTypeName: "ผู้เอาประกัน",
            bankAccountNo: "7864380002",
            bankAccountName: "นางสาวรัชนก สุวรรณโชค",
            isDefault: true,
        },
    },
    {
        cpgNo: "CPG000XXX",
        createdAt: "2026-01-10T11:24:23",
        insuredName: "นายปรเมศ คำภาพันธ์",
        branchName: "สำนักงานใหญ่",
        amount: 1000.0,
        extraTransferAmount: 100.0,
        statusId: 5,
        reason: "ปัญหาบัญชีผู้ใช้",
        oldBankAccount: {
            id: 103,
            bankId: 5,
            bankName: "ออมสิน",
            bankAccountRelationTypeName: "ผู้ทำเบี้ย",
            bankAccountNo: "7864380112",
            bankAccountName: "นายปรเมศ คำภาพันธ์",
            isDefault: true,
        },
    },
];

export const MOCK_BANK_OPTIONS: BankOption[] = [
    { id: 1, name: "กรุงเทพ" },
    { id: 2, name: "กสิกรไทย" },
    { id: 3, name: "ไทยพาณิชย์" },
    { id: 4, name: "กรุงไทย" },
    { id: 5, name: "ออมสิน" },
    { id: 6, name: "กรุงศรีอยุธยา" },
];

export const MOCK_BANK_ACCOUNT_RELATION_OPTIONS: BankAccountRelationOption[] = [
    { id: 1, name: "ผู้เอาประกัน" },
    { id: 2, name: "ผู้ปกครอง" },
    { id: 3, name: "สถานศึกษา" },
    { id: 4, name: "ครูผู้ประสานงาน" },
    { id: 5, name: "ผู้อำนวยการสถานศึกษา" },
];
