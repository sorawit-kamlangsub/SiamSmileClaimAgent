import React from "react";
import { Grid, Button } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PolicyIcon from "@mui/icons-material/Policy";
import AddCommentIcon from "@mui/icons-material/AddComment";
import useCheckEligibleToolbar from "../../hooks/CheckEligibleDetail/useCheckEligibleToolbar";
import { FormikCheckbox } from "../../../_common";
import FormikDatePicker from "../../../_common/components/CustomFormik/FormikDatePicker";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
//import CaseTypeDropDown from "../../../_common/components/ClaimAgent/CustomDropdown/CaseTypeDropDown";

const SearchToolbar: React.FC = () => {
    const { formik } = useCheckEligibleToolbar();

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CustomPaper>
                <Grid container spacing={1} alignItems="center">
                    {/* <Grid item xs={12} sm={4} lg={3}>
                        <CaseTypeDropDown formik={formik} name="claimType" fullWidth required />
                    </Grid> */}

                    <Grid item xs={12} sm={3}>
                        <FormikDatePicker formik={formik} name="incidentDate" label="วันที่เกิดเหตุ" fullWidth />
                    </Grid>

                    <Grid item xs={12} sm={2} lg={2} alignItems="center">
                        <FormikCheckbox formik={formik} name="isContinuous" label="เป็นเคลมต่อเนื่อง" />
                    </Grid>

                    <Grid item xs={12} sm={3} lg={2} alignItems="center">
                        <Button
                            variant="contained"
                            startIcon={<PolicyIcon />}
                            onClick={() => formik.submitForm()}
                            size="medium"
                            fullWidth
                            sx={{
                                bgcolor: "#1a5da8",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 14,
                                "&:hover": { bgcolor: "#154a8a" },
                            }}
                        >
                            ค้นหา
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3} lg={2} alignItems="center">
                        <Button
                            variant="contained"
                            startIcon={<AddCommentIcon />}
                            onClick={() => {
                                window.open(`/claim/ph`, "_blank");
                            }}
                            disabled={!formik.values.claimType}
                            size="medium"
                            fullWidth
                            sx={{
                                bgcolor: "#2e7d32",
                                textTransform: "none",
                                fontWeight: 500,
                                fontSize: 14,
                                "&:hover": { bgcolor: "#1b5e20" },
                            }}
                        >
                            แจ้งเคลม
                        </Button>
                    </Grid>
                </Grid>
            </CustomPaper>
        </LocalizationProvider>
    );
};

export default SearchToolbar;
