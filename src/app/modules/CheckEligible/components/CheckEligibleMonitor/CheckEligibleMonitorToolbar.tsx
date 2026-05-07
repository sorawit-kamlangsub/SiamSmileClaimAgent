import { Button, Grid } from "@mui/material";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import SearchTypeDropDown from "../../../_common/components/ClaimAgent/CustomDropdown/SearchTypeDropDown";
import { FormikTextField } from "../../../_common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch } from "../../../../../redux";
import { resetSearchcheckeligibleMonitor } from "../../store/checkeligibleSlice";
import useCheckEligibleMonitorToolbarForm from "../../hooks/CheckEligibleMonitor/useCheckEligibleMonitorToolbarForm";

type Props = {};

const CheckEligibleMonitorToolbar = ({}: Props) => {
    const { formik } = useCheckEligibleMonitorToolbarForm();
    const dispatch = useAppDispatch();
    return (
        <>
            <CustomPaper>
                <Grid container spacing={2} sx={{ pb: 1 }}>
                    <Grid item xs={12} sm={5} md={4} lg={3}>
                        <SearchTypeDropDown formik={formik} name="searchTypeId" />
                    </Grid>
                    <Grid item xs={12} sm={5} md={4} lg={5}>
                        <FormikTextField formik={formik} name="searchDetail" label="คำค้นหา" fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3} lg={1.5}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<FontAwesomeIcon style={{ fontSize: 13 }} icon="search" />}
                            size="medium"
                            fullWidth
                            onClick={() => {
                                formik.submitForm();
                            }}
                        >
                            ค้นหา
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3} lg={1.5}>
                        <Button
                            variant="outlined"
                            color="error"
                            size="medium"
                            fullWidth
                            onClick={() => {
                                formik.resetForm();
                                dispatch(resetSearchcheckeligibleMonitor());
                            }}
                        >
                            ล้างค่า
                        </Button>
                    </Grid>
                </Grid>
            </CustomPaper>
        </>
    );
};

export default CheckEligibleMonitorToolbar;
