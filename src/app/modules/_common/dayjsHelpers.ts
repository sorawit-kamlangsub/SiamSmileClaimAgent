import dayjs, { Dayjs } from "dayjs";
import th from "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import timezone from "dayjs/plugin/timezone";

//#region dayjs plugin
dayjs.locale(th);
dayjs.extend(buddhistEra);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");
//#endregion

//#region Private Interfaces
/**
 * ฟังก์ชัน helper
 */
interface DayjsHelpers {
    /**
     * <--- Helper function สำหรับจัดการข้อมูลที่ได้จาก Backend
     */
    get: {
        /**
         * ฟังก์ชันแปลงวันที่จากรูปแบบ string ของ C# เป็น Day.js object
         * @param dateString - วันที่ในรูปแบบ string จาก C#
         * @param format - รูปแบบของวันที่ (Optional) Default: "DD/MM/BBBB"
         * @returns object ประกอบด้วย:
         *   * isValid: boolean - บอกสถานะว่าวันที่ถูกต้องหรือไม่
         *   * dayjsObject: Dayjs (optional) - เก็บ Day.js object ของวันที่
         *   * formattedDate: string (optional) - เก็บวันที่ที่ format ด้วย format ที่กำหนด
         *   * errorMessage: string (optional) - เก็บข้อความแจ้งเตือนกรณีวันที่ไม่ถูกต้อง
         */
        convertFromCsharpDate(
            dateString: string,
            format?: string
        ): {
            isValid: boolean;
            dayjsObject?: Dayjs;
            formattedDate?: string;
            errorMessage?: string;
        };
        /**
         * ฟังก์ชันดึง 'วันแรกของเดือนปัจจุบัน'
         * @returns Day.js object แทนวันที่เริ่มต้นของเดือนปัจจุบัน
         */
        startOfCurrentMonth: Dayjs;
        /**
         * ฟังก์ชันดึง 'วันสุดท้ายของเดือนปัจจุบัน'
         * @returns Day.js object แทนวันที่สิ้นสุดของเดือนปัจจุบัน
         */
        endOfCurrentMonth: Dayjs;
    };
    /**
     * ---> Helper function สำหรับจัดการข้อมูลส่งกลับไปที่ Backend
     */
    post: {
        /**
         * ฟังก์ชันแปลง Day.js object ไปเป็น string รูปแบบ C#
         * @param dayjsObject - Day.js object
         * @param format - รูปแบบของ output string (Optional) Default: "YYYY-MM-DD HH:mm:ss"
         * @returns String แทนวันที่ หรือ undefined กรณีวันที่ไม่ถูกต้อง
         */
        convertToCsharpDate(dayjsObject: Dayjs, format?: string): string | undefined;
    };
}
//#endregion

//#region Core functions
/**
 * Process
 */
export const dayjsHelpers: DayjsHelpers = {
    get: {
        convertFromCsharpDate(
            dateString: string,
            format: string = "DD/MM/BBBB"
        ): {
            isValid: boolean;
            dayjsObject?: Dayjs;
            formattedDate?: string;
            errorMessage?: string;
        } {
            const formattedDateString = dateString.replace(/\//g, "-");
            const dayjsObject = dayjs(formattedDateString);
            const isValid = dayjsObject.isValid();

            if (isValid) {
                const formattedDate = dayjsObject.format(format);
                return {
                    isValid,
                    dayjsObject,
                    formattedDate,
                };
            } else {
                return {
                    isValid,
                    errorMessage: "วันที่ไม่ถูกต้อง",
                };
            }
        },
        startOfCurrentMonth: dayjs().local().utcOffset(0).startOf("month"),
        endOfCurrentMonth: dayjs().local().utcOffset(0).endOf("month"),
    },
    post: {
        convertToCsharpDate(dayjsObject: Dayjs, format: string = "YYYY-MM-DD HH:mm:ss"): string | undefined {
            if (!dayjsObject.isValid()) return undefined;
            const result = dayjsObject.format(format);
            return result;
        },
    },
};
//#endregion
