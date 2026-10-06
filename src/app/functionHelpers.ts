import axios, { AxiosResponse } from "axios";
import dayjs, { Dayjs } from "dayjs";
import th from "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import timezone from "dayjs/plugin/timezone";
import { MUIDataTableColumnOptions } from "mui-datatables";
import { APIGW_URL, PermissionList } from "../Const";
import { PermissionCondition, checkPermissions } from "./modules/_auth";
import { encodeURLWithParams } from "./modules/_common";
import * as XLSX from "xlsx";

dayjs.locale(th);
dayjs.extend(buddhistEra);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

export const toDayjsOrNull = (dateStr: string): Dayjs | undefined => (dateStr ? dayjs(dateStr) : undefined);

export const toDateString = (date: Dayjs | undefined): string =>
    date ? dayjs(date).format("YYYY-MM-DD HH:mm:ss") : "";

export const numberWithCommas = (x: number | string, decimalPlaces: number = 2): string => {
    const numberValue = typeof x === "number" ? x.toFixed(decimalPlaces) : parseFloat(x).toFixed(decimalPlaces);
    const [integerPart, decimalPart] = numberValue.split(".");
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;
};

export const formatDateString = (
    dateString: string | undefined,
    format: string = "DD/MM/BBBB HH:mm:ss"
): string | undefined => {
    if (!dateString) return undefined;

    const parsed = dayjs(dateString);
    return parsed.isValid() ? parsed.format(format) : undefined;
};

export const handleClickLink = (redirectURL?: string) => {
    if (redirectURL) {
        window.open(redirectURL, "_blank");
    }
};
export const handleNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = event.target.value.replace(/[^0-9]/g, "");
};

export const handleFloatingInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = event.target.value.replace(/[^0-9.]/g, "");
};

export const handleOnePointInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    let value = input.value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
    }
    input.value = value;
};

export const formatPhone = (phone: string | undefined) => {
    const formatPattern = "%%%-%%%%%%%";
    let formattedNumber = "";
    let numberIndex = 0;
    if (phone == undefined || phone.length != 10) return "-";

    for (let i = 0; i < formatPattern.length; i++) {
        if (formatPattern[i] === "%") {
            formattedNumber += phone[numberIndex];
            numberIndex++;
        } else {
            formattedNumber += formatPattern[i];
        }
    }
    return formattedNumber;
};

export const decodeFromBase64 = (str: string): string => {
    return decodeURIComponent(escape(atob(str)));
};

/**
 * ถอด base64 อย่างปลอดภัย — คืน undefined แทนการ throw เมื่อ input ไม่ใช่ base64 ที่ถูกต้อง
 * (เช่น bookmark เก่า/แก้ URL เอง) ไม่มี ErrorBoundary ดักในระบบ ถ้าปล่อยให้ throw ตรงๆ จะทำให้ทั้ง SPA ขาว
 */
export const safeAtob = (value: string | undefined): string | undefined => {
    if (!value) return undefined;
    try {
        return atob(value);
    } catch {
        return undefined;
    }
};

export const [startOfMonth, endOfMonth] = [
    dayjs().local().utcOffset(0).startOf("month"),
    dayjs().local().utcOffset(0).endOf("month"),
];

export const toUtcOffset = (date: dayjs.ConfigType, keepLocalTime?: boolean): dayjs.Dayjs | undefined => {
    if (!date) return undefined;

    const result = keepLocalTime
        ? dayjs(date)?.utcOffset(0, keepLocalTime).startOf("day")
        : dayjs(date)?.utcOffset(0).startOf("day");

    return result;
};

export const formatDate = (date: string | undefined, format: string): string => {
    if (!date) return "";
    return dayjs(date).format(format);
};

export const decimalCheck = (num: number) => {
    return /^(\d+(\.\d{1,2})?)?$/.test(num.toString());
};

export const styleColLeft = { textAlign: "left", fontSize: 14, fontWeight: 500 };
export const styleColCenter = { textAlign: "center", fontSize: 14, fontWeight: 500 };
export const styleColRight = { textAlign: "right", fontSize: 14, fontWeight: 500 };

type CellAlignOptions = {
    align?: "right" | "center" | "left";
    sort?: boolean;
    width?: string;
    maxWidth?: string;
    headerWhiteSpace?: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap" | "initial" | "inherit";
    cellWhiteSpace?: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap" | "initial" | "inherit";
    alignContentBody?: "flex-start" | "center" | "flex-end" | "stretch";
};

export const cellAlignOptions = (options: CellAlignOptions = {}): MUIDataTableColumnOptions => {
    const {
        align = "left",
        sort = false,
        width = "",
        maxWidth = "",
        headerWhiteSpace = "nowrap",
        cellWhiteSpace = "",
        alignContentBody = "center",
    } = options;

    return {
        filter: true,
        sort,
        setCellHeaderProps: () => ({
            style: { textAlign: align, width, whiteSpace: headerWhiteSpace },
        }),
        setCellProps: () => ({
            style: {
                textAlign: align,
                alignContent: alignContentBody,
                width,
                maxWidth,
                whiteSpace: cellWhiteSpace,
                overflow: "hidden",
            },
        }),
    };
};

export const defaultOptionStandardDataTable = {
    setTableProps: () => {
        return {
            size: "small",
        };
    },
    print: true,
    download: true,
};

export const smallSizeFooter = {
    "& .MuiTableFooter-root .MuiToolbar-root": {
        minHeight: "40px",
        padding: "0px 14px",
    },
    "& .MuiTableFooter-root .MuiTableCell-root": {
        padding: "0px 16px",
    },
};

interface AuthCheckPermissionProps {
    userPermissions: string[];
    permissions?: PermissionList[];
    condition?: PermissionCondition;
}

export const AuthCheckPermission = ({
    userPermissions,
    permissions,
    condition = "OR",
}: AuthCheckPermissionProps): boolean => {
    if (!permissions) {
        return true;
    }
    return checkPermissions(userPermissions, permissions as PermissionList[], condition);
};

export interface Payload {
    [key: string]: any;
}

export const cleanPayload = (payload: Payload): void => {
    for (const key in payload) {
        if (payload[key] === null || payload[key] === undefined) {
            delete payload[key];
        } else if (typeof payload[key] === "object") {
            cleanPayload(payload[key] as Payload);
        }
    }
};

export const toExcel = async <TRequest extends Payload>(
    payload: TRequest,
    url: string
): Promise<AxiosResponse<Blob>> => {
    cleanPayload(payload);
    const _url = encodeURLWithParams(APIGW_URL + url, payload); //APIGW_URL ยิงไป uat
    return await axios
        .get(`${_url}`, { responseType: "blob" })
        .then((res: AxiosResponse<Blob>) => {
            if (res.status === 200) {
                return res;
            } else {
                throw Error(res.statusText);
            }
        })
        .catch((err) => {
            throw err;
        });
};

export const toExcelPost = async <TRequest extends Payload>(
    payload: TRequest,
    url: string
): Promise<AxiosResponse<Blob>> => {
    const _url = APIGW_URL + url;
    return await axios
        .post(_url, payload)
        .then((res) => {
            if (res.status !== 200) {
                throw new Error(res.data.message);
            } else {
                return axios.post(_url, payload, { responseType: "blob" });
            }
        })
        .catch((err) => {
            throw err;
        });
};

// ฟังก์ชันสําหรับการแปลงข้อมูล JSON เป็น Excel
export const jsonToExcel = (jsonData: any[], fileName: string): void => {
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const setBankLogo = (bankId?: number): string | undefined => {
    let avatarSrc: string | undefined;
    const basePath = "/imgs/bankLogos";

    switch (bankId) {
        case 3:
            avatarSrc = `${basePath}/KTB_Logo.png`;
            break;
        case 4:
            avatarSrc = `${basePath}/SCB_Logo.jpg`;
            break;
        case 5:
        case 93468:
            avatarSrc = `${basePath}/TTB_Logo.png`;
            break;
        case 6:
            avatarSrc = `${basePath}/GSB_Logo.jpg`;
            break;
        case 7:
            avatarSrc = `${basePath}/BBL_Logo.png`;
            break;
        case 8:
            avatarSrc = `${basePath}/KBANK_Logo.png`;
            break;
        case 9:
            avatarSrc = `${basePath}/BAY_Logo.png`;
            break;
        case 10:
            avatarSrc = `${basePath}/BAAC_Logo.jpg`;
            break;
        case 11:
            avatarSrc = `${basePath}/TBANK_Logo.jpg`;
            break;
        case 12:
            avatarSrc = `${basePath}/CIMB_Logo.png`;
            break;
        case 13:
            avatarSrc = `${basePath}/LHBANK_Logo.png`;
            break;
        case 31501:
            avatarSrc = `${basePath}/KKB_Logo.png`;
            break;
        case 32692:
            avatarSrc = `${basePath}/UOB_Logo.jpg`;
            break;
        case 75751:
            avatarSrc = `${basePath}/ISBT_Logo.png`;
            break;
        case 93435:
            avatarSrc = `${basePath}/GHB_Logo.jpg`;
            break;
        default:
            break;
    }
    return avatarSrc;
};

export const setBenefitIcons = (benefitId?: number): string | undefined => {
    let avatarSrc: string | undefined;
    const basePath = "/imgs/benefitIcons";

    switch (benefitId) {
        case 2:
            avatarSrc = `${basePath}/Doctor.png`;
            break;
        case 3:
            avatarSrc = `${basePath}/Heal.png`;
            break;
        case 4:
            avatarSrc = `${basePath}/ICU.png`;
            break;
        case 5:
            avatarSrc = `${basePath}/IPD.png`;
            break;
        case 6:
            avatarSrc = `${basePath}/OPD_Accident.png`;
            break;
        case 7:
            avatarSrc = `${basePath}/OPD_Health.png`;
            break;
        case 8:
            avatarSrc = `${basePath}/OR.png`;
            break;
        default:
            break;
    }
    return avatarSrc;
};

export const PRODUCT_TYPE_GROUP = {
    PH: [6],
    PA: [26],
    //claim misc
    HOUSE: [10],
    MOTOR: [11],
    PA_COMMUNITY: [27],
    SMILE_PA: [32],
    TA: [33],
    PA_PERSONNEL: [38],
    PA_310: [41],
    FIRE: [42],
    // all claim misc
    CLAIM_MISC: [10, 11, 27, 32, 33, 38, 41, 42],
} as const;

export const isProductType = (productTypeId: number | undefined, group: readonly number[]) =>
    productTypeId !== undefined && (group.includes(productTypeId) as boolean);

// หน้ารายละเอียดใบคำขอ (Application ID) ในระบบเดิม — ใช้คู่กับ getApplicationDetailUrl
export const PH_APPLICATION_DETAIL_URL = "https://sssph.siamsmile.co.th/Modules/PH/frmPHDetail.aspx?app=";
export const PA_APPLICATION_DETAIL_URL = "https://ssspa.siamsmile.co.th/Modules/PA/frmApplicationDetail.aspx?app=";

/** `?app=` คือ policyCode แปลงเป็น base64 — encodeURIComponent ซ้ำเพราะ base64 มี `+` ที่ query string อ่านเป็นช่องว่าง */
export const getApplicationDetailUrl = (baseUrl: string, policyCode: string) =>
    `${baseUrl}${encodeURIComponent(btoa(policyCode))}`;

//ClaimStatus
export const backgroundColorMapClaimStatus: Record<number, "#D4EDBC" | "#FFF1CD" | "#FFCFC9"> = {
    2: "#D4EDBC", // Open
    3: "#FFCFC9", // Closed
    4: "#FFF1CD", // Re-Open
};

export const colorMapClaimStatus: Record<number, "#11734B" | "#a56e07" | "#B32615"> = {
    2: "#11734B", // Open
    3: "#B32615", // Closed
    4: "#a56e07", // Re-Open
};

//CaseStatus
export const backgroundColorMapCaseStatus: Record<number, "#D4EDBC" | "#FFF1CD" | "#FFCFC9"> = {
    2: "#D4EDBC", // Open
    3: "#FFCFC9", // Close
    4: "#FFF1CD", // Re-Open
    5: "#FFCFC9", // Cancel
};

export const colorMapCaseStatus: Record<number, "#11734B" | "#a56e07" | "#B32615"> = {
    2: "#11734B", // Open
    3: "#B32615", // Close
    4: "#a56e07", // Re-Open
    5: "#B32615", // Cancel
};

//Decision
export const backgroundColorMapDecision: Record<number, "#D4EDBC" | "#FFF1CD" | "#FFCFC9"> = {
    2: "#FFF1CD", // รอพิจารณา
    3: "#FFF1CD", // รอเอกสาร
    4: "#FFF1CD", // รอแก้ไข
    5: "#FFCFC9", // ปฏิเสธ
    6: "#FFCFC9", // ยกเลิก
    7: "#FFF1CD", // อยู่ระหว่างดำเนินการ
    8: "#FFF1CD", // รอตรวจสอบการแก้ไข
    9: "#D4EDBC", // อนุมัติ
};

export const colorMapDecision: Record<number, "#11734B" | "#a56e07" | "#B32615"> = {
    2: "#a56e07", // รอพิจารณา
    3: "#a56e07", // รอเอกสาร
    4: "#a56e07", // รอแก้ไข
    5: "#B32615", // ปฏิเสธ
    6: "#B32615", // ยกเลิก
    7: "#a56e07", // อยู่ระหว่างดำเนินการ
    8: "#a56e07", // รอตรวจสอบการแก้ไข
    9: "#11734B", // อนุมัติ
};

//PaymentStatus
export const backgroundColorMapPaymentStatus: Record<number, "#D4EDBC" | "#FFF1CD" | "#FFCFC9"> = {
    2: "#FFF1CD", // PendingApproval
    3: "#D4EDBC", // Paid
    4: "#FFCFC9", // Cancelled
    5: "#FFCFC9", // Failed
};

export const colorMapPaymentStatus: Record<number, "#11734B" | "#a56e07" | "#B32615"> = {
    2: "#a56e07", // PendingApproval
    3: "#11734B", // Paid
    4: "#B32615", // Cancelled
    5: "#B32615", // Failed
};

//CustomerPaymentStatus (สถานะการชำระเบี้ยของลูกค้า — customerPaymentStatusCode ส่งมาเป็น string)
export const backgroundColorMapCustomerPaymentStatus: Record<string, "#D4EDBC" | "#FFF1CD" | "#FFCFC9"> = {
    "3301": "#FFCFC9", // ยังไม่มีการชำระเงิน
    "3302": "#FFF1CD", // ชำระเงินแล้วบางส่วน
    "3303": "#D4EDBC", // ชำระเบี้ยครบ
};

export const colorMapCustomerPaymentStatus: Record<string, "#11734B" | "#a56e07" | "#B32615"> = {
    "3301": "#B32615", // ยังไม่มีการชำระเงิน
    "3302": "#a56e07", // ชำระเงินแล้วบางส่วน
    "3303": "#11734B", // ชำระเบี้ยครบ
};

//AppStatus
export const backgroundColorMapAppStatus: Record<number, "#D4EDBC" | "#FFF1CD" | "#FFCFC9"> = {
    2: "#D4EDBC", // ปกติ
    3: "#FFF1CD", // มีกำหนดยกเลิก
    4: "#FFCFC9", // ยกเลิก
    5: "#FFCFC9", // ยกเลิกก่อน DCR
};

export const colorMapPaymentAppStatus: Record<number, "#11734B" | "#a56e07" | "#B32615"> = {
    2: "#11734B", // ปกติ
    3: "#a56e07", // มีกำหนดยกเลิก
    4: "#B32615", // ยกเลิก
    5: "#B32615", // ยกเลิกก่อน DCR
};

/** ชื่อสถานะ App ตาม appStatusId — ใช้เป็น fallback เมื่อ BE ส่ง id มาแต่ไม่ส่งชื่อ (ชุดเดียวกับสีด้านบน) */
export const appStatusLabelMap: Record<number, string> = {
    2: "ปกติ",
    3: "มีกำหนดยกเลิก",
    4: "ยกเลิก",
    5: "ยกเลิกก่อน DCR",
};

//AppStatus
export const backgroundColorMapClaimTransactionType: Record<number, "#FFF1CD" | "#FFCFC9" | "#D4EDBC"> = {
    2: "#FFF1CD", // รอพิจารณา
    3: "#FFF1CD", // รอเอกสาร
    4: "#FFF1CD", // รอแก้ไข
    5: "#FFCFC9", // ปฏิเสธ
    6: "#FFCFC9", // ยกเลิก
    7: "#FFF1CD", // อยู่ระหว่างดำเนินการ
    8: "#FFF1CD", // รอตรวจสอบการแก้ไข
    9: "#D4EDBC", // อนุมัติ
};

export const colorMapClaimTransactionType: Record<number, "#a56e07" | "#B32615" | "#11734B"> = {
    2: "#a56e07", // รอพิจารณา
    3: "#a56e07", // รอเอกสาร
    4: "#a56e07", // รอแก้ไข
    5: "#B32615", // ปฏิเสธ
    6: "#B32615", // ยกเลิก
    7: "#a56e07", // อยู่ระหว่างดำเนินการ
    8: "#a56e07", // รอตรวจสอบการแก้ไข
    9: "#11734B", // อนุมัติ
};
export enum IncidentType {
    Illness = 2,
    Accident = 3,
}

export enum CoverageType {
    Medical = 2,
    Compensate = 3,
    Disability = 4,
    Death = 5,
}

// ลำดับการแสดงประเภทความคุ้มครอง (ทุพพลภาพขึ้นก่อนเสียชีวิต) — id ที่ไม่อยู่ในรายการจะต่อท้ายตามลำดับเดิมจาก API
const COVERAGE_TYPE_DISPLAY_ORDER: number[] = [
    CoverageType.Medical,
    CoverageType.Compensate,
    CoverageType.Disability,
    CoverageType.Death,
];

export const compareCoverageTypeOrder = (a?: number, b?: number): number => {
    const rank = (id?: number) => {
        const index = COVERAGE_TYPE_DISPLAY_ORDER.indexOf(id ?? 0);
        return index === -1 ? COVERAGE_TYPE_DISPLAY_ORDER.length : index;
    };
    return rank(a) - rank(b);
};

export enum MedicalType {
    OPD = 1,
    IPD = 2,
    OR = 3,
    Amb = 4,
    HM = 5,
    DayCaseSurgery = 6,
}

/**
 * ผู้รับเอกสาร (Master DocumentRecipientType)
 * NotApplicable (n/a) ไม่แสดงเป็นตัวเลือกในหน้าแจ้งเคลม PH / PA — ดู DocumentRecipientTypeDropDown
 */
export enum DocumentRecipientType {
    NotApplicable = 1,
    WalkOut = 2,
    WalkIn = 3,
    Pivot = 4,
}

/** รหัสพนักงานของ "000 - คุณสำนักงาน" ใน Master ผู้ให้บริการ / เจ้าของรถ */
export const OFFICE_EMPLOYEE_CODE = "000";

export enum CauseOfIncident {
    Illness = 2, // โรคทั่วไป
    Accident = 3, // อุบัติเหตุทั่วไป
    Motorcycle = 4, // ขับขี่/โดยสารจักรยานยนต์
    Murder = 5, // ฆาตกรรม
    PublicDisaster = 7, // ภัยสาธารณะ
    SchoolLiability = 8, // รับผิดสถานศึกษา
}

/** ระยะเวลาจากวันที่ที่ระบุถึงวันนี้ เป็น "X ปี Y เดือน Z วัน" — ไม่มีวันที่ / วันที่ไม่ถูกต้อง / เป็นวันในอนาคต คืน "-" */
const calculateElapsedText = (fromDate?: string): string => {
    if (!fromDate) return "-";

    const start = dayjs(fromDate);
    const end = dayjs(); // วันปัจจุบัน

    if (!start.isValid() || end.isBefore(start)) return "-";

    const years = end.diff(start, "year");
    const afterYears = start.add(years, "year");

    const months = end.diff(afterYears, "month");
    const afterMonths = afterYears.add(months, "month");

    const days = end.diff(afterMonths, "day");

    return `${years} ปี ${months} เดือน ${days} วัน`;
};

/** อายุกรมธรรม์ นับจากวันเริ่มคุ้มครอง */
export const calculatePolicyAgeText = (coverageFrom?: string): string => calculateElapsedText(coverageFrom);

/** อายุปัจจุบัน นับจากวันเกิด */
export const calculateAgeText = (birthDate?: string): string => calculateElapsedText(birthDate);
