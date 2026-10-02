import { Grid, Typography } from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useFormikContext } from "formik";

import CollapsibleSection from "./CollapsibleSection";
import { FormikDropdown, FormikRadioGroup, FormikTextField } from "../../../../_common";
import { useGetPhysicalTherapyNecessityReason } from "../../../../../api/coreClaimMastersApi";
import { HospitalConsiderValues } from "../../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";

const physicalTherapyOptions = [
    { id: "yes", name: "ใช่" },
    { id: "no", name: "ไม่ใช่" },
];

/**
 * RC-005 5.5 Section "ความจำเป็นทางการแพทย์ *" — ส่งเป็น case.casePhysicalTherapy
 * บังคับเลือก ใช่/ไม่ใช่ · เลือก "ใช่" ต้องเลือกเหตุผลความจำเป็นจาก master necessity-reason (+ รายละเอียดเพิ่มเติม)
 * เลือก "ไม่ใช่" แล้วเหตุผลที่ค้างไว้ไม่ถูกส่ง — HospitalClaimDetailsTab ส่งเหตุผลเฉพาะตอน "ใช่"
 */
const MedicalNecessitySection = () => {
    const formik = useFormikContext<HospitalConsiderValues>();
    const { data: necessityReasonData, isLoading: necessityReasonLoading } = useGetPhysicalTherapyNecessityReason();

    return (
        <CollapsibleSection title="ความจำเป็นทางการแพทย์" icon={<MedicalServicesIcon sx={{ fontSize: 27 }} />}>
            <Grid container spacing={2}>
                <Grid item xs={12} data-field-name="isPhysicalTherapy">
                    <Typography fontWeight={600} fontSize={16}>
                        มีการทำกายภาพบำบัดหรือไม่{" "}
                        <Typography component="span" color="error">
                            *
                        </Typography>
                    </Typography>
                    <FormikRadioGroup name="isPhysicalTherapy" data={physicalTherapyOptions} formik={formik} row />
                </Grid>
                {formik.values.isPhysicalTherapy === "yes" && (
                    <>
                        <Grid item xs={12} md={6} data-field-name="physicalTherapyNecessityReasonId">
                            <FormikDropdown
                                name="physicalTherapyNecessityReasonId"
                                label="เหตุผลความจำเป็นทางการแพทย์"
                                formik={formik}
                                data={necessityReasonData?.data ?? []}
                                valueFieldName="physicalTherapyNecessityReasonId"
                                displayFieldName="physicalTherapyNecessityReasonName"
                                isLoading={necessityReasonLoading}
                                size="small"
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormikTextField
                                name="physicalTherapyNecessityReasonDetail"
                                label="รายละเอียดเพิ่มเติม"
                                formik={formik}
                                size="small"
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Grid>
                    </>
                )}
            </Grid>
        </CollapsibleSection>
    );
};

export default MedicalNecessitySection;
