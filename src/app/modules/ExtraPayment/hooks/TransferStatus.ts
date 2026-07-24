import { TransferStatusId } from "../store/ExtraPayment.types";

// สถานะการโอนเงิน
// 2 = รอดำเนินการ
// 3 = โอนสำเร็จ
// 4 = ยกเลิก
// 5 = โอนไม่สำเร็จ

export const backgroundColorMapTransferStatus: Record<TransferStatusId, string> = {
    2: "#FFF1CD", // รอดำเนินการ
    3: "#DDF8E8", // โอนสำเร็จ
    4: "#E0E0E0", // ยกเลิก
    5: "#FFCFC9", // โอนไม่สำเร็จ
};

export const colorMapTransferStatus: Record<TransferStatusId, string> = {
    2: "#A56E07", // รอดำเนินการ
    3: "#1E8E3E", // โอนสำเร็จ
    4: "#616161", // ยกเลิก
    5: "#B32615", // โอนไม่สำเร็จ
};

export const labelMapTransferStatus: Record<TransferStatusId, string> = {
    2: "รอดำเนินการ",
    3: "โอนสำเร็จ",
    4: "ยกเลิก",
    5: "โอนไม่สำเร็จ",
};

// ตัวเลือก dropdown filter สถานะ ด้านบนตาราง
export const transferStatusFilterOptions: { id: TransferStatusId | null; name: string }[] = [
    { id: null, name: "ทั้งหมด" },
    { id: 2, name: labelMapTransferStatus[2] },
    { id: 3, name: labelMapTransferStatus[3] },
    { id: 4, name: labelMapTransferStatus[4] },
    { id: 5, name: labelMapTransferStatus[5] },
];

// เฉพาะสถานะโอนไม่สำเร็จเท่านั้นที่แก้ไขบัญชีรับสินไหม/โอนอีกครั้งได้
export const isRetryableTransferStatus = (statusId: TransferStatusId) => statusId === 5;
