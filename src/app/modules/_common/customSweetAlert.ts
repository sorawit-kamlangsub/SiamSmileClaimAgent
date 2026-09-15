import Swal, { SweetAlertResult } from "sweetalert2";
import { setBankLogo } from "../../functionHelpers";

const formatMoney = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

// ใช้ path เดียวกับ @mui/icons-material/ContentCopy เพื่อให้หน้าตาตรงกับฝั่ง React
// (raw html ของ sweetalert2 import React component ตรงๆ ไม่ได้ เลย inline เป็น svg แทน)
const contentCopyIconSvg = (size = 16, color = "#6b7280") => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
</svg>`;

const bankLogoHtml = (bankId: number, bankName: string) => {
    const logoSrc = setBankLogo(bankId);
    if (logoSrc) {
        return `<img src="${logoSrc}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0" />`;
    }
    return `<div style="width:44px;height:44px;border-radius:50%;background:#e3f2fd;display:flex;align-items:center;justify-content:center;font-weight:700;color:#1976d2;font-size:13px;flex-shrink:0">${
        bankName?.slice(0, 2) ?? ""
    }</div>`;
};

// ---------------------------------------------------------------------------
// 1) บันทึกโอนเพิ่มสำเร็จ — แสดงบัญชีรับสินไหม + ยอดรวม (คัดลอกได้) + รายการโอนเพิ่มทั้งหมด
//    ข้อมูลทั้งหมดมาจากผู้เรียกใช้ ไม่ hardcode ไว้ในนี้
//    onCopyAmount: sweetalert2 render นอก React tree เลยโชว์ Snackbar ในนี้เองไม่ได้ —
//    ให้ผู้เรียก (component ที่มี useState) ส่ง callback เข้ามาเปิด Snackbar ของตัวเองแทน
// ---------------------------------------------------------------------------
interface ExtraPaymentTransferItem {
    fullName: string;
    amount: number;
}

interface ExtraPaymentSuccessBankAccount {
    bankId: number;
    bankName: string;
    bankAccountNo: string;
    bankAccountName: string;
}

interface SwalExtraPaymentSuccessParams {
    bankAccount: ExtraPaymentSuccessBankAccount;
    totalExtraTransferAmount: number;
    transferItems: ExtraPaymentTransferItem[];
    confirmButtonText?: string;
    onCopyAmount?: () => void;
}

export const swalExtraPaymentSuccess = ({
    bankAccount,
    totalExtraTransferAmount,
    transferItems,
    confirmButtonText = "ตกลง",
    onCopyAmount,
}: SwalExtraPaymentSuccessParams): Promise<SweetAlertResult> => {
    const transferItemsHtml = transferItems
        .map(
            (item, index) => `
            <div style="display:flex;justify-content:space-between;padding:6px 12px;font-size:14px;color:#374151;${
                index > 0 ? "border-top:1px solid #eef0f3;" : ""
            }">
                <span>${item.fullName}</span>
                <span>${formatMoney(item.amount)} บาท</span>
            </div>`
        )
        .join("");

    return Swal.fire({
        icon: "success",
        title: "บันทึกโอนเพิ่มสำเร็จ",
        html: `
            <p style="color:#6b7280;margin:6px 0 16px 0;font-size:14px">ทั้งหมด ${transferItems.length} รายการ</p>
            <div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin:0 0 14px 0;text-align:left">
                <p style="font-weight:700;font-size:13px;margin:0 0 8px 0;color:#374151">รายละเอียดบัญชี</p>
                <div style="display:flex;align-items:center;gap:10px">
                    ${bankLogoHtml(bankAccount.bankId, bankAccount.bankName)}
                    <div style="font-size:13px;text-align:left;line-height:1.6">
                        <div>ธนาคาร : <b style="color:#0b74bd">${bankAccount.bankName}</b></div>
                        <div>เลขที่บัญชี : <b style="color:#0b74bd">${bankAccount.bankAccountNo}</b></div>
                        <div>ชื่อบัญชี : <b style="color:#0b74bd">${bankAccount.bankAccountName}</b></div>
                    </div>
                </div>
            </div>
            <p style="color:#6b7280;margin-bottom:2px;font-size:14px">จำนวนเงินโอนเพิ่มรวม</p>
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:0 0 14px 0">
                <span style="font-size:24px;font-weight:700;color:#0b74bd">${formatMoney(
                    totalExtraTransferAmount
                )} บาท</span>
                <button type="button" id="swal-copy-total-amount" style="border:none;background:none;cursor:pointer;padding:4px;display:flex;align-items:center">
                    ${contentCopyIconSvg(18, "#0b74bd")}
                </button>
            </div>
            <div style="text-align:left">
                <p style="font-weight:700;font-size:13px;margin:0 0 6px 0;color:#374151">รายการโอนเพิ่ม</p>
                <div style="background:#f9fafb;border-radius:8px;overflow:hidden">
                    ${transferItemsHtml}
                </div>
            </div>
        `,
        confirmButtonText,
        customClass: { confirmButton: "swal2-styled swal2-ok" },
        backdrop: "rgba(0,0,0,0.4)",
        didOpen: () => {
            document.getElementById("swal-copy-total-amount")?.addEventListener("click", () => {
                navigator.clipboard.writeText(String(totalExtraTransferAmount));
                onCopyAmount?.();
            });
        },
    });
};

// ---------------------------------------------------------------------------
// 2) บันทึกสำเร็จ + รายการเลขที่ CL พร้อมคัดลอก (ทีละแถว หรือคัดลอกทั้งหมด)
//    title/subtitle ให้ผู้เรียกกำหนดเอง เพราะข้อความเปลี่ยนไปตามเคส (เช่น "รอขยายวงเงินจากเคลมออนไลน์")
// ---------------------------------------------------------------------------
interface SwalClaimListSuccessParams {
    title: string;
    subtitle: string;
    claimNos: string[];
    confirmButtonText?: string;
    onCopy?: () => void;
}

export const swalClaimListSuccess = ({
    title,
    subtitle,
    claimNos,
    confirmButtonText = "ตกลง",
    onCopy,
}: SwalClaimListSuccessParams): Promise<SweetAlertResult> => {
    const rowsHtml = claimNos
        .map(
            (claimNo, index) => `
            <div class="swal-claim-row" data-claim-no="${claimNo}" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;${
                index > 0 ? "border-top:1px solid #eee6c9;" : ""
            }">
                <span style="font-size:14px">${claimNo}</span>
                <button type="button" class="swal-copy-row" data-claim-no="${claimNo}" style="border:none;background:none;cursor:pointer;padding:4px;display:flex;align-items:center">
                    ${contentCopyIconSvg(16, "#6b7280")}
                </button>
            </div>`
        )
        .join("");

    return Swal.fire({
        icon: "success",
        title,
        html: `
            <p style="color:#374151;margin:6px 0 16px 0;font-size:15px;font-weight:600">${subtitle}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 6px 0;font-size:13px;color:#374151">
                <span>เลขที่ CL</span>
                <button type="button" id="swal-copy-all-claim-nos" style="border:none;background:none;cursor:pointer;color:#0b74bd;font-weight:700;display:flex;align-items:center;gap:4px">
                    คัดลอกทั้งหมด ${contentCopyIconSvg(14, "#0b74bd")}
                </button>
            </div>
            <div style="background:#fdf6d8;border-radius:8px;overflow:hidden">
                ${rowsHtml}
            </div>
        `,
        confirmButtonText,
        customClass: { confirmButton: "swal2-styled swal2-ok" },
        backdrop: "rgba(0,0,0,0.4)",
        didOpen: () => {
            document.getElementById("swal-copy-all-claim-nos")?.addEventListener("click", () => {
                navigator.clipboard.writeText(claimNos.join("\n"));
                onCopy?.();
            });
            document.querySelectorAll<HTMLButtonElement>(".swal-copy-row").forEach((btn) => {
                btn.addEventListener("click", () => {
                    navigator.clipboard.writeText(btn.dataset.claimNo ?? "");
                    onCopy?.();
                });
            });
        },
    });
};

// ---------------------------------------------------------------------------
// 3) ยืนยันการทำรายการ — เป็น "เปลือก" (icon/สี/ปุ่ม) เท่านั้น
//    ไม่ครอบ logic ของ mutation/redux/navigate ไว้ในนี้ เพราะแต่ละที่ที่เรียกใช้
//    รายละเอียดต่างกันมาก (เช่นตัวอย่าง productTypeId === 6 ที่ให้มา มี preConfirm
//    เรียก mutation, แตกสอง flow isConfirmed/isDismissed, ต่อ alert สำเร็จ/ล้มเหลวซ้อนอีกชั้น,
//    dispatch redux หลายตัว, navigate ปลายทางไม่เหมือนกัน) — บังคับให้ทุกจุดใช้ signature เดียวกัน
//    จะทำให้ฟังก์ชันนี้ต้องรับ callback เกือบเท่าจำนวนบรรทัดของ logic เดิม ซึ่งไม่ได้ช่วยลดงานจริง
//    ผู้เรียกจึงยังคงเขียน preConfirm/.then() เองตามเคสของตัวเอง แต่ได้ title/text/ปุ่ม/สีที่ตรงกันทุกจุด
// ---------------------------------------------------------------------------
interface SwalConfirmActionParams {
    title?: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    preConfirm?: () => Promise<any> | any;
}

export const swalConfirmAction = ({
    title = "ยืนยันการทำรายการ",
    text = "ต้องการยืนยันการทำรายการใช่หรือไม่",
    confirmButtonText = "ยืนยัน",
    cancelButtonText = "ยกเลิก",
    preConfirm,
}: SwalConfirmActionParams = {}): Promise<SweetAlertResult> => {
    return Swal.fire({
        icon: "question",
        iconHtml: "?",
        title,
        text,
        showCancelButton: true,
        reverseButtons: true,
        allowOutsideClick: false,
        confirmButtonText,
        cancelButtonText,
        showLoaderOnConfirm: !!preConfirm,
        preConfirm,
        backdrop: "rgba(0,0,0,0.4)",
        customClass: {
            confirmButton: "swal2-styled swal2-confirm-green",
            cancelButton: "swal2-styled swal2-cancel-outline-red",
        },
    });
};

// ---------------------------------------------------------------------------
// 4) อนุมัติเคลมโรงพยาบาล + โอนค่าชดเชยให้ลูกค้าสำเร็จ
//    แสดงเลขที่ Claim/Case + รหัสการโอนเงิน (CPG, คัดลอกได้) + จำนวนเงินโอน
// ---------------------------------------------------------------------------
interface SwalHospitalApproveTransferSuccessParams {
    claimNo?: string;
    caseNo?: string;
    /** รหัสการโอนเงิน (CPG...) จาก CreatePayment */
    paymentCode?: string;
    transferAmount: number;
    bankName?: string;
    bankAccountNo?: string;
    confirmButtonText?: string;
    onCopyPaymentCode?: () => void;
}

export const swalHospitalApproveTransferSuccess = ({
    claimNo,
    caseNo,
    paymentCode,
    transferAmount,
    bankName,
    bankAccountNo,
    confirmButtonText = "ตกลง",
    onCopyPaymentCode,
}: SwalHospitalApproveTransferSuccessParams): Promise<SweetAlertResult> => {
    const row = (label: string, value: string, opts?: { strong?: boolean; color?: string }) => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 14px;border-top:1px solid #eef0f2">
            <span style="font-size:13px;color:#6b7280">${label}</span>
            <span style="font-size:${opts?.strong ? "16px" : "14px"};font-weight:${opts?.strong ? 700 : 600};color:${
                opts?.color ?? "#111827"
            }">${value}</span>
        </div>`;

    const paymentCodeRow = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;border-top:1px solid #eef0f2;background:#F7FEE7">
            <span style="font-size:13px;color:#6b7280">รหัสการโอนเงิน</span>
            <span style="display:flex;align-items:center;gap:6px">
                <span style="font-size:16px;font-weight:700;color:#15803d">${paymentCode || "-"}</span>
                ${
                    paymentCode
                        ? `<button type="button" id="swal-copy-payment-code" style="border:none;background:none;cursor:pointer;padding:2px;display:flex;align-items:center">${contentCopyIconSvg(
                              16,
                              "#15803d"
                          )}</button>`
                        : ""
                }
            </span>
        </div>`;

    const accountText = [bankName, bankAccountNo].filter(Boolean).join(" • ");

    return Swal.fire({
        icon: "success",
        title: "อนุมัติและโอนค่าชดเชยสำเร็จ",
        html: `
            <p style="color:#374151;margin:6px 0 14px 0;font-size:14px">เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว</p>
            <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;text-align:left">
                ${row("เลขที่ Claim", claimNo || "-")}
                ${row("เลขที่ Case", caseNo || "-")}
                ${paymentCodeRow}
                ${row("จำนวนเงินโอน", `฿ ${formatMoney(transferAmount)}`, { strong: true, color: "#15803d" })}
                ${accountText ? row("โอนเข้าบัญชี", accountText) : ""}
            </div>`,
        confirmButtonText,
        customClass: { confirmButton: "swal2-styled swal2-ok" },
        backdrop: "rgba(0,0,0,0.4)",
        didOpen: () => {
            document.getElementById("swal-copy-payment-code")?.addEventListener("click", () => {
                if (paymentCode) navigator.clipboard.writeText(paymentCode);
                onCopyPaymentCode?.();
            });
        },
    });
};
