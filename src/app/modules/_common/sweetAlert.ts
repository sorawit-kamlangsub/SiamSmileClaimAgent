import Swal from "sweetalert2";

/**
 * แสดงกล่องแจ้งเตือน แบบ ข้อความ (info)
 * @param title หัวข้อของ alert
 * @param text ข้อความของ alert
 */
export const swalInfo = (title: string, text: string) => {
    return Swal.fire({
        title,
        text,
        customClass: {
            confirmButton: "swal2-ok",
        },
        backdrop: "rgba(0,0,0,0.4)",
    });
};

/**
 * แสดงกล่องแจ้งเตือน แบบ คำเตือน (warning)
 * @param title หัวข้อของ alert
 * @param text  ข้อความของ alert
 * @param confirmButtonText  ข้อความปุ่ม confirm
 */
export const swalWarning = (title: string, text: string, confirmButtonText = "OK") => {
    return Swal.fire({
        title,
        text,
        icon: "warning",
        confirmButtonText: confirmButtonText,
        customClass: {
            confirmButton: "swal2-ok",
        },
        backdrop: "rgba(0,0,0,0.4)",
    });
};

/**
 * แสดงกล่องแจ้งเตือน แบบ ยืนยัน (confirm)
 * @param title หัวข้อของ alert
 * @param text  ข้อความของ alert
 * @param confirmButtonText  ข้อความปุ่ม confirm
 * @param cancelButtonText  ข้อความปุ่ม cancel
 */
export const swalConfirm = (title: string, text: string, confirmButtonText = "OK", cancelButtonText = "Cancel") => {
    return Swal.fire({
        title,
        text,
        icon: "question",
        iconHtml: "?",
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        reverseButtons: true,
        allowOutsideClick: false,
        backdrop: "rgba(0,0,0,0.4)",
    });
};

/**
 * แสดงกล่องแจ้งเตือน แบบ ข้อผิดพลาด (error)
 * @param title หัวข้อของ alert
 * @param text  ข้อความของ alert
 */
export const swalError = (title: string, text: string) => {
    return Swal.fire({
        title,
        text,
        icon: "error",
        customClass: {
            confirmButton: "swal2-ok",
        },
        backdrop: "rgba(0,0,0,0.4)",
        returnFocus: false,
    });
};

/**
 * แสดงกล่องแจ้งเตือน แบบ สำเร็จ (success)
 * @param title หัวข้อของ alert
 * @param text  ข้อความของ alert
 * @param confirmButtonText  ข้อความปุ่ม confirm
 */
export const swalSuccess = (title: string, text: string, confirmButtonText = "Ok") => {
    return Swal.fire({
        title,
        text,
        icon: "success",
        confirmButtonText: confirmButtonText,
        customClass: {
            confirmButton: "swal2-styled swal2-ok",
        },
        backdrop: "rgba(0,0,0,0.4)",
    });
};

/**
 * แจ้งเตือนแบบ toast มุมขวาบน ปิดเองอัตโนมัติ ไม่ต้องกดปิด (ใช้กับ warning/success ที่ไม่ block การทำงานต่อ)
 * @param icon ไอคอนของ toast ("success" | "warning" | "error" | "info")
 * @param title ข้อความของ toast
 * @param timer ระยะเวลาก่อนปิดเอง (มิลลิวินาที)
 */
export const swalToast = (icon: "success" | "warning" | "error" | "info", title: string, timer = 3000) => {
    return Swal.fire({
        toast: true,
        position: "top-end",
        icon,
        title,
        timer,
        timerProgressBar: true,
        showConfirmButton: false,
    });
};

/**
 * กล่องโหลดแบบ block ทั้งจอ ปิดเอง/กด ESC ไม่ได้ ไม่มีปุ่ม — ใช้คั่นระหว่างรอ async
 * ที่ห้ามให้ผู้ใช้ทำอย่างอื่น (เช่น กำลังโอนเงิน) ปิดด้วยการเรียก swal อื่นทับ หรือ Swal.close()
 * @param title หัวข้อ
 * @param text  ข้อความ
 */
export const swalLoading = (title = "กำลังดำเนินการ", text = "กรุณารอสักครู่") => {
    return Swal.fire({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        backdrop: "rgba(0,0,0,0.4)",
        didOpen: () => Swal.showLoading(),
    });
};

export const swalWarningNotOutsideClick = (title: string, text: string, confirmButtonText = "ตกลง") => {
    return Swal.fire({
        title,
        text,
        icon: "warning",
        confirmButtonText: confirmButtonText,
        allowOutsideClick: false,
        customClass: {
            confirmButton: "swal2-ok",
        },
        backdrop: "rgba(0,0,0,0.4)",
    });
};
