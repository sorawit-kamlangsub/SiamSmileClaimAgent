import { Grid, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import th from "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import thaiStrings from "react-timeago/lib/language-strings/th";

dayjs.locale(th);
dayjs.extend(buddhistEra);

export type ColumnDateTimeProps = {
    value?: string | null;
    format?: string;
    nullValueText?: string;
    agoTooltip?: boolean;
};

const ColumnDateTime = ({
    value,
    format = "DD/MM/YYYY HH:mm",
    nullValueText = "-",
    agoTooltip = false,
}: ColumnDateTimeProps) => {
    const formatter = buildFormatter(thaiStrings);

    return (
        <Grid
            style={{ padding: 0, margin: 0 }}
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
        >
            {value ? (
                <>
                    {agoTooltip ? (
                        <Tooltip title={<TimeAgo date={value} formatter={formatter} />} arrow>
                            <Typography variant="body2">{dayjs(value).format(format)}</Typography>
                        </Tooltip>
                    ) : (
                        <Typography variant="body2">{dayjs(value).format(format)}</Typography>
                    )}
                </>
            ) : (
                <Typography>{nullValueText}</Typography>
            )}
        </Grid>
    );
};

export default ColumnDateTime;
