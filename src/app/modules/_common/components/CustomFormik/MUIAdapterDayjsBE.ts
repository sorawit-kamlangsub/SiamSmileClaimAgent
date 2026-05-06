import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default class MUIAdapterDayjsBE extends AdapterDayjs {
    formatByString = (value: Dayjs, formatString: string) => {
        if (formatString.includes("YY")) {
            formatString = formatString.replace("YYYY", "BBBB").replace("YY", "BB");
        }

        return value.format(formatString);
    };

    setYear = (value: Dayjs, year: number) => {
        if (!value) return value;

        if (year > 2200) value = value.set("year", year - 543);
        else value = value.set("year", year);

        return value;
    };
}
