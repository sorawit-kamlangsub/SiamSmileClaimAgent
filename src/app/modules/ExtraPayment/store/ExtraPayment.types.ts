// TODO: ยืนยัน field name จริงกับ backend DTO ก่อนใช้งานจริง

export interface ExtraPaymentClaimItem {
    claimOnLineId: number;
    insuredName: string; // ชื่อ-นามสกุล ผู้เอาประกัน
    coverageTypeName: string; // ประเภทความคุ้มครอง
    claimNo: string; // เลขที่เคลม (CLxxxxxxxxxx)
    amount: number; // จำนวนเงิน
    extraTransferAmount: number | null; // ยอดเงินโอนเพิ่ม (แก้ไขได้)
}

export interface CpgExtraPaymentDetail {
    cpgNo: string; // เลขที่ CPG
    productTypeId: number; // ใช้ isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH/PA) ใน ExtraPaymentPage
    insuredName: string; // ชื่อผู้เอาประกัน (ระดับ CPG)
    centralAccountNo: string; // บัญชีส่วนกลาง
    centralAccountName: string;
    staffCode: string; // ผู้ทำรายการ
    staffName: string;
    claimCount: number; // จำนวนการเคลม
    totalAmount: number; // จำนวนเงินรวม
    claimItems: ExtraPaymentClaimItem[];
}

export interface BankAccount {
    id: number;
    bankId: number;
    bankName: string;
    bankAccountRelationTypeName: string; // ประเภทผู้ติดต่อ เช่น ผู้ขอประกัน
    bankAccountNo: string;
    bankAccountName: string;
    isDefault: boolean;
}

export interface ExtraPaymentReasonOption {
    id: number;
    labelTh: string; // ตัวเลือกใน dropdown "สาเหตุการโอนเพิ่ม"
}

export interface CreateExtraPaymentPayload {
    cpgNo: string;
    claimOnLineIds: number[];
    claimNos: string[];
    extraTransferAmounts: Record<number, number>; // key = claimOnLineId
    bankAccountId: number;
    reasonId: number;
    remark?: string;
}

export interface CreateExtraPaymentResponse {
    success: boolean;
    transferRefNo?: string;
    claimNos: string[]; // เลขที่ CL ที่แจ้งโอนเพิ่มสำเร็จ แสดงใน success modal
}

// ใช้กับ useFormik ใน useExtraPaymentForm — ตาม pattern `${name}_selectedText`
// ที่ FormikDropdown เซ็ตให้อัตโนมัติ (ดู AddBankAccountModal เป็นตัวอย่าง)
export interface ExtraPaymentFormValues {
    reasonId?: number;
    reasonId_selectedText: string;
    remark: string;
}

// ---------------------------------------------------------------------------
// หน้า "โอนเพิ่ม" (list/monitor page) — จัดการเงินเคลม > โอนเพิ่ม
// ---------------------------------------------------------------------------

// 1 = รอดำเนินการ, 2 = Sleep การโอนเงิน, 3 = โอนเงินไม่สำเร็จ
export type TransferStatusId =  2 | 3 | 4 | 5;

export interface ExtraPaymentListItem {
    cpgNo: string; // เลขที่ CPG
    createdAt: string; // วันที่สร้างเคลม ISO string — format DD/MM/YYYY hh:mm:ss (พ.ศ.) ตอน render
    insuredName: string; // ชื่อผู้เอาประกัน (คำนำหน้า+ชื่อ+นามสกุล)
    branchName: string; // สาขา ตาม ClaimCase
    amount: number; // จำนวนเงินตามการแจ้งเคลม
    extraTransferAmount: number; // โอนเพิ่ม
    statusId: TransferStatusId;
    reason: string | null; // สาเหตุ (ระบบแจ้งเอง) — "-" ถ้าไม่มี
    oldBankAccount: BankAccount; // บัญชีรับสินไหมเดิม (อิงจากตอนแจ้งเคลมครั้งแรก)
}

// ตัวเลือก dropdown "สาขา" (Master Data)
export interface BranchOption {
    id: number;
    name: string;
}

// ตัวเลือก dropdown "ธนาคาร" (Master Data)
export interface BankOption {
    id: number;
    name: string;
}

// ตัวเลือก dropdown "ความสัมพันธ์ของบัญชีผู้รับสินไหม"
export interface BankAccountRelationOption {
    id: number;
    name: string;
}

export interface SearchExtraPaymentResult {
    found: boolean;
    cpgNo: string;
    claimOnLineId?: number; // มีค่าเมื่อค้นหาด้วยเลขที่ CL (แสดงเฉพาะรายการนั้น)
}

// ใช้กับ useFormik ใน useEditBankAccountForm
export interface EditBankAccountFormValues {
    relationshipId?: number;
    relationshipId_selectedText: string;
    bankId?: number;
    bankId_selectedText: string;
    accountNo: string;
    accountName: string;
}

export interface RetryTransferPayload {
    cpgNo: string;
    newBankAccount: {
        relationshipId: number;
        relationshipName: string;
        bankId: number;
        bankName: string;
        accountNo: string;
        accountName: string;
    };
    amount: number;
}

export interface RetryTransferResult {
    success: boolean;
    bankAccount: BankAccount;
    totalExtraTransferAmount: number;
    transferItems: { fullName: string; amount: number }[]; // รายการโอนเพิ่ม แสดงคำนำหน้า+ชื่อ+จำนวนเงิน
}
