import axios, { AxiosResponse } from "axios";
import dayjs from "dayjs";
import th from "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import timezone from "dayjs/plugin/timezone";
import { MUIDataTableColumnOptions } from "mui-datatables";
import { APIGW_URL, PermissionList } from "../Const";
import { PermissionCondition, checkPermissions } from "./modules/_auth";
import { encodeURLWithParams, swalWarning } from "./modules/_common";
import * as XLSX from "xlsx";

dayjs.locale(th);
dayjs.extend(buddhistEra);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

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
    if (dateString) {
        return dayjs(dateString).format(format);
    }
    return undefined;
};

export const backgroundColorMapPaymentStatus: Record<
    number,
    "#5DADE2" | "#FFF1CD" | "#D4EDBC" | "#FFCFC9" | "#E2F2FF" | "#FFE4A1"
> = {
    // 1: "#5DADE2", // NEW
    2: "#FFF1CD", // รอดำเนินการ
    3: "#E2F2FF", // รอตรวจสอบ
    4: "#D4EDBC", // โอนเงินสำเร็จ
    5: "#FFCFC9", // โอนไม่สำเร็จ
    6: "#FFF1CD", // กำลังดำเนินการ
    7: "#FFE4A1", // Sleep การโอนเงิน
    8: "#FFF1CD", // อยู่ระหว่างการโอนเงิน
    9: "#FFF1CD", // รอสร้างรายการ
    10: "#FFF1CD", // รอโอนเงิน
};

export const colorMapPaymentStatus: Record<number, "#0B57D0" | "#11734B" | "#a56e07" | "#B32615" | "#B06F2E"> = {
    // 1: "#0B57D0", // NEW
    2: "#a56e07", // รอดำเนินการ
    3: "#0B57D0", // รอตรวจสอบ
    4: "#11734B", // โอนเงินสำเร็จ
    5: "#B32615", // โอนไม่สำเร็จ
    6: "#a56e07", // กำลังดำเนินการ
    7: "#B06F2E", // Sleep การโอนเงิน
    8: "#a56e07", // อยู่ระหว่างการโอนเงิน
    9: "#a56e07", // รอสร้างรายการ
    10: "#a56e07", // รอโอน
};

export const statusBackgroundColorMapStatus: Record<number, "#FFF1CD" | "#D4EDBC" | "#FFCFC9"> = {
    2: "#FFF1CD", // อยู่ระหว่างการโอนเงิน
    3: "#D4EDBC", // ปกติ
    4: "#FFCFC9", // ยกเลิก
    5: "#FFCFC9", // ปฎิเสธ
    6: "#FFF1CD", // รอพิจารณาจาก บ.ประกัน
    7: "#FFF1CD", // รอแก้ไข
    8: "#FFF1CD", // รออนุมัติ
};

export const statusColorMapStatus: Record<number, "#a56e07" | "#11734B" | "#B32615"> = {
    2: "#a56e07", // อยู่ระหว่างการโอนเงิน
    3: "#11734B", // ปกติ
    4: "#B32615", // ยกเลิก
    5: "#B32615", // ปฎิเสธ
    6: "#a56e07", // รอพิจารณาจาก บ.ประกัน
    7: "#a56e07", // รอแก้ไข
    8: "#a56e07", // รออนุมัติ
};

export const smiFailTypeBackgroundColor: Record<number, "#FFF1CD" | "#FFCFC9"> = {
    2: "#FFCFC9", // SMI ไม่ได้รับข้อมูล
    3: "#FFF1CD", // รอผลการโอนเงิน
};

export const smiFailTypeColor: Record<number, "#a56e07" | "#B32615"> = {
    2: "#B32615", // SMI ไม่ได้รับข้อมูล
    3: "#a56e07", // รอผลการโอนเงิน
};

export const handleClickLink = (redirectURL?: string) => {
    if (redirectURL) {
        window.open(redirectURL, "_blank");
    }
};
export const handleNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // กรอกให้เป็นตัวเลขเท่านั้น
    event.target.value = event.target.value.replace(/[^0-9]/g, "");
};

export const handleFloatingInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // กรอกให้เป็นตัวเลขเท่านั้น
    event.target.value = event.target.value.replace(/[^0-9.]/g, "");
};

export const handleOnePointInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    // ลบตัวอักษรที่ไม่ใช่เลขหรือจุด
    let value = input.value.replace(/[^0-9.]/g, "");
    // อนุญาตให้มีจุดแค่ 1 จุด
    const parts = value.split(".");
    if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
    }
    input.value = value;
};

export const setBankLogo = (bankId?: number): string | undefined => {
    let avatarSrc: string | undefined;
    const basePath = "/imgs";

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
            // Handle default case if needed
            break;
    }
    return avatarSrc;
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

export const styleColLeft = { textAlign: "left", fontSize: 14, fontWeight: 500 };
export const styleColCenter = { textAlign: "center", fontSize: 14, fontWeight: 500 };
export const styleColRight = { textAlign: "right", fontSize: 14, fontWeight: 500 };

type CellAlignOptions = {
    align?: "right" | "center" | "left";
    sort?: boolean;
    width?: string;
    headerWhiteSpace?: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap" | "initial" | "inherit";
    cellWhiteSpace?: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap" | "initial" | "inherit";
    alignContentBody?: "flex-start" | "center" | "flex-end" | "stretch";
};

export const cellAlignOptions = (options: CellAlignOptions = {}): MUIDataTableColumnOptions => {
    const {
        align = "left",
        sort = false,
        width = "",
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
                alignContent: alignContentBody, // Align content vertically in the cell
                width,
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
    // สร้าง worksheet จากข้อมูล JSON
    const worksheet = XLSX.utils.json_to_sheet(jsonData);

    // สร้าง workbook ใหม่และเพิ่ม worksheet เข้าไป
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // แปลง workbook เป็น binary array
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    // สร้าง Blob จาก buffer ที่ได้
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // สร้างลิงก์สำหรับดาวน์โหลดไฟล์
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ฟังก์ชันสําหรับการแปลงข้อมูล JSON เป็น Excel แบบตัดคอลัมน์ 1 และ 4 ออก
export const jsonToExcelSlice1 = (jsonData: any[], fileName: string): void => {
    if (jsonData.length === 0) {
        swalWarning("แจ้งเตือน !", "ไม่มีข้อมูลให้แปลงเป็น Excel");
        return;
    }

    // ดึงคีย์ทั้งหมดของ object แรก
    const allKeys = Object.keys(jsonData[0]);

    // เอาคีย์แรก (index 0) และคีย์ที่สี่ (index 4) ออก
    const keysToKeep = allKeys.filter((_, index) => index !== 0 && index !== 4);

    // ลบคอลัมน์ที่ 1 และ 4 จากทุก object
    const trimmedData = jsonData.map((obj) => {
        const newObj: any = {};
        keysToKeep.forEach((key) => {
            newObj[key] = obj[key];
        });
        return newObj;
    });

    // แปลงเป็น worksheet
    const worksheet = XLSX.utils.json_to_sheet(trimmedData);

    // สร้าง workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // แปลงเป็น binary และสร้าง Blob
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // ดาวน์โหลดไฟล์
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

export const renderDashboardValue = (itemCount: number | undefined, decimalPlaces: number = 2): string => {
    let result: string = "-";
    if (typeof itemCount != "undefined") result = numberWithCommas(itemCount, decimalPlaces);

    return result;
};
export const renderDashboardNumberValue = (itemCount: number | undefined, decimalPlaces: number = 2): string => {
    let result: string = "0";
    if (typeof itemCount != "undefined") result = numberWithCommas(itemCount, decimalPlaces);

    return result;
};

export const formatDateStringApi = (date: string | undefined, format: string): string => {
    if (!date) return "";
    return dayjs(date).format(format);
};

export const takeFirstString = (str: string, count: number): string => {
    return str.substring(0, count);
};

export const takeLastString = (str: string, count: number): string => {
    return str.slice(-count);
};

export const decimalCheck = (num: number) => {
    return /^(\d+(\.\d{1,2})?)?$/.test(num.toString());
};

//เช็คว่าเป็น DeadClaim
export const isDeadClaim = (claimAdmitType: string, product: number): boolean => {
    let isShow = false;
    //PH
    // Dead Claim ทั่วไป(D)
    // Dead Claim อุบัติเหตุ(D)
    // สูญเสียอวัยวะ/ทุพพลภาพ (อุบัติเหตุทั่วไป)
    // สูญเสียอวัยวะ/ทุพพลภาพ (อุบัติเหตุจักรยานยนต์)
    if (
        product === 6 &&
        (claimAdmitType === "4000" ||
            claimAdmitType === "4001" ||
            claimAdmitType === "5001" ||
            claimAdmitType === "5002")
    ) {
        isShow = true;
    }
    //PA
    // ชดเชย สูญเสียอวัยวะ
    // เสียชีวิต อุบัติเหตุทั่วไป
    // เสียชีวิต อุบัติเหตุ ฆาตกรรม - MC
    // เสียชีวิต โรคทั่วไป
    // ทุพพลภาพ
    // ความรับผิดสถานศึกษา
    // ภัยสาธารณะ
    if (
        product === 26 &&
        (claimAdmitType === "4005" ||
            claimAdmitType === "4006" ||
            claimAdmitType === "4006_2" ||
            claimAdmitType === "4007" ||
            claimAdmitType === "4008" ||
            claimAdmitType === "4009" ||
            claimAdmitType === "4010")
    ) {
        isShow = true;
    }
    return isShow;
};
export const isDeadClaimMisc = (claimAdmitType: number | undefined): boolean => {
    let isShow = false;

    if (
        claimAdmitType === 4 ||
        claimAdmitType === 5 ||
        claimAdmitType === 6 ||
        claimAdmitType === 7 ||
        claimAdmitType === 8 ||
        claimAdmitType === 9 ||
        claimAdmitType === 17
    ) {
        isShow = true;
    }
    return isShow;
};

export const isClaimMiscDeathClaim = (claimAdmitType: number | undefined): number => {
    let isShow = 0;

    if (claimAdmitType === 4 || claimAdmitType === 5 || claimAdmitType === 6 || claimAdmitType === 17) {
        isShow = 1; //ประเภทเสียชีวิต
    }
    if (claimAdmitType === 7 || claimAdmitType === 8 || claimAdmitType === 9) {
        isShow = 2; //ประเภททุพพลภาพ
    }

    return isShow;
};
