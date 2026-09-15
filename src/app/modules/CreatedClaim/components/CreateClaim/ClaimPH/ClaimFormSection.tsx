import React, { useMemo, useState } from "react";
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    FormControlLabel,
    Grid,
    InputAdornment,
    Paper,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { useClaimPHForm } from "../../../hooks/CreateClaim/ClaimPH/useClaimPHForm";
import { FormikTextField, FormikTextNumber, swalWarningNotOutsideClick } from "../../../../_common";
import FormikDatePicker from "../../../../_common/components/CustomFormik/FormikDatePicker";
import ArticleIcon from "@mui/icons-material/Article";
import UploadFileSharpIcon from "@mui/icons-material/UploadFileSharp";
import CalculateIcon from "@mui/icons-material/Calculate";
import CoverageBox from "../CoverageBox";
import OcrDocumentScanSection from "../OcrDocumentScanSection";
import DocumentRecipientTypeDropDown from "../../../../_common/components/ClaimAgent/CustomDropdown/DocumentRecipientTypeDropDown";
import UserAutocompleteApi from "../../../../_common/components/ClaimAgent/CustomDropdown/UserAutocompleteApi";
import ChiefComplaintAutocomplete from "../../../../_common/components/ClaimAgent/CustomDropdown/ChiefComplaintAutocomplete";
import ClaimTypeSelector from "../ClaimTypeSelector";
import ChipSelector from "../ChipSelector";
import dayjs from "dayjs";
import ZebraCarOwnerDropDown from "../../../../_common/components/ClaimAgent/CustomDropdown/ZebraCarOwnerDropDown";
import { claimPHSelector, DeathPlaceType, setOrganLossItems, SymptomType } from "../../../store/claimPHSlice";
import HospitalDropdown from "../../../../_common/components/ClaimAgent/CustomDropdown/HospitalDropdown";
import CD10Autocomplete from "../../../../_common/components/ClaimAgent/CustomDropdown/CD10Autocomplete";
import DocumentScanTable from "../DocumentScanTable";
import DeathClaimAmountCardPH from "./DeathClaimAmountCardPH";
import OrganLossSelector from "../OrganLossSelector";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { useOrganLoss } from "../../../hooks/CreateClaim/useOrganLoss";
import { CoverageType, isProductType, MedicalType, PRODUCT_TYPE_GROUP } from "../../../../../functionHelpers";
import { useNavigate } from "react-router-dom";
import CoverageAndTransferBox from "../CoverageAndTransferBox";
import ConfirmExcessLimitTransferDialog from "../ConfirmExcessLimitTransferDialog";

export const EMPTY_STATE_SX = {
    p: 2,
    textAlign: "center",
    borderStyle: "dashed",
    color: "text.secondary",
    fontSize: 14,
} as const;

interface Props {
    onNext: () => void;
}
export const claimStepBoxSx = {
    border: "1px solid",
    borderColor: "#e8f0fb",
    borderRadius: 2,
    p: 2,
    mb: 2,
    bgcolor: "#fff",
};
const ClaimFormSection: React.FC<Props> = ({ onNext }) => {
    const {
        formik,
        isContinuous,
        isOldClaimLoading,
        incidentType,
        coverageType,
        medicalType,
        causeOfIncident,
        customerBenefit,
        incidentTypeLoading,
        incidentTypeMappingLoading,
        customerBenefitLoading,
        insured,
        shouldShowOcrDocumentScan,
        isOcrDocsValid,
        setIsOcrDocsValid,
        isOcrLoading,
        setIsOcrLoading,
        setOcrResult,
        setOcrDocumentIds,
        getRequiredDocsByCoverageType,
        maxTransferAmount,
    } = useClaimPHForm({ onNext });
    const { values, setFieldValue } = formik;
    const { organChoices, isOrganChoicesLoading, nonCoveredReasonData, isNonCoveredReasonLoading } = useOrganLoss(
        values.coverageTypeId
    );
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { organLossItems } = useAppSelector(claimPHSelector);
    const isMedical =
        values.coverageTypeId === CoverageType.Medical || values.coverageTypeId === CoverageType.Compensate;
    const isDisability = values.coverageTypeId === CoverageType.Disability;
    const isDeath = values.coverageTypeId === CoverageType.Death;

    const isIPD = values.medicalTypeId === MedicalType.IPD || values.medicalTypeId === MedicalType.DayCaseSurgery;
    const isManualIPD =
        values.coverageTypeId === CoverageType.Medical &&
        (values.medicalTypeId === MedicalType.IPD || values.medicalTypeId === MedicalType.DayCaseSurgery);
    const isOPD = values.medicalTypeId === MedicalType.OPD;
    const showOcr = !!values.incidentTypeId && isMedical;
    const requiresOcrValidation = isMedical && shouldShowOcrDocumentScan(values.coverageTypeId);

    const MAX_DIAGNOSES = 3;

    const MEDICAL_TYPE_LABEL_BY_CONDITION: Record<string, string> = {
        death: "สาเหตุการเสียชีวิต",
        medical: "ประเภทการรักษา",
        disability: "สาเหตุการทุพพลภาพ/สูญเสียอวัยวะ",
        default: "ตัวเลือกเพิ่มเติม",
    };
    const medicalTypeLabel = isDeath
        ? MEDICAL_TYPE_LABEL_BY_CONDITION.death
        : isMedical
        ? MEDICAL_TYPE_LABEL_BY_CONDITION.medical
        : isDisability
        ? MEDICAL_TYPE_LABEL_BY_CONDITION.disability
        : MEDICAL_TYPE_LABEL_BY_CONDITION.default;

    // ── ยอดโอนเกินสิทธิ์ (NPL) ──
    const [isConfirmExcessOpen, setIsConfirmExcessOpen] = useState(false);
    const currentBenefit = customerBenefit?.data?.find((item) => item.medicalTypeId === values.medicalTypeId);
    // เคลมต่อเนื่อง: เทียบกับ benefit คงเหลือ (remainAmount) แทนวงเงินสูงสุด (maxPrice)
    const totalEligibleAmount = useMemo(
        () =>
            (customerBenefit?.data ?? []).reduce(
                (sum, item) => sum + ((isContinuous ? item.remainAmount : item.maxPrice) ?? 0),
                0
            ),
        [customerBenefit?.data, isContinuous]
    );
    const maxPrice = isManualIPD
        ? totalEligibleAmount
        : isContinuous
        ? currentBenefit?.remainAmount
        : currentBenefit?.maxPrice;
    const isOverEligibleLimit = typeof maxPrice === "number" && (values.transferAmount ?? 0) > maxPrice;

    const handleSubmit = async () => {
        const errs = await formik.validateForm();
        if (Object.keys(errs).length > 0) {
            await formik.setTouched(Object.keys(errs).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
            const fieldOrder = [
                "documentRecipientTypeId",
                "serviceProviderId",
                "zebraId",
                "incidentTypeId",
                "coverageTypeId",
                "medicalTypeId",
                "causeOfIncidentId",
                "incidentDate",
                "admissionDate",
                "dischargeDate",
                "symptomType",
                "chiefComplaintId",
                "remark",
                "notificationDate",
                "documentCompleteDate",
                "deathDate",
                "hospitalId",
                "accidentPlace",
                "transferAmount",
            ];
            const firstErrorField = fieldOrder.find((f) => errs[f as keyof typeof errs]);
            if (firstErrorField) {
                setTimeout(() => {
                    const el = document.querySelector(`[data-field-name="${firstErrorField}"]`);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
            }
            return;
        }
        if (requiresOcrValidation && !isOcrDocsValid) {
            swalWarningNotOutsideClick("แจ้งเตือน", "กรุณาแนบเอกสารให้ครบถ้วนตามที่กำหนด");
            return;
        }
        // ยอดที่ขอเบิกเกินสิทธิ์เบิกสูงสุด (NPL) ต้องให้ผู้ใช้ยืนยันยอดก่อน
        if (isOverEligibleLimit) {
            setIsConfirmExcessOpen(true);
            return;
        }
        formik.submitForm();
    };

    return (
        <>
            <Backdrop open={formik.isSubmitting} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <CustomPaper>
                <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="บันทึกข้อมูลเคลม" color="blue" />
                <Box component="form" p={2}>
                    <Grid container spacing={2}>
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
                            {values.incidentTypeId ? (
                                <ClaimTypeSelector
                                    formik={formik}
                                    options={coverageType}
                                    idFieldName="coverageTypeId"
                                    nameFieldName="coverageTypeName"
                                    isLoading={incidentTypeMappingLoading}
                                />
                            ) : (
                                <Paper variant="outlined" sx={EMPTY_STATE_SX}>
                                    กรุณาเลือกเหตุของการเคลมก่อน ระบบจะแสดงประเภทความคุ้มครองตามผลิตภัณฑ์ PH
                                </Paper>
                            )}
                        </Grid>

                        {/* ประเภทการรักษา / สาเหตุ */}
                        <Grid item xs={12}>
                            <Typography fontWeight={600} fontSize={16} mb={2}>
                                {medicalTypeLabel}{" "}
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

                        {/* ผู้รับเอกสาร / ผู้ให้บริการ / เจ้าของรถ */}
                        <Grid item xs={12} md={4}>
                            <Box data-field-name="documentRecipientTypeId">
                                <DocumentRecipientTypeDropDown
                                    firstItemText="-- เลือก --"
                                    formik={formik}
                                    name="documentRecipientTypeId"
                                    fullWidth
                                    required
                                    selectedCallback={(item) => {
                                        formik.setFieldValue(
                                            "documentRecipientTypeName",
                                            item?.documentRecipientTypeName
                                        );
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4} mt={-1}>
                            <Box data-field-name="serviceProviderId">
                                <UserAutocompleteApi
                                    formik={formik}
                                    name="serviceProviderId"
                                    fullWidth
                                    required
                                    selectedCallback={(item) => {
                                        formik.setFieldValue("serviceProviderName", item?.personName);
                                        formik.setFieldValue("serviceProviderCode", item?.employeeCode);
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box data-field-name="zebraId">
                                <ZebraCarOwnerDropDown
                                    firstItemText="-- เลือก --"
                                    formik={formik}
                                    name="zebraId"
                                    fullWidth
                                    required
                                    selectedCallback={(item) => {
                                        formik.setFieldValue("zebraCode", item?.zebraCode);
                                        formik.setFieldValue("zebraNo", item?.zebraNo);
                                        formik.setFieldValue("employeeCode", item?.employeeCode);
                                        formik.setFieldValue("employeeName", item?.employeeName);
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* วันที่ต่างๆ */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Box data-field-name="incidentDate">
                                <FormikDatePicker
                                    name="incidentDate"
                                    label="วันที่เกิดเหตุ"
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs()}
                                    required
                                    disabled={isContinuous}
                                />
                            </Box>
                        </Grid>
                        {isMedical && (
                            <Grid item xs={12} sm={6} md={4}>
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
                        )}
                        {isIPD && (
                            <Grid item xs={12} sm={6} md={4}>
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
                        )}
                        {isDeath && (
                            <Grid item xs={12} sm={6} md={4}>
                                <Box data-field-name="deathDate">
                                    <FormikDatePicker
                                        name="deathDate"
                                        label="วันที่เสียชีวิต"
                                        formik={formik}
                                        slotProps={{ textField: { size: "small" } }}
                                        maxDate={dayjs()}
                                        required
                                    />
                                </Box>
                            </Grid>
                        )}
                        {(isDeath || isDisability) && (
                            <>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box data-field-name="notificationDate">
                                        <FormikDatePicker
                                            name="notificationDate"
                                            label="วันที่รับแจ้ง"
                                            formik={formik}
                                            slotProps={{ textField: { size: "small" } }}
                                            maxDate={dayjs()}
                                            required
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
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
                                {isDeath && (
                                    <>
                                        <Grid item xs={12}>
                                            <Typography fontWeight={600} fontSize={16}>
                                                สถานที่เสียชีวิต{" "}
                                                <Typography component="span" color="error">
                                                    *
                                                </Typography>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <RadioGroup
                                                row
                                                value={values.deathPlaceType}
                                                onChange={(e) =>
                                                    setFieldValue("deathPlaceType", Number(e.target.value))
                                                }
                                            >
                                                <FormControlLabel
                                                    value={DeathPlaceType.Home}
                                                    control={<Radio size="small" />}
                                                    label="ที่บ้าน"
                                                />
                                                <FormControlLabel
                                                    value={DeathPlaceType.Hospital}
                                                    control={<Radio size="small" />}
                                                    label="สถานพยาบาล"
                                                />
                                                <FormControlLabel
                                                    value={DeathPlaceType.Other}
                                                    control={<Radio size="small" />}
                                                    label="อื่นๆ"
                                                />
                                            </RadioGroup>
                                        </Grid>
                                        {values.deathPlaceType === DeathPlaceType.Hospital && (
                                            <Grid item xs={12} lg={9} mt={-1}>
                                                <Box data-field-name="hospitalId">
                                                    <HospitalDropdown formik={formik} name="hospitalId" required />
                                                </Box>
                                            </Grid>
                                        )}
                                        {values.deathPlaceType === DeathPlaceType.Other && (
                                            <Grid item xs={12} lg={9}>
                                                <Box data-field-name="accidentPlace">
                                                    <FormikTextField
                                                        name="accidentPlace"
                                                        label="สถานที่เสียชีวิต"
                                                        formik={formik}
                                                        size="small"
                                                        fullWidth
                                                        required
                                                        placeholder="ระบุสถานที่เสียชีวิต"
                                                    />
                                                </Box>
                                            </Grid>
                                        )}
                                    </>
                                )}
                                {isDisability && (
                                    <Grid item xs={12} lg={9} mt={-1}>
                                        <Box data-field-name="hospitalId">
                                            <HospitalDropdown formik={formik} name="hospitalId" required />
                                        </Box>
                                    </Grid>
                                )}
                            </>
                        )}
                        {/* ระบุอาการ */}
                        {!isDeath && !isDisability && (
                            <Grid item xs={12}>
                                <RadioGroup
                                    row
                                    value={values.symptomType}
                                    onChange={(e) => setFieldValue("symptomType", Number(e.target.value))}
                                >
                                    <FormControlLabel
                                        value={SymptomType.ChiefComplaint}
                                        control={<Radio size="small" />}
                                        label="ระบุอาการ"
                                    />
                                    <FormControlLabel
                                        value={SymptomType.Other}
                                        control={<Radio size="small" />}
                                        label="อื่นๆ"
                                    />
                                </RadioGroup>
                            </Grid>
                        )}
                        {(values.symptomType === SymptomType.ChiefComplaint || isDeath || isDisability) && (
                            <Grid item xs={12} lg={9}>
                                <Box data-field-name="chiefComplaintId">
                                    <ChiefComplaintAutocomplete
                                        name="chiefComplaintId"
                                        formik={formik}
                                        size="small"
                                        required
                                    />
                                </Box>
                            </Grid>
                        )}
                        {(isDeath || isDisability) && (
                            <>
                                {values.diagnoses.map((_item, index) => (
                                    <Grid item xs={12} lg={9} key={index}>
                                        <CD10Autocomplete
                                            name={`diagnoses.${index}.icd10Id`}
                                            formik={formik}
                                            loading={isOldClaimLoading}
                                            disabled={isOldClaimLoading}
                                        />
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            if (values.diagnoses.length < MAX_DIAGNOSES) {
                                                setFieldValue("diagnoses", [
                                                    ...values.diagnoses,
                                                    {
                                                        icd10Id: undefined,
                                                        icd10Detail: undefined,
                                                    },
                                                ]);
                                            }
                                        }}
                                        size="medium"
                                        disabled={values.diagnoses.length >= MAX_DIAGNOSES}
                                    >
                                        เพิ่มการวินิจฉัย
                                    </Button>
                                </Grid>
                            </>
                        )}
                        {(values.symptomType === SymptomType.Other || isDeath || isDisability) && (
                            <Grid item xs={12} lg={9}>
                                <Box data-field-name="remark">
                                    <FormikTextField
                                        name="remark"
                                        label="หมายเหตุ"
                                        formik={formik}
                                        size="small"
                                        multiline
                                        rows={2}
                                        fullWidth
                                        required={values.symptomType === SymptomType.Other}
                                    />
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                    {isDisability && (
                        <Box sx={claimStepBoxSx} mt={2}>
                            <OrganLossSelector
                                value={organLossItems}
                                organChoices={organChoices}
                                isOrganChoicesLoading={isOrganChoicesLoading}
                                nonCoveredReason={nonCoveredReasonData?.data ?? []}
                                isNonCoveredReasonLoading={isNonCoveredReasonLoading}
                                onChange={(items) => {
                                    dispatch(setOrganLossItems(items));
                                }}
                                customerId={insured?.customerId}
                                maxTransferAmount={maxTransferAmount}
                            />
                        </Box>
                    )}
                    {/* Coverage box */}
                    {(isIPD || isOPD || isDisability) && !isManualIPD && (
                        <Grid item xs={12} mt={2}>
                            <CoverageBox
                                items={customerBenefit?.data ?? []}
                                isLoading={customerBenefitLoading}
                                isContinuous={isContinuous}
                                planCode={
                                    isProductType(insured?.productTypeId, PRODUCT_TYPE_GROUP.PH)
                                        ? insured?.productName
                                        : insured?.productCategoryName
                                }
                            />
                        </Grid>
                    )}

                    {/* ปุ่มคำนวณวงเงิน */}
                    {isManualIPD && (
                        <>
                            <Grid item xs={12} mt={2}>
                                <CoverageAndTransferBox
                                    items={customerBenefit?.data ?? []}
                                    isLoading={customerBenefitLoading}
                                    isContinuous={isContinuous}
                                    planCode={
                                        isProductType(insured?.productTypeId, PRODUCT_TYPE_GROUP.PH)
                                            ? insured?.productName
                                            : insured?.productCategoryName
                                    }
                                    benefitAmounts={formik.values.benefitAmounts}
                                    medicalTypeId={formik.values.medicalTypeId}
                                    onBenefitAmountsChange={(value) => formik.setFieldValue("benefitAmounts", value)}
                                    onTransferAmountChange={(value) => formik.setFieldValue("transferAmount", value)}
                                    debounceMs={300}
                                />
                            </Grid>
                            <Grid item xs={12} mt={2}>
                                <Grid container justifyContent="center">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="large"
                                        startIcon={<CalculateIcon />}
                                        sx={{ mb: 1 }}
                                        onClick={() => navigate("/claim-simulation")}
                                    >
                                        เปิดโปรแกรมคำนวณวงเงินเคลม
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {/* จำนวนเงิน */}
                    {!isDisability && !isDeath && !isManualIPD && (
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                <Grid item xs={12} sm={5.9} md={2.9} mt={1}>
                                    <Box data-field-name="transferAmount">
                                        <FormikTextNumber
                                            name="transferAmount"
                                            label="จำนวนเงิน"
                                            formik={formik}
                                            decimalScale={2}
                                            fixedDecimalScale
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                                            }}
                                            required
                                        />
                                    </Box>
                                </Grid>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#c8a415",
                                        bgcolor: "#fdf6e3",
                                        px: 0.3,
                                        py: 0.3,
                                        fontWeight: "bold",
                                        whiteSpace: { xs: "normal", sm: "nowrap" },
                                    }}
                                >
                                    *กรุณากรอกยอดเคลมที่ต้องการโอนทั้งหมด
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                    {isDeath && formik.values.causeOfIncidentId && (
                        <Box>
                            <DeathClaimAmountCardPH
                                items={customerBenefit?.data ?? []}
                                isLoading={customerBenefitLoading}
                            />

                            <Box mt={3}>
                                <Typography mb={1}>จำนวนเงินที่ต้องการโอน</Typography>
                                <Grid item xs={12} lg={6}>
                                    <Box data-field-name="transferAmount">
                                        <FormikTextNumber
                                            name="transferAmount"
                                            label="จำนวนเงินที่ต้องการโอน"
                                            formik={formik}
                                            decimalScale={2}
                                            fixedDecimalScale
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                                            }}
                                            required
                                        />
                                    </Box>
                                </Grid>
                            </Box>
                        </Box>
                    )}
                </Box>
            </CustomPaper>

            {/* สแกนเอกสาร */}
            {showOcr && (
                <CustomPaper>
                    <HeadingWithColor
                        icon={<UploadFileSharpIcon sx={{ fontSize: 27 }} />}
                        text="สแกนเอกสาร OCR (PH)"
                        color="blue"
                    />
                    <OcrDocumentScanSection
                        requiredDocs={getRequiredDocsByCoverageType(formik.values.coverageTypeId ?? 0)}
                        onFilesValidChange={setIsOcrDocsValid}
                        systemFullName={insured?.customerName}
                        systemIdCardNo={insured?.cardDetail}
                        systemAmount={formik.values.transferAmount}
                        systemDateIn={formik.values.admissionDate}
                        onOcrChange={(result) => setOcrResult(result)}
                        formik={formik}
                        applicationCode={insured?.policyCode as string}
                        onOcrLoadingChange={setIsOcrLoading}
                        onDocumentIdsChange={(ids) => setOcrDocumentIds(ids)}
                    />
                </CustomPaper>
            )}
            {(isDeath || isDisability) && (
                <DocumentScanTable
                    productTypeId={6}
                    aplicationCode={insured?.policyCode}
                    Header="สแกนเอกสาร"
                    documentType="เอกสารประกอบการพิจารณาเคลม"
                />
            )}

            <ConfirmExcessLimitTransferDialog
                open={isConfirmExcessOpen}
                onClose={() => setIsConfirmExcessOpen(false)}
                loading={formik.isSubmitting}
                customerName={insured?.customerName as string}
                productLabel="PH"
                idCardNo={insured?.cardDetail as string}
                appId={insured?.policyCode}
                requestedAmount={values.transferAmount ?? 0}
                maxEligibleAmount={maxPrice ?? 0}
                onConfirm={async ({ nplAmount }) => {
                    setIsConfirmExcessOpen(false);
                    await setFieldValue("nplAmount", nplAmount);
                    formik.submitForm();
                }}
            />

            <Box display="flex" justifyContent="flex-end" mb={5}>
                <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    size="medium"
                    disabled={formik.isSubmitting || (requiresOcrValidation && (!isOcrDocsValid || isOcrLoading))}
                    onClick={handleSubmit}
                >
                    ถัดไป
                </Button>
            </Box>
        </>
    );
};

export default ClaimFormSection;
