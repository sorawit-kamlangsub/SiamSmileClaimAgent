import { Grid, Theme, useMediaQuery } from "@mui/material";

const FooterSlip = () => {
    const breakpoint = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    return (
        <>
            <Grid container spacing={2}>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    sx={{
                        textAlign: breakpoint ? "center" : "start",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: breakpoint ? "center" : "flex-start",
                    }}
                >
                    <img src="/tel.png" alt="telephone" style={{ maxWidth: "200px", maxHeight: "auto" }} />
                </Grid>
            </Grid>
        </>
    );
};

export default FooterSlip;
