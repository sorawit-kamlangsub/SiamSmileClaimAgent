import { OldClaimInfo, BankAccount, ContactInfo, InsuredInfoPH } from "../store/claimPHSlice";

export const mockInsuredPH: InsuredInfoPH = {
    appId: "0003067",
    customerName: "นางสาวรัชขน สุวรรณโชค",
    nationalId: "2494029825403",
    plan: "631",
    startCoverDate: "2010-09-01",
    cancelDate: null,
};

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
    },
];

export const mockContacts: ContactInfo[] = [
    {
        id: "1",
        relationship: "ผู้ชำระเบี้ย",
        phone: "081-2345678",
        name: "นางสาวรัชขน สุวรรณโชค",
        isDefault: true,
    },
];
