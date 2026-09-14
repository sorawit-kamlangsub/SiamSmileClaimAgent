/**
 * Default options for the Status at filter
 */
export const defaultToggleButtonOptions = [
    { value: 0, label: "ทั้งหมด" },
    { value: 1, label: "รอพิจารณา" },
    { value: 2, label: "รอเอกสาร" },
    { value: 3, label: "รอแก้ไข" },
    { value: 4, label: "ปฏิเสธ" },
    { value: 5, label: "ยกเลิก" },
    { value: 6, label: "อยู่ระหว่างดำเนินการ" },
    { value: 7, label: "รอตรวจสอบการแก้ไข" },
];

/**
 * Default options for the DateType at filter
 */
export const defaultDateTypeOptions = [
    { value: 1, label: "วันที่สร้างรายการ" },
    { value: 2, label: "วันที่ทำรายการ" },
    { value: 3, label: "วันที่โอนเงิน" },
];

export const defaultSearchFromOptions = [
    { value: 1, label: "เลขที่ CL" },
    { value: 2, label: "เลขบัตรประชาชน" },
    { value: 3, label: "Passport" },
    { value: 4, label: "ชื่อ-นามสกุล(ผู้เอาประกัน)" },
    { value: 5, label: "ApplicationID" },
    { value: 6, label: "เลขประจำตัวผู้เอาประกัน" },
    { value: 7, label: "ผู้ออกให้บริการ" },
    { value: 8, label: "ชื่อสถานศึกษา" },
];

export const getSearchFromOptions = (isHospital = false) =>
    defaultSearchFromOptions.map((option) =>
        option.value === 8 ? { ...option, label: isHospital ? "ชื่อสถานพยาบาล" : "ชื่อสถานศึกษา" } : option
    );

export const productMultipleSelectData = [
    { value: 6, label: "PH" },
    { value: 26, label: "PA" },
];
