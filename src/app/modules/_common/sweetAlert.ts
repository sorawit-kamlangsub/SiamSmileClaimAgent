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
