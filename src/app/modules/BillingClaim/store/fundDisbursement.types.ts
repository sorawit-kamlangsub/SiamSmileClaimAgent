/**
 * "ตั้งเบิกกองทุน" (`/billing/customers`) — handoff `CR-billing-claim-menu-renaming-and-approval-flow.md`
 *
 * ยังไม่มี endpoint จริง (ดู PENDING_BE_FUND_FIELDS ที่ `useFundDisbursementList.ts` และ
 * docs/api-inventory.md หัวข้อ "Still no API for") type กลุ่มนี้จึงเป็นสัญญาที่ FE คาดหวังจาก BE
 * ไว้ล่วงหน้า ไม่ใช่ DTO ที่ generate มาจริง — เมื่อ BE มี endpoint ให้เทียบ field ให้ตรงแล้วค่อยลบ
 * คอมเมนต์ TODO ที่กำกับไว้
 */

export const FUND_CLAIM_TYPE = {
    customer: "customer",
    hospital: "hospital",
} as const;
export type FundClaimType = (typeof FUND_CLAIM_TYPE)[keyof typeof FUND_CLAIM_TYPE];

export const FUND_CLAIM_TYPE_OPTIONS: { value: FundClaimType; label: string }[] = [
    { value: FUND_CLAIM_TYPE.customer, label: "เคลมลูกค้า" },
    { value: FUND_CLAIM_TYPE.hospital, label: "เคลมโรงพยาบาล" },
];

/** แปลงค่าจาก URL (?claimType=hospital) — ค่าอื่น/ไม่ระบุ = ยังไม่เลือก (แสดง empty state ตามสเปค) */
export const parseFundClaimType = (value: string | null): FundClaimType | undefined => {
    if (value === FUND_CLAIM_TYPE.customer) return FUND_CLAIM_TYPE.customer;
    if (value === FUND_CLAIM_TYPE.hospital) return FUND_CLAIM_TYPE.hospital;
    return undefined;
};

export const FUND_SEARCH_BY = {
    claimCode: "claimCode",
    caseCode: "caseCode",
    hospital: "hospital",
    insuredName: "insuredName",
} as const;
export type FundSearchByField = (typeof FUND_SEARCH_BY)[keyof typeof FUND_SEARCH_BY];

export const FUND_SEARCH_BY_OPTIONS: { value: FundSearchByField; label: string }[] = [
    { value: FUND_SEARCH_BY.claimCode, label: "เลขที่ CL" },
    { value: FUND_SEARCH_BY.caseCode, label: "เลขที่ Case" },
    { value: FUND_SEARCH_BY.hospital, label: "ชื่อสถานพยาบาล" },
    { value: FUND_SEARCH_BY.insuredName, label: "ชื่อผู้เอาประกัน" },
];

export type FundDisbursementFilterValues = {
    claimType: FundClaimType | "";
    /** ค่าเดียวกับ `productMultipleSelectData` (ClaimConsider/.../Constant/ConstantValues.ts) : 6 = PH, 26 = PA */
    productId: number | "";
    branchId: number | "";
    userId: string | "";
    searchBy: FundSearchByField;
    searchDetail: string;
};

export const getDefaultFundFilter = (claimType?: FundClaimType): FundDisbursementFilterValues => ({
    claimType: claimType ?? "",
    productId: "",
    branchId: "",
    userId: "",
    searchBy: FUND_SEARCH_BY.claimCode,
    searchDetail: "",
});

/**
 * แถวข้อมูลของตารางตั้งเบิกกองทุน — คอลัมน์ต่างกันตาม `claimType` (handoff หัวข้อ "ตารางเคลมโรงพยาบาล"
 * + รูป mockup ของเคลมลูกค้า) รวม field ทั้งสองแบบไว้ใน type เดียว เป็น optional ตามประเภท
 */
export type FundDisbursementItem = {
    billingDetailId: string;
    caseCode: string;
    approvedDate?: string; // วันที่อนุมัติเคลม — ทั้ง 2 ประเภท
    approvedBy?: string; // ผู้อนุมัติ — ทั้ง 2 ประเภท
    disbursementAmount: number; // จำนวนเงินตั้งเบิก — ทั้ง 2 ประเภท
    insuranceCompanyName?: string; // ชื่อบริษัทประกัน — ทั้ง 2 ประเภท
    notifiedDate?: string; // วันที่แจ้งเคลม — เคลมลูกค้าเท่านั้น
    hospitalName?: string; // ชื่อสถานพยาบาล — เคลมโรงพยาบาลเท่านั้น
};
