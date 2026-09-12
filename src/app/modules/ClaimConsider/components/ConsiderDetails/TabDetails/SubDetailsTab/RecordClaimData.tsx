import { Box, Grid, Paper, Typography } from "@mui/material";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import ArticleIcon from "@mui/icons-material/Article";
import ClaimTypeSelector, {
    ClaimTypeOption,
} from "../../../../../CreatedClaim/components/CreateClaim/ClaimTypeSelector";
import { CoverageType, MedicalType } from "../../../../../../functionHelpers";
import ChipSelector, { ChipOption } from "../../../../../CreatedClaim/components/CreateClaim/ChipSelector";
import FormikDatePicker from "../../../../../_common/components/CustomFormik/FormikDatePicker";
import dayjs from "dayjs";
import HospitalDropdown from "../../../../../_common/components/ClaimAgent/CustomDropdown/HospitalDropdown";
import CD10Autocomplete from "../../../../../_common/components/ClaimAgent/CustomDropdown/CD10Autocomplete";
import ChiefComplaintAutocomplete from "../../../../../_common/components/ClaimAgent/CustomDropdown/ChiefComplaintAutocomplete";
import FormikTimePicker from "../../../../../_common/components/CustomFormik/FormikTimePicker";
import { FormikTextField } from "../../../../../_common";
import StayDaysSummary from "./StayDaysSummary";
import { EMPTY_STATE_SX } from "../../../../../CreatedClaim/components/CreateClaim/ClaimPH/ClaimFormSection";
import { ClaimConsiderValues } from "../../../../store/claimConsiderSlice";
import { useFormikContext } from "formik";
import ContinuousClaimSection from "../../../ConsiderHospitalDetails/SubDetailsTab/ContinuousClaimSection";
import { ContinuousClaimRow } from "../../../ConsiderHospitalDetails/mock/hospitalConsiderMock";
type RecordClaimDataProps = {
    incidentType: ClaimTypeOption[];
    incidentTypeLoading: boolean;
    coverageType: ClaimTypeOption[];
    causeOfIncident: ChipOption[];
    medicalType: ChipOption[];
    incidentTypeMappingLoading: boolean;
    /** เคลมต่อเนื่อง */
    continuousClaimRows: ContinuousClaimRow[];
    continuousClaimOpen: boolean;
    onContinuousClaimOpenChange: (open: boolean) => void;
    onContinuousClaimToggle: (checked: boolean) => void;
    onContinuousClaimSelect: (row: ContinuousClaimRow) => void;
    onContinuousClaimClear: () => void;
};
const RecordClaimData = ({
    incidentType,
    incidentTypeLoading,
    coverageType,
    causeOfIncident,
    medicalType,
    incidentTypeMappingLoading,
    continuousClaimRows,
    continuousClaimOpen,
    onContinuousClaimOpenChange,
    onContinuousClaimToggle,
    onContinuousClaimSelect,
    onContinuousClaimClear,
}: RecordClaimDataProps) => {
    const formik = useFormikContext<ClaimConsiderValues>();
    const { values } = formik;
    const isMedical =
        values.coverageTypeId === CoverageType.Medical || values.coverageTypeId === CoverageType.Compensate;
    const isDisability = values.coverageTypeId === CoverageType.Disability;
    const isDeath = values.coverageTypeId === CoverageType.Death;

    const isIPD = values.medicalTypeId === MedicalType.IPD || values.medicalTypeId === MedicalType.DayCaseSurgery;
    // เลือกเคลมต่อเนื่องแล้ว = วันที่เกิดเหตุ/อาการสำคัญถูกล็อคตามเคลมเดิม (ดู handleSelectContinuousClaim)
    // ห้ามแก้จนกว่าจะเอาติ๊ก "เป็นเคลมต่อเนื่อง" ออก
    const isContinuousClaimLocked = !!values.continuousClaim;
    // const isManualIPD =
    //     values.coverageTypeId === CoverageType.Medical &&
    //     (values.medicalTypeId === MedicalType.IPD || values.medicalTypeId === MedicalType.DayCaseSurgery);
    // const isOPD = values.medicalTypeId === MedicalType.OPD;
    const handleStayDaysChange = (field: "ipdDays" | "icuDays", value: number) => {
        formik.setFieldValue(field, value);
    };
    return (
        <>
            <CustomPaper>
                <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="บันทึกข้อมูลเคลม" color="blue" />
                <Box component="form" p={2}>
                    <Grid container spacing={2}>
                        {/* เคลมต่อเนื่อง */}
                        <Grid item xs={12}>
                            <ContinuousClaimSection
                                rows={continuousClaimRows}
                                open={continuousClaimOpen}
                                onOpenChange={onContinuousClaimOpenChange}
                                onToggle={onContinuousClaimToggle}
                                onSelect={onContinuousClaimSelect}
                                onClear={onContinuousClaimClear}
                            />
                        </Grid>
                        {/* เหตุของการเคลม */}
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
                        {/* ประเภทความคุ้มครอง */}
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
                                isLoading={incidentTypeMappingLoading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography fontWeight={600} fontSize={16} mb={2}>
                                {"ประเภทการรักษา"}{" "}
                                <Typography component="span" color="error">
                                    *
                                </Typography>
                            </Typography>
                            {isMedical ? (
                                <ChipSelector
                                    formik={formik}
                                    idFieldName="medicalTypeId"
                                    nameFieldName="medicalTypeName"
                                    options={medicalType}
                                    isLoading={incidentTypeMappingLoading}
                                />
                            ) : isDeath || isDisability ? (
                                <ChipSelector
                                    formik={formik}
                                    idFieldName="causeOfIncidentId"
                                    nameFieldName="causeOfIncidentName"
                                    options={causeOfIncident}
                                    isLoading={incidentTypeMappingLoading}
                                />
                            ) : (
                                <Paper variant="outlined" sx={EMPTY_STATE_SX}>
                                    กรุณาเลือกประเภทความคุ้มครองก่อน
                                </Paper>
                            )}
                        </Grid>
                        {/* วันที่ต่างๆ */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Box data-field-name="createdDate">
                                <FormikDatePicker
                                    name="createdDate"
                                    label="วันที่แจ้ง"
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs()}
                                    required
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box data-field-name="documentCompleteDate">
                                <FormikDatePicker
                                    name="documentCompleteDate"
                                    label="วันที่เอกสารครบ"
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs()}
                                    required
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box data-field-name="incidentDate">
                                <FormikDatePicker
                                    name="incidentDate"
                                    label="วันที่เกิดเหตุ"
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs()}
                                    required
                                    disabled={isContinuousClaimLocked}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box data-field-name="incidentTime">
                                <FormikTimePicker
                                    name="incidentTime"
                                    label="เวลาที่เกิดเหตุ"
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    actions={["accept"]}
                                    required
                                />
                            </Box>
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
                            <Box data-field-name="admissionTime">
                                <FormikTimePicker
                                    name="admissionTime"
                                    label="เวลาที่เข้า รพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    actions={["accept"]}
                                    required
                                />
                            </Box>
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
                            <Box data-field-name="dischargeTime">
                                <FormikTimePicker
                                    name="dischargeTime"
                                    label="เวลาที่ออก รพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    actions={["accept"]}
                                    required
                                />
                            </Box>
                        </Grid>
                        {isIPD && (
                            <Grid item xs={12} lg={12} data-field-name="ipdDays">
                                <StayDaysSummary
                                    values={{
                                        ipdDays: formik.values.ipdDays,
                                        icuDays: formik.values.icuDays,
                                    }}
                                    admissionDate={formik.values.admissionDate}
                                    admissionTime={formik.values.admissionTime}
                                    dischargeDate={formik.values.dischargeDate}
                                    dischargeTime={formik.values.dischargeTime}
                                    onChange={handleStayDaysChange}
                                    required={values.medicalTypeId === MedicalType.IPD}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12} lg={12} mt={-1}>
                            <Box data-field-name="hospitalId">
                                <HospitalDropdown formik={formik} name="hospitalId" required />
                            </Box>
                        </Grid>
                        {/* ระบุอาการ */}

                        <Grid item xs={12} lg={12}>
                            <Box data-field-name="chiefComplaintId">
                                <ChiefComplaintAutocomplete
                                    name="chiefComplaintId"
                                    formik={formik}
                                    size="small"
                                    required
                                    disabled={isContinuousClaimLocked}
                                />
                            </Box>
                        </Grid>
                        {values.diagnoses.map((_item, index) => (
                            <Grid item xs={12} lg={12} key={index}>
                                <CD10Autocomplete
                                    name={`diagnoses.${index}.icd10Id`}
                                    formik={formik}
                                    required={index === 0}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={12} lg={12}>
                            <Box data-field-name="remark">
                                <FormikTextField
                                    name="detail"
                                    label="รายละเอียด"
                                    formik={formik}
                                    size="small"
                                    multiline
                                    rows={2}
                                    fullWidth
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </CustomPaper>
        </>
    );
};

export default RecordClaimData;
