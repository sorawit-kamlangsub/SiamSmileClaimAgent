import { Box, Grid, Typography } from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import { FormikCheckbox, FormikDropdown } from "../../../../../_common";
import { useGetPhysicalTherapyNecessityReason } from "../../../../../../api/coreClaimMastersApi";
import { ClaimConsiderValues } from "../../../../store/claimConsiderSlice";

/**
 * RC-003 3.4 Section "ข้อมูลกายภาพบำบัด" (เคลมลูกค้า) — ส่งเป็น case.casePhysicalTherapy
 * Checkbox "เป็นกายภาพบำบัด" default ไม่ติ๊ก · ติ๊กแล้วต้องเลือก "ความจำเป็นทางการแพทย์" จาก master necessity-reason
 * เอาติ๊กออกแล้วเหตุผลที่ค้างไว้ไม่ถูกส่ง — ClaimDetailsTab ส่งเหตุผลเฉพาะตอนติ๊ก
 */
const PhysicalTherapySection = () => {
    const formik = useFormikContext<ClaimConsiderValues>();
    const { data: necessityReasonData, isLoading: necessityReasonLoading } = useGetPhysicalTherapyNecessityReason();

    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<MedicalServicesIcon sx={{ fontSize: 27 }} />}
                text="ข้อมูลกายภาพบำบัด"
                color="blue"
            />
            <Box p={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography color="text.secondary" fontSize={14}>
                            ข้อมูลประกอบการพิจารณารายการรักษา
                        </Typography>
                        <FormikCheckbox name="isPhysicalTherapyChecked" label="เป็นกายภาพบำบัด" formik={formik} />
                    </Grid>
                    {formik.values.isPhysicalTherapyChecked && (
                        <Grid item xs={12} md={6} data-field-name="physicalTherapyNecessityReasonId">
                            <FormikDropdown
                                name="physicalTherapyNecessityReasonId"
                                label="ความจำเป็นทางการแพทย์"
                                formik={formik}
                                data={necessityReasonData?.data ?? []}
                                valueFieldName="physicalTherapyNecessityReasonId"
                                displayFieldName="physicalTherapyNecessityReasonName"
                                firstItemText="เลือกความจำเป็นทางการแพทย์"
                                disableFirstItem
                                isLoading={necessityReasonLoading}
                                size="small"
                                fullWidth
                                required
                            />
                        </Grid>
                    )}
                </Grid>
            </Box>
        </CustomPaper>
    );
};

export default PhysicalTherapySection;
