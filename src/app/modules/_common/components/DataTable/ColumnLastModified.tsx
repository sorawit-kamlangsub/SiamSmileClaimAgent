import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Palette, PaletteColor, useTheme } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import th from "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { ThemeColorList } from "../../../../layout";

dayjs.locale(th);
dayjs.extend(buddhistEra);

type ColumnLastModifiedProps = {
    username: string;
    lastModified?: string | Dayjs;
    color?: ThemeColorList;
    format?: string;
};

const ColumnLastModified = ({
    username,
    lastModified,
    format = "DD/MM/YYYY HH:mm",
    color = "primary",
}: ColumnLastModifiedProps) => {
    const theme = useTheme();
    const mainColor = (theme.palette[(color ?? "primary") as keyof Palette] as PaletteColor).main;

    let lastModifiedDayjs: Dayjs | null = null;
    if (typeof lastModified === "string") lastModifiedDayjs = dayjs(lastModified);

    if (dayjs.isDayjs(lastModified)) lastModifiedDayjs = lastModified;

    return (
        <>
            <FontAwesomeIcon icon="user" color={mainColor} />
            &nbsp;{username}
            <br />
            {lastModifiedDayjs && (
                <>
                    <FontAwesomeIcon icon="clock" color={mainColor} />
                    &nbsp;
                    {lastModifiedDayjs.format(format)}
                </>
            )}
        </>
    );
};

export default ColumnLastModified;
