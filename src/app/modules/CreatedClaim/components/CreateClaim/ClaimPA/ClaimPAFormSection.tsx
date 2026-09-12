import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Backdrop,
    Box,
    Button,
    Checkbox,
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
import { FormikTextField, FormikTextNumber, swalWarningNotOutsideClick } from "../../../../_common";
import FormikDatePicker from "../../../../_common/components/CustomFormik/FormikDatePicker";
import ArticleIcon from "@mui/icons-material/Article";
import UploadFileSharpIcon from "@mui/icons-material/UploadFileSharp";
import CalculateIcon from "@mui/icons-material/Calculate";
import SchoolIcon from "@mui/icons-material/School";
import DocumentRecipientTypeDropDown from "../../../../_common/components/ClaimAgent/CustomDropdown/DocumentRecipientTypeDropDown";
import UserAutocompleteApi from "../../../../_common/components/ClaimAgent/CustomDropdown/UserAutocompleteApi";
import ChiefComplaintAutocomplete from "../../../../_common/components/ClaimAgent/CustomDropdown/ChiefComplaintAutocomplete";
import ClaimTypeSelector from "../ClaimTypeSelector";
import ChipSelector from "../ChipSelector";
import dayjs from "dayjs";
import ZebraCarOwnerDropDown from "../../../../_common/components/ClaimAgent/CustomDropdown/ZebraCarOwnerDropDown";
import { useClaimPAForm } from "../../../hooks/CreateClaim/ClaimPA/useClaimPAForm";
import OcrDocumentScanSection from "../OcrDocumentScanSection";
import CoverageBox from "../CoverageBox";
import { DeathPlaceType, setEnabled, SymptomType } from "../../../store/claimPHSlice";
import DocumentScanTable from "../DocumentScanTable";
import HospitalDropdown from "../../../../_common/components/ClaimAgent/CustomDropdown/HospitalDropdown";
import CD10Autocomplete from "../../../../_common/components/ClaimAgent/CustomDropdown/CD10Autocomplete";
import DeathClaimAmountCardPA from "./DeathClaimAmountCardPA";
import ContinuedDeathExtraCoverageSection from "./ContinuedDeathExtraCoverageSection";
import OrganLossSelector from "../OrganLossSelector";
import { claimPASelector, DeathExtraCoverageId, setOrganLossItems } from "../../../store/claimPASlice";
import type { ClaimPAFormValues } from "../../../store/claimPASlice";
import { claimStepBoxSx } from "../ClaimPH/ClaimFormSection";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { useOrganLoss } from "../../../hooks/CreateClaim/useOrganLoss";
import {
    CauseOfIncident,
    CoverageType,
    IncidentType,
    isProductType,
    MedicalType,
    PRODUCT_TYPE_GROUP,
} from "../../../../../functionHelpers";
import { useNavigate } from "react-router-dom";
import ConfirmExcessLimitTransferDialog from "../ConfirmExcessLimitTransferDialog";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

const EMPTY_STATE_SX = {
    p: 2,
    textAlign: "center",
    borderStyle: "dashed",
    color: "text.secondary",
    fontSize: 14,
} as const;

const FIELD_ORDER = [
    "incidentTypeId",
    "coverageTypeId",
    "medicalTypeId",
    "causeOfIncidentId",
    "documentRecipientTypeId",
    "serviceProviderId",
    "zebraId",
    "incidentDate",
    "admissionDate",
    "dischargeDate",
    "deathDate",
    "notificationDate",
    "documentCompleteDate",
    "hospitalId",
    "accidentPlace",
    "symptomType",
    "chiefComplaintId",
    "remark",
    "transferAmount",
    "ocrDocumentSection",
] as const;

type FieldRefName = (typeof FIELD_ORDER)[number];

interface Props {
    onNext: () => void;
}

const ClaimPAFormSection: React.FC<Props> = ({ onNext }) => {
    const {
        formik,
        incidentType,
        coverageType,
        medicalType,
        causeOfIncident,
        customerBenefit,
        incidentTypeMappingLoading,
        incidentTypeLoading,
        customerBenefitLoading,
        isContinuous,
        isContinuousDeath,
        isOldClaimLoading,
        insured,
        shouldShowOcrDocumentScan,
        isOcrDocsValid,
        setIsOcrDocsValid,
        isOcrLoading,
        setIsOcrLoading,
        setOcrResult,
        setOcrDocumentIds,
        getRequiredDocsByCoverageType,
        resetOcr,
    } = useClaimPAForm({ onNext });

    const { values, setFieldValue } = formik;
    const isDisability = values.coverageTypeId === CoverageType.Disability;
    const { organChoices, isOrganChoicesLoading, nonCoveredReasonData, isNonCoveredReasonLoading } = useOrganLoss(
        isDisability ? CoverageType.Disability : undefined
    );
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { organLossItems, school, claimItems, editingItemId, tmpCoreClaim, oldClaim } =
        useAppSelector(claimPASelector);

    const editingTempClaimId = editingItemId ? claimItems.find((c) => c.id === editingItemId)?.tempClaimId : undefined;
    const otherInsuredCount = (tmpCoreClaim.createClaim ?? []).filter(
        (c) => c.tempClaimId !== editingTempClaimId
    ).length;
    const isAddingAdditionalInsured = otherInsuredCount > 0;

    const coverageTypeOptions = isAddingAdditionalInsured
        ? (coverageType ?? []).filter((opt) => opt.id !== CoverageType.Death && opt.id !== CoverageType.Disability)
        : coverageType;

    const isMedical =
        values.coverageTypeId === CoverageType.Medical || values.coverageTypeId === CoverageType.Compensate;
    const isDeath = values.coverageTypeId === CoverageType.Death;
    // เสียชีวิตจากการเจ็บป่วย (เหตุ = เจ็บป่วย + สาเหตุ = โรคทั่วไป) ไม่มีความคุ้มครองเพิ่มเติม (ภัยสาธารณะ/ความรับผิดสถานศึกษา)
    const isIllnessDeath =
        isDeath &&
        values.incidentTypeId === IncidentType.Illness &&
        values.causeOfIncidentId === CauseOfIncident.Illness;
    // เคลมต่อเนื่องประเภทเสียชีวิตจากอุบัติเหตุ — ล็อกวันที่เสียชีวิตให้ default ตามเคลมหลัก
    const isContinuousAccidentDeath = isContinuousDeath && values.incidentTypeId === IncidentType.Accident;
    const isIPD = values.medicalTypeId === MedicalType.IPD || values.medicalTypeId === MedicalType.DayCaseSurgery;
    const isIPDMedical = values.coverageTypeId === CoverageType.Medical && values.medicalTypeId === MedicalType.IPD;
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
    const disabilityBenefit = customerBenefit?.data?.find((item) => item.coverageTypeId === CoverageType.Disability);
    const deathBenefits = useMemo(
        () => (customerBenefit?.data ?? []).filter((b) => b.coverageTypeId === CoverageType.Death),
        [customerBenefit?.data]
    );
    // เคลมต่อเนื่อง: เทียบกับ benefit คงเหลือ (remainAmount) แทนวงเงินสูงสุด (maxPrice)
    const maxPrice = isContinuous ? currentBenefit?.remainAmount : currentBenefit?.maxPrice;
    const isOverEligibleLimit =
        !isContinuousDeath && typeof maxPrice === "number" && (values.transferAmount ?? 0) > maxPrice;

    const fieldRefs = useRef<Partial<Record<FieldRefName, HTMLElement | null>>>({});

    const registerFieldRef = (name: FieldRefName) => (el: HTMLElement | null) => {
        fieldRefs.current[name] = el;
    };

    const focusField = (name: FieldRefName) => {
        const container = fieldRefs.current[name];
        if (!container) return false;

        container.scrollIntoView({ behavior: "smooth", block: "center" });

        window.setTimeout(() => {
            const focusable = container.querySelector<HTMLElement>(
                'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), [role="radio"], [role="checkbox"], button:not([disabled]), [tabindex]'
            );
            if (focusable) {
                focusable.focus();
            } else {
                container.setAttribute("tabindex", "-1");
                container.focus();
            }
        }, 300);

        return true;
    };

    const focusFirstError = (errs: Record<string, unknown>) => {
        const firstErrorField = FIELD_ORDER.find((name) => !!errs[name]);
        if (firstErrorField) {
            focusField(firstErrorField);
            return;
        }

        if (errs.deathBenefitAmounts) focusField("transferAmount");
    };

    const handleSubmit = async () => {
        const errs = await formik.validateForm();
        if (Object.keys(errs).length > 0) {
            const touched = Object.keys(errs).reduce(
                (acc, key) => {
                    const fieldError = errs[key as keyof typeof errs];

                    if (key === "deathBenefitAmounts" && fieldError && typeof fieldError === "object") {
                        acc[key] = Object.keys(fieldError).reduce(
                            (nestedAcc, nestedKey) => ({ ...nestedAcc, [nestedKey]: true }),
                            {}
                        );
                    } else {
                        acc[key] = true;
                    }

                    return acc;
                },
                {} as Record<string, unknown>
            ) as Parameters<typeof formik.setTouched>[0];

            await formik.setTouched(touched, false);
            focusFirstError(errs as Record<string, unknown>);
            return;
        }
        if (requiresOcrValidation && !isOcrDocsValid) {
            swalWarningNotOutsideClick("แจ้งเตือน", "กรุณาแนบเอกสารให้ครบถ้วนตามที่กำหนด");
            focusField("ocrDocumentSection");
            return;
        }
        if (isOverEligibleLimit) {
            setIsConfirmExcessOpen(true);
            return;
        }
        formik.submitForm();
    };

    useEffect(() => {
        if (!isAddingAdditionalInsured) return;

        formik.resetForm();
        resetOcr();
    }, [isAddingAdditionalInsured]);

    useEffect(() => {
        if (isContinuousDeath) {
            dispatch(setEnabled(true));
        }
    }, [isContinuousDeath, dispatch]);

    // เสียชีวิตจากการเจ็บป่วย: ไม่มีความคุ้มครองเพิ่มเติม เคลียร์ค่าที่อาจเลือกค้างไว้
    useEffect(() => {
        if (isIllnessDeath && values.extraCoverageIds.length > 0) {
            setFieldValue("extraCoverageIds", [], false);
        }
    }, [isIllnessDeath]);

    const setFieldValueRef = useRef(formik.setFieldValue);
    setFieldValueRef.current = formik.setFieldValue;

    const handleAttachedDocumentsChange = useCallback((docs: ClaimPAFormValues["ocrDocument"]) => {
        setFieldValueRef.current("ocrDocument", docs, false);
    }, []);

    return (
        <>
            <Backdrop open={formik.isSubmitting} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {isContinuousDeath && (
                <Box mb={2} ref={registerFieldRef("transferAmount")}>
                    <ContinuedDeathExtraCoverageSection
                        oldClaim={oldClaim}
                        benefits={deathBenefits}
                        isLoading={customerBenefitLoading}
                        formik={formik}
                    />
                </Box>
            )}

            <CustomPaper>
                <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="บันทึกข้อมูลเคลม" color="blue" />
                <Box component="form" onSubmit={formik.handleSubmit} p={2}>
                    <Grid container spacing={2}>
                        {!isContinuousDeath && (
                            <>
                                {/* เหตุของการเคลม */}
                                <Grid item xs={12} ref={registerFieldRef("incidentTypeId")}>
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
                                <Grid item xs={12} ref={registerFieldRef("coverageTypeId")}>
                                    <Typography fontWeight={600} fontSize={16} mb={2}>
                                        ประเภทความคุ้มครอง{" "}
                                        <Typography component="span" color="error">
                                            *
                                        </Typography>
                                    </Typography>
                                    {values.incidentTypeId ? (
                                        <ClaimTypeSelector
                                            formik={formik}
                                            options={coverageTypeOptions}
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
                                <Grid
                                    item
                                    xs={12}
                                    ref={(el: HTMLDivElement | null) => {
                                        fieldRefs.current.medicalTypeId = el;
                                        fieldRefs.current.causeOfIncidentId = el;
                                    }}
                                >
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
                            </>
                        )}

                        {isDeath && !isContinuousDeath && !isIllnessDeath && values.causeOfIncidentId && (
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        border: "1px solid #cfe3f7",
                                        borderRadius: 2,
                                        bgcolor: "#f3f8fd",
                                        p: 2,
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <VerifiedUserIcon color="primary" fontSize="small" />
                                        <Typography fontWeight={700} fontSize={15}>
                                            ความคุ้มครองเพิ่มเติม
                                        </Typography>
                                    </Box>
                                    <Box display="flex" gap={3} flexWrap="wrap">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={values.extraCoverageIds.includes(
                                                        DeathExtraCoverageId.PublicDisaster
                                                    )}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFieldValue(
                                                            "extraCoverageIds",
                                                            checked
                                                                ? [
                                                                      ...values.extraCoverageIds,
                                                                      DeathExtraCoverageId.PublicDisaster,
                                                                  ]
                                                                : values.extraCoverageIds.filter(
                                                                      (id) => id !== DeathExtraCoverageId.PublicDisaster
                                                                  )
                                                        );
                                                    }}
                                                />
                                            }
                                            label="ภัยสาธารณะ"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={values.extraCoverageIds.includes(
                                                        DeathExtraCoverageId.SchoolLiability
                                                    )}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFieldValue(
                                                            "extraCoverageIds",
                                                            checked
                                                                ? [
                                                                      ...values.extraCoverageIds,
                                                                      DeathExtraCoverageId.SchoolLiability,
                                                                  ]
                                                                : values.extraCoverageIds.filter(
                                                                      (id) =>
                                                                          id !== DeathExtraCoverageId.SchoolLiability
                                                                  )
                                                        );
                                                    }}
                                                />
                                            }
                                            label="ความรับผิดสถานศึกษา"
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        )}

                        {/* ผู้รับเอกสาร / ผู้ให้บริการ / เจ้าของรถ */}
                        <Grid item xs={12} md={4} ref={registerFieldRef("documentRecipientTypeId")}>
                            <DocumentRecipientTypeDropDown
                                firstItemText="-- เลือก --"
                                formik={formik}
                                name="documentRecipientTypeId"
                                fullWidth
                                required
                                selectedCallback={(item) => {
                                    formik.setFieldValue("documentRecipientTypeName", item?.documentRecipientTypeName);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4} mt={-1} ref={registerFieldRef("serviceProviderId")}>
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
                        </Grid>
                        <Grid item xs={12} md={4} ref={registerFieldRef("zebraId")}>
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
                        </Grid>

                        {/* วันที่ต่างๆ */}
                        <Grid item xs={12} sm={6} md={4} ref={registerFieldRef("incidentDate")}>
                            <FormikDatePicker
                                name="incidentDate"
                                label="วันที่เกิดเหตุ"
                                formik={formik}
                                slotProps={{ textField: { size: "small" } }}
                                maxDate={dayjs()}
                                required
                                disabled={isContinuous}
                            />
                        </Grid>
                        {isMedical && (
                            <Grid item xs={12} sm={6} md={4} ref={registerFieldRef("admissionDate")}>
                                <FormikDatePicker
                                    name="admissionDate"
                                    label="วันที่เข้า รพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs()}
                                    required
                                />
                            </Grid>
                        )}
                        {isIPD && (
                            <Grid item xs={12} sm={6} md={4} ref={registerFieldRef("dischargeDate")}>
                                <FormikDatePicker
                                    name="dischargeDate"
                                    label="วันที่ออก รพ."
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs()}
                                    required
                                />
                            </Grid>
                        )}
                        {(isDeath || isContinuousDeath) && (
                            <Grid item xs={12} sm={6} md={4} ref={registerFieldRef("deathDate")}>
                                <FormikDatePicker
                                    name="deathDate"
                                    label="วันที่เสียชีวิต"
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs()}
                                    required
                                    disabled={isContinuousAccidentDeath}
                                />
                            </Grid>
                        )}
                        {(isDeath || isDisability || isContinuousDeath) && (
                            <>
                                <Grid item xs={12} sm={6} md={4} ref={registerFieldRef("notificationDate")}>
                                    <FormikDatePicker
                                        name="notificationDate"
                                        label="วันที่รับแจ้ง"
                                        formik={formik}
                                        slotProps={{ textField: { size: "small" } }}
                                        maxDate={dayjs()}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} ref={registerFieldRef("documentCompleteDate")}>
                                    <FormikDatePicker
                                        name="documentCompleteDate"
                                        label="วันที่เอกสารครบ"
                                        formik={formik}
                                        slotProps={{ textField: { size: "small" } }}
                                        maxDate={dayjs()}
                                        required
                                    />
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
                                            <Grid item xs={12} lg={9} mt={-1} ref={registerFieldRef("hospitalId")}>
                                                <HospitalDropdown formik={formik} name="hospitalId" required />
                                            </Grid>
                                        )}
                                        {values.deathPlaceType === DeathPlaceType.Other && (
                                            <Grid item xs={12} lg={9} ref={registerFieldRef("accidentPlace")}>
                                                <FormikTextField
                                                    name="accidentPlace"
                                                    label="สถานที่เสียชีวิต"
                                                    formik={formik}
                                                    size="small"
                                                    fullWidth
                                                    required
                                                    placeholder="ระบุสถานที่เสียชีวิต"
                                                />
                                            </Grid>
                                        )}
                                    </>
                                )}
                                {isDisability && (
                                    <Grid item xs={12} lg={9} mt={-1} ref={registerFieldRef("hospitalId")}>
                                        <HospitalDropdown formik={formik} name="hospitalId" required />
                                    </Grid>
                                )}
                            </>
                        )}
                        {/* ระบุอาการ */}
                        {!isDeath && !isDisability && (
                            <Grid item xs={12} ref={registerFieldRef("symptomType")}>
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
                            <Grid item xs={12} lg={9} ref={registerFieldRef("chiefComplaintId")}>
                                <ChiefComplaintAutocomplete
                                    name="chiefComplaintId"
                                    formik={formik}
                                    size="small"
                                    required
                                />
                            </Grid>
                        )}
                        {(isDeath || isDisability || isContinuousDeath) && (
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
                            <Grid item xs={12} lg={9} ref={registerFieldRef("remark")}>
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
                            </Grid>
                        )}
                    </Grid>
                    {isDisability && (
                        <Box sx={claimStepBoxSx} mt={2} ref={registerFieldRef("transferAmount")}>
                            <OrganLossSelector
                                value={organLossItems}
                                organChoices={organChoices}
                                isOrganChoicesLoading={isOrganChoicesLoading}
                                nonCoveredReason={nonCoveredReasonData?.data ?? []}
                                isNonCoveredReasonLoading={isNonCoveredReasonLoading}
                                onChange={(items) => dispatch(setOrganLossItems(items))}
                                customerId={insured?.customerId}
                                maxTransferAmount={
                                    isContinuous ? disabilityBenefit?.remainAmount : disabilityBenefit?.maxPrice
                                }
                            />
                        </Box>
                    )}
                    {/* Coverage box */}
                    {(isOPD || isIPD || isDisability) && (
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
                    {isIPDMedical && (
                        <Grid item xs={12} mt={2}>
                            <Grid container justifyContent="center">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    startIcon={<CalculateIcon />}
                                    sx={{ mb: 1 }}
                                    onClick={() => navigate("/claim-simulation")}
                                >
                                    เปิดโปรแกรมคำนวณวงเงินเคลม
                                </Button>
                            </Grid>
                        </Grid>
                    )}

                    {/* จำนวนเงิน */}
                    {!isDisability && !isDeath && !isContinuousDeath && (
                        <Grid item xs={12} ref={registerFieldRef("transferAmount")}>
                            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                <Grid item xs={12} sm={5.9} md={2.9} mt={1}>
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
                    {isDeath && !isContinuousDeath && formik.values.causeOfIncidentId && (
                        <Box ref={registerFieldRef("transferAmount")}>
                            <DeathClaimAmountCardPA
                                benefits={deathBenefits}
                                isLoading={customerBenefitLoading}
                                extraCoverageIds={formik.values.extraCoverageIds}
                                formik={formik}
                            />
                        </Box>
                    )}
                </Box>
            </CustomPaper>

            {/* แนบเอกสาร */}
            {showOcr && (
                <Box ref={registerFieldRef("ocrDocumentSection")}>
                    <CustomPaper>
                        <HeadingWithColor
                            icon={<UploadFileSharpIcon sx={{ fontSize: 27 }} />}
                            text="สแกนเอกสาร OCR (PA)"
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
                </Box>
            )}
            {(isDeath || isDisability || isContinuousDeath) && (
                <DocumentScanTable
                    aplicationCode={insured?.policyCode}
                    productTypeId={26}
                    Header="สแกนเอกสาร"
                    documentType="เอกสารประกอบการพิจารณาเคลม"
                    onAttachedDocumentsChange={handleAttachedDocumentsChange}
                />
            )}

            <ConfirmExcessLimitTransferDialog
                open={isConfirmExcessOpen}
                onClose={() => setIsConfirmExcessOpen(false)}
                loading={formik.isSubmitting}
                customerName={insured?.customerName as string}
                productLabel="PA"
                idCardNo={insured?.cardDetail as string}
                appId={insured?.policyCode}
                extraChips={
                    school?.schoolName ? [{ icon: <SchoolIcon fontSize="small" />, label: school.schoolName }] : []
                }
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
                    variant="contained"
                    color="primary"
                    size="medium"
                    disabled={
                        formik.isSubmitting ||
                        customerBenefitLoading ||
                        (requiresOcrValidation && (!isOcrDocsValid || isOcrLoading))
                    }
                    onClick={handleSubmit}
                >
                    ถัดไป
                </Button>
            </Box>
        </>
    );
};

export default ClaimPAFormSection;
