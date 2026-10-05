import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default class MUIAdapterDayjsBE extends AdapterDayjs {
    formatByString = (value: Dayjs, formatString: string) => {
        if (formatString.includes("YY")) {
            formatString = formatString.replace("YYYY", "BBBB").replace("YY", "BB");
        }

        // DFUAT-110 : ใช้ locale ของ adapter (adapterLocale = "th" จาก MUIDateTimeThProvider) ตอน format เสมอ เหมือน
        // AdapterDayjs ตัวแม่ — เดิม format ด้วย locale ที่ติดมากับ value ถ้า value ถูกสร้างตอน global locale ไม่ใช่ไทย
        // ชื่อเดือนในหัวปฏิทินจะออกเป็นภาษาอังกฤษ ("July 2569") ทั้งที่ชื่อวันในสัปดาห์เป็นไทย
        return (this.locale ? value.locale(this.locale) : value).format(formatString);
    };

    setYear = (value: Dayjs, year: number) => {
        if (!value) return value;

        if (year > 2200) value = value.set("year", year - 543);
        else value = value.set("year", year);

        return value;
    };
}
