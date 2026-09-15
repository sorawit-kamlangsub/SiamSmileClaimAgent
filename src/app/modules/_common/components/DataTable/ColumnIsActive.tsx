import { Chip, Grid, Icon } from "@mui/material";
import { green, red } from "@mui/material/colors";

type ColumnIsActiveProps = {
    value?: boolean | null;
    activeText?: string;
    inActiveText?: string;
};

const ColumnIsActive = ({ value = null, activeText = "Active", inActiveText = "InActive" }: ColumnIsActiveProps) => {
    return (
        <div>
            {value !== null && (
                <Grid sx={{ p: 0, m: 0 }} container direction="row" justifyContent="flex-start" alignItems="center">
                    <Chip
                        size="small"
                        icon={
                            <Icon
                                style={{
                                    backgroundColor: value ? green[300] : red[300],
                                    color: "#fff",
                                }}
                            >
                                {value ? "done" : "close"}
                            </Icon>
                        }
                        style={{
                            color: "#fff",
                            backgroundColor: value ? green[300] : red[300],
                            paddingLeft: 5,
                        }}
                        label={value ? activeText : inActiveText}
                    />
                </Grid>
            )}
        </div>
    );
};

export default ColumnIsActive;
