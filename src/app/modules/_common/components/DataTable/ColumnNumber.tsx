import { Grid } from "@mui/material";
import { NumericFormat } from "react-number-format";

type ColumnNumberProps = {
    value?: number | null;
    alignRight?: boolean;
};

const ColumnNumber = ({ value = null, alignRight = true }: ColumnNumberProps) => {
    return (
        <Grid
            style={{ padding: 0, margin: 0 }}
            container
            direction="row"
            justifyContent={alignRight ? "flex-end" : "flex-start"}
            alignItems="center"
        >
            <NumericFormat value={value} thousandSeparator displayType="text" />
        </Grid>
    );
};

export default ColumnNumber;
