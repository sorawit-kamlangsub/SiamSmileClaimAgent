import { Box, Grid, Typography } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { FormikRadioGroup, FormikTextField } from "../../../../_common";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

const procedureOptions = [
    { id: true, name: "ใช่" },
    { id: false, name: "ไม่ใช่" },
];

/** Step 1 : "ข้อมูลการเข้ารับการรักษา" — bind `claim.hn/vn/an` + `medical.*` (hospital-billing-fe.md ข้อ 5) */
const BillingTreatmentSection = ({ readOnly = false }: { readOnly?: boolean }) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const readOnlySx = readOnly ? { "& > *": { pointerEvents: "none" } } : undefined;

    return (
        <CustomPaper sx={readOnlySx}>
            <HeadingWithColor
                icon={<LocalHospitalIcon sx={{ fontSize: 27 }} />}
                text="ข้อมูลการเข้ารับการรักษา"
                color="blue"
            />
            <Box p={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <FormikTextField
                            name="hn"
                            label="HN"
                            formik={formik}
                            size="small"
                            fullWidth
                            required
                            inputProps={{ maxLength: 50 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormikTextField
                            name="vn"
                            label="VN"
                            formik={formik}
                            size="small"
                            fullWidth
                            required
                            inputProps={{ maxLength: 50 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormikTextField
                            name="an"
                            label="AN"
                            formik={formik}
                            size="small"
                            fullWidth
                            inputProps={{ maxLength: 50 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormikTextField
                            name="underlyingDiseaseDetail"
                            label="โรคประจำตัว"
                            formik={formik}
                            size="small"
                            multiline
                            rows={2}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormikTextField
                            name="illnessDetail"
                            label="วินิจฉัยการเจ็บป่วย"
                            formik={formik}
                            size="small"
                            multiline
                            rows={2}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormikTextField
                            name="investigationResults"
                            label="ผลการตรวจ LAB / EKG / X-ray และอื่นๆ"
                            formik={formik}
                            size="small"
                            multiline
                            rows={2}
                            fullWidth
                            inputProps={{ maxLength: 2000 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography fontWeight={600} fontSize={16}>
                            มีการทำหัตถการหรือไม่
                        </Typography>
                        <FormikRadioGroup name="isProcedurePerformed" data={procedureOptions} formik={formik} row />
                    </Grid>
                </Grid>
            </Box>
        </CustomPaper>
    );
};

export default BillingTreatmentSection;
