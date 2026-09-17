/**
 * decisionId ของ Decision master ที่ปุ่ม "ผลการพิจารณา" (ConsiderSection) ใช้
 * ใช้ค่าคงที่นี้แทนการเขียนเลขตรงๆ กระจายหลายไฟล์ (ConsiderSection / hook ของหน้า / payload / draft mapper)
 */
export const DECISION_ID = {
    /** รอเอกสาร */
    PENDING_DOCUMENT: 3,
    /** รอแก้ไข (เคลมโรงพยาบาลแสดงเป็น "แจ้งแก้ไข") */
    REVISION: 4,
    /** ปฏิเสธ — สาเหตุมาจาก Master RejectReason */
    REJECTED: 5,
    /** ยกเลิก — สาเหตุมาจาก Master CancelReason */
    CANCELLED: 6,
} as const;
