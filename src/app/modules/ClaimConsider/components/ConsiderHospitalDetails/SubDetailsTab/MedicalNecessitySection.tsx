import { Divider, Grid } from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useFormikContext } from "formik";

import CollapsibleSection from "./CollapsibleSection";
import { FormikCheckbox, FormikDropdown } from "../../../../_common";
import { useGetPhysicalTherapyNecessityReason } from "../../../../../api/coreClaimMastersApi";
import { HospitalConsiderValues } from "../../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";

/**
 * RC-005 5.5 Section "ข้อมูลกายภาพบำบัด" (DFUAT-070 เปลี่ยนชื่อจาก "ความจำเป็นทางการแพทย์") — ส่งเป็น case.casePhysicalTherapy
 * Checkbox "เป็นการกายภาพบำบัด" (ชุดเดียวกับเคลมลูกค้า RC-003 3.4) · ติ๊กแล้วต้องเลือก "ความจำเป็นทางการแพทย์"
 * จาก master necessity-reason · เอาติ๊กออกแล้วเหตุผลที่ค้างไว้ไม่ถูกส่ง — HospitalClaimDetailsTab ส่งเหตุผลเฉพาะตอนติ๊ก
 */
const MedicalNecessitySection = () => {
    const formik = useFormikContext<HospitalConsiderValues>();
    const { data: necessityReasonData, isLoading: necessityReasonLoading } = useGetPhysicalTherapyNecessityReason();

    return (
        <CollapsibleSection
            title="ข้อมูลกายภาพบำบัด"
            subtitle="ข้อมูลประกอบการพิจารณารายการรักษา"
            icon={<MedicalServicesIcon sx={{ fontSize: 27 }} />}
        >
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormikCheckbox name="isPhysicalTherapyChecked" label="เป็นการกายภาพบำบัด" formik={formik} />
                </Grid>
                {formik.values.isPhysicalTherapyChecked && (
                    <>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12} data-field-name="physicalTherapyNecessityReasonId">
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
                    </>
                )}
            </Grid>
        </CollapsibleSection>
    );
};

export default MedicalNecessitySection;
