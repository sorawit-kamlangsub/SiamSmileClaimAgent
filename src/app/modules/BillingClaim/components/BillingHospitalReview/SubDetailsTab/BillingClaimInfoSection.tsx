import { Box, Grid, Typography } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import { useFormikContext } from "formik";
import dayjs from "dayjs";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { FormikTextField } from "../../../../_common";
import FormikDatePicker from "../../../../_common/components/CustomFormik/FormikDatePicker";
import FormikTimePicker from "../../../../_common/components/CustomFormik/FormikTimePicker";
import ChiefComplaintAutocomplete from "../../../../_common/components/ClaimAgent/CustomDropdown/ChiefComplaintAutocomplete";
import CD10Autocomplete from "../../../../_common/components/ClaimAgent/CustomDropdown/CD10Autocomplete";
import ClaimTypeSelector from "../../../../CreatedClaim/components/CreateClaim/ClaimTypeSelector";
import ChipSelector from "../../../../CreatedClaim/components/CreateClaim/ChipSelector";
import { CoverageType } from "../../../../../functionHelpers";
import { useGetIncidentType, useGetIncidentTypeMapping } from "../../../../../api/coreClaimMastersApi";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../../CreatedClaim/components/CreateClaim/ClaimTypeOptions";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

/** claimSourceId ของเคลมที่เข้ามาทางระบบวางบิล (ใช้ยิง IncidentTypeMapping เหมือนฝั่งพิจารณาเคลม) */
const CLAIM_SOURCE_CONSIDER = 2;

/** Step 1 : "ข้อมูลเคลม" — bind ตรงกับ `BillingClaimDto` (hospital-billing-fe.md ข้อ 5) */
const BillingClaimInfoSection = ({ readOnly = false }: { readOnly?: boolean }) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const { values } = formik;

    const { data: incidentTypeRaw, isLoading: incidentTypeLoading } = useGetIncidentType();
    const incidentType = (incidentTypeRaw?.data ?? []).map((item) => ({
        id: item.incidentTypeId ?? 0,
        name: item.incidentTypeNameTH ?? "",
        icon: INCIDENT_ICON_MAP[item.incidentTypeId ?? 0],
    }));

    const { data: incidentTypeMapping, isLoading: mappingLoading } = useGetIncidentTypeMapping(
        values.incidentTypeId,
        CLAIM_SOURCE_CONSIDER,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
    );

    const coverageType = [
        ...new Map(
            (incidentTypeMapping?.data ?? []).map((item) => [
                item.coverageTypeId,
                {
                    id: item.coverageTypeId ?? 0,
                    name: item.coverageTypeNameTH ?? "",
                    icon: COVERAGE_ICON_MAP[item.coverageTypeId ?? 0],
                },
            ])
        ).values(),
    ];

    const medicalType = [
        ...new Map(
            (incidentTypeMapping?.data ?? [])
                .filter((item) => item.coverageTypeId === values.coverageTypeId)
                .map((item) => [item.medicalTypeId, { id: item.medicalTypeId ?? 0, name: item.medicalTypeCode ?? "" }])
        ).values(),
    ];

    const isMedical =
        values.coverageTypeId === CoverageType.Medical || values.coverageTypeId === CoverageType.Compensate;
    const readOnlySx = readOnly ? { "& > *": { pointerEvents: "none" } } : undefined;

    return (
        <CustomPaper sx={readOnlySx}>
            <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="ข้อมูลเคลม" color="blue" />
            <Box p={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography fontWeight={600} fontSize={16} mb={2}>
                            เหตุของการเคลม{" "}
                            <Typography component="span" color="error">
                                *
                            </Typography>
                        </Typography>
                        <ClaimTypeSelector
                            formik={formik}
                            options={incidentType}
                            idFieldName="incidentTypeId"
                            nameFieldName="incidentTypeName"
                            isLoading={incidentTypeLoading}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography fontWeight={600} fontSize={16} mb={2}>
                            ประเภทความคุ้มครอง{" "}
                            <Typography component="span" color="error">
                                *
                            </Typography>
                        </Typography>
                        <ClaimTypeSelector
                            formik={formik}
                            options={coverageType}
                            idFieldName="coverageTypeId"
                            nameFieldName="coverageTypeName"
                            isLoading={mappingLoading}
                        />
                    </Grid>
                    {isMedical && (
                        <Grid item xs={12}>
                            <Typography fontWeight={600} fontSize={16} mb={2}>
                                ประเภทการรักษา{" "}
                                <Typography component="span" color="error">
                                    *
                                </Typography>
                            </Typography>
                            <ChipSelector
                                formik={formik}
                                idFieldName="medicalTypeId"
                                nameFieldName="medicalTypeName"
                                options={medicalType}
                                isLoading={mappingLoading}
                            />
                        </Grid>
                    )}

                    <Grid item xs={12} sm={6} md={3}>
                        <Box data-field-name="symptomOnsetDate">
                            <FormikDatePicker
                                name="symptomOnsetDate"
                                label="วันที่เริ่มอาการ"
                                formik={formik}
                                slotProps={{ textField: { size: "small" } }}
                                maxDate={dayjs()}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box data-field-name="occurrenceDate">
                            <FormikDatePicker
                                name="occurrenceDate"
                                label="วันที่เกิดเหตุ"
                                formik={formik}
                                slotProps={{ textField: { size: "small" } }}
                                maxDate={dayjs()}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormikTimePicker
                            name="occurrenceTime"
                            label="เวลาเกิดเหตุ"
                            formik={formik}
                            slotProps={{ textField: { size: "small" } }}
                            actions={["accept"]}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} />

                    <Grid item xs={12} sm={6} md={3}>
                        <Box data-field-name="incidentDate">
                            <FormikDatePicker
                                name="incidentDate"
                                label="วันที่เกิดเหตุ (Incident)"
                                formik={formik}
                                slotProps={{ textField: { size: "small" } }}
                                maxDate={dayjs()}
                                required
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormikTimePicker
                            name="incidentTime"
                            label="เวลาเกิดเหตุ (Incident)"
                            formik={formik}
                            slotProps={{ textField: { size: "small" } }}
                            actions={["accept"]}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box data-field-name="admissionDate">
                            <FormikDatePicker
                                name="admissionDate"
                                label="วันที่เข้า รพ."
                                formik={formik}
                                slotProps={{ textField: { size: "small" } }}
                                maxDate={dayjs()}
                                required
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormikTimePicker
                            name="admissionTime"
                            label="เวลาเข้า รพ."
                            formik={formik}
                            slotProps={{ textField: { size: "small" } }}
                            actions={["accept"]}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box data-field-name="dischargeDate">
                            <FormikDatePicker
                                name="dischargeDate"
                                label="วันที่ออก รพ."
                                formik={formik}
                                slotProps={{ textField: { size: "small" } }}
                                maxDate={dayjs()}
                                required
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormikTimePicker
                            name="dischargeTime"
                            label="เวลาออก รพ."
                            formik={formik}
                            slotProps={{ textField: { size: "small" } }}
                            actions={["accept"]}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box data-field-name="chiefComplaintId">
                            <ChiefComplaintAutocomplete name="chiefComplaintId" formik={formik} size="small" required />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box data-field-name="diagnosis1Id">
                            <CD10Autocomplete name="diagnosis1Id" formik={formik} required />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <CD10Autocomplete name="diagnosis2Id" formik={formik} />
                    </Grid>
                    <Grid item xs={12}>
                        <CD10Autocomplete name="diagnosis3Id" formik={formik} />
                    </Grid>

                    <Grid item xs={12}>
                        <FormikTextField
                            name="note"
                            label="รายละเอียดเพิ่มเติม"
                            formik={formik}
                            size="small"
                            multiline
                            rows={2}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </Box>
        </CustomPaper>
    );
};

export default BillingClaimInfoSection;
