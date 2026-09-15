import { Box, Button, Grid, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FormikTextField } from "../../_common";
import useSearchFilterClaimForBank from "../hooks/SearchFilterClaimForBank";

const SearchFilterClaimForBank = () => {
    const { formik } = useSearchFilterClaimForBank();
    return (
        <>
            <Box>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={6} md={3} lg={3}>
                            <FormikTextField
                                formik={formik}
                                name="searchDetail"
                                label="ค้นหา"
                                placeholder="กรุณากรอกเลขที่ CPG / CL"
                                required
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={3} lg={3} sx={{ display: "flex", alignItems: "center" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon />}
                                sx={{ width: "50%" }}
                                onClick={() => formik.handleSubmit()}
                            >
                                ค้นหา
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </>
    );
};

export default SearchFilterClaimForBank;
