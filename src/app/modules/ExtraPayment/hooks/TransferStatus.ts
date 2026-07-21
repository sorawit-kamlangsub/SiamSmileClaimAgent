import { TransferStatusId } from "../store/ExtraPayment.types";

// สถานะโอนเพิ่ม (ต่างจาก PaymentStatus ของตารางรายการต่อเคลม — คนละ id space กัน)
// 1 = รอดำเนินการ, 2 = Sleep การโอนเงิน, 3 = โอนเงินไม่สำเร็จ

export const backgroundColorMapTransferStatus: Record<TransferStatusId, string> = {
    1: "#FFF1CD", // รอดำเนินการ
    2: "#E0E0E0", // Sleep การโอนเงิน
    3: "#FFCFC9", // โอนเงินไม่สำเร็จ
};

export const colorMapTransferStatus: Record<TransferStatusId, string> = {
    1: "#a56e07", // รอดำเนินการ
    2: "#616161", // Sleep การโอนเงิน
    3: "#B32615", // โอนเงินไม่สำเร็จ
};

export const labelMapTransferStatus: Record<TransferStatusId, string> = {
    1: "รอดำเนินการ",
    2: "Sleep การโอนเงิน",
    3: "โอนเงินไม่สำเร็จ",
};

// ตัวเลือก dropdown filter สถานะ ด้านบนตาราง — ค่า null = "ทั้งหมด"
export const transferStatusFilterOptions: { id: TransferStatusId | null; name: string }[] = [
    { id: null, name: "ทั้งหมด" },
    { id: 1, name: labelMapTransferStatus[1] },
    { id: 2, name: labelMapTransferStatus[2] },
    { id: 3, name: labelMapTransferStatus[3] },
];

// เฉพาะสถานะนี้เท่านั้นที่แก้ไขบัญชีรับสินไหม/โอนอีกครั้งได้ (ตามเงื่อนไข: โอนเงินไม่สำเร็จ)
export const isRetryableTransferStatus = (statusId: TransferStatusId) => statusId === 3;
