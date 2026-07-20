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
    if (dateString) {
        return dayjs(dateString).format(format);
    }
    return undefined;
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
                alignContent: alignContentBody,
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
