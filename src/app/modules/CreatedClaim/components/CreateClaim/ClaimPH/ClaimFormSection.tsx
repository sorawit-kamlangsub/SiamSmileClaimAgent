import React, { useState } from "react";
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
import CoverageBox from "./CoverageBox";
import OcrDocumentScanSection from "../OcrDocumentScanSection";
import { IPD_COVERAGE_ITEMS, OPD_COVERAGE_ITEMS } from "../../../store/mockClaimPH";
import DocumentRecipientTypeDropDown from "../../../../_common/components/ClaimAgent/CustomDropdown/DocumentRecipientTypeDropDown";
import UserAutocompleteApi from "../../../../_common/components/ClaimAgent/CustomDropdown/UserAutocompleteApi";
import ChiefComplaintAutocomplete from "../../../../_common/components/ClaimAgent/CustomDropdown/ChiefComplaintAutocomplete";
import ClaimTypeSelector from "../ClaimTypeSelector";
import ChipSelector from "../ChipSelector";
import dayjs from "dayjs";
import ZebraCarOwnerDropDown from "../../../../_common/components/ClaimAgent/CustomDropdown/ZebraCarOwnerDropDown";
import { SymptomType } from "../../../store/claimPHSlice";

const EMPTY_STATE_SX = {
    p: 2,
    textAlign: "center",
    borderStyle: "dashed",
    color: "text.secondary",
    fontSize: 14,
} as const;

interface Props {
    onNext: () => void;
}

const ClaimFormSection: React.FC<Props> = ({ onNext }) => {
    const {
        formik,
        incidentType,
        coverageType,
        medicalType,
        causeOfAccident,
        incidentTypeLoading,
        coverageTypeLoading,
        medicalTypeLoading,
        causeOfAccidentLoading,
        insured,
        shouldShowOcrDocumentScan,
        isOcrDocsValid,
        setIsOcrDocsValid,
        isOcrLoading,
        setIsOcrLoading,
        setOcrResult,
        setOcrDocumentIds,
        getRequiredDocsByCoverageType,
    } = useClaimPHForm({ onNext });
    const { values, setFieldValue } = formik;
    const isMedical = values.coverageTypeId === 2 || values.coverageTypeId === 3;
    const isDisability = values.coverageTypeId === 4;
    const isDeath = values.coverageTypeId === 5;

    const isIPD = values.medicalTypeId === 2 || values.medicalTypeId === 6;
    const isOPD = values.medicalTypeId === 1;
    const showOcr = !!values.incidentTypeId && isMedical;

    const medicalTypeLabel = isDeath
        ? "สาเหตุการเสียชีวิต"
        : isMedical
        ? "ประเภทการรักษา"
        : isDisability
        ? "สาเหตุการทุพพลภาพ/สูญเสียอวัยวะ"
        : "ตัวเลือกเพิ่มเติม";

    const handleSubmit = async () => {
        const errs = await formik.validateForm();
        if (Object.keys(errs).length > 0) {
            await formik.setTouched(Object.keys(errs).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
            return;
        }
        if (!isDeath && !isDisability && shouldShowOcrDocumentScan(formik.values.coverageTypeId) && !isOcrDocsValid) {
            swalWarningNotOutsideClick("แจ้งเตือน", "กรุณาแนบเอกสารให้ครบถ้วนตามที่กำหนด");
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
                <Box component="form" onSubmit={formik.handleSubmit} p={2}>
                    <CustomPaper>
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
                                        isLoading={coverageTypeLoading}
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
                                        isLoading={medicalTypeLoading}
                                    />
                                ) : isDeath || isDisability ? (
                                    <ChipSelector
                                        formik={formik}
                                        idFieldName="causeOfIncidentId"
                                        nameFieldName="causeOfIncidentName"
                                        options={causeOfAccident}
                                        isLoading={causeOfAccidentLoading}
                                    />
                                ) : (
                                    <Paper variant="outlined" sx={EMPTY_STATE_SX}>
                                        กรุณาเลือกประเภทความคุ้มครองก่อน
                                    </Paper>
                                )}
                            </Grid>

                            {/* ผู้รับเอกสาร / ผู้ให้บริการ / เจ้าของรถ */}
                            <Grid item xs={12} md={4}>
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
                            </Grid>
                            <Grid item xs={12} md={4} mt={-1}>
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
                            <Grid item xs={12} md={4}>
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
                            <Grid item xs={12} sm={6} md={4}>
                                <FormikDatePicker
                                    name="incidentDate"
                                    label="วันที่เกิดเหตุ"
                                    formik={formik}
                                    slotProps={{ textField: { size: "small" } }}
                                    maxDate={dayjs()}
                                    required
                                />
                            </Grid>
                            {isMedical && (
                                <Grid item xs={12} sm={6} md={4}>
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
                                <Grid item xs={12} sm={6} md={4}>
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
                            {isDeath && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormikDatePicker
                                        name="deathDate"
                                        label="วันที่เสียชีวิต"
                                        formik={formik}
                                        slotProps={{ textField: { size: "small" } }}
                                        maxDate={dayjs()}
                                        required
                                    />
                                </Grid>
                            )}
                            {(isDeath || isDisability) && (
                                <>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <FormikDatePicker
                                            name="notificationDate"
                                            label="วันที่รับแจ้ง"
                                            formik={formik}
                                            slotProps={{ textField: { size: "small" } }}
                                            maxDate={dayjs()}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <FormikDatePicker
                                            name="documentCompleteDate"
                                            label="วันที่เอกสารครบ"
                                            formik={formik}
                                            slotProps={{ textField: { size: "small" } }}
                                            maxDate={dayjs()}
                                            required
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Coverage box */}
                            {(isOPD || isIPD) && (
                                <Grid item xs={12}>
                                    <CoverageBox
                                        items={isOPD ? OPD_COVERAGE_ITEMS : IPD_COVERAGE_ITEMS}
                                        planCode="662"
                                    />
                                </Grid>
                            )}

                            {/* ปุ่มคำนวณวงเงิน */}
                            {isIPD && (
                                <Grid item xs={12} md={6} lg={4}>
                                    <Grid container justifyContent="center">
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            startIcon={<CalculateIcon />}
                                            sx={{ width: { xs: "100%", sm: "30%", md: "50%" }, mb: 1 }}
                                        >
                                            เปิดโปรแกรมคำนวณวงเงิน
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}

                            {/* จำนวนเงิน */}
                            <Grid item xs={12}>
                                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                    <Grid item xs={12} sm={5.9} md={2.9}>
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

                            {/* ระบุอาการ */}
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
                            {values.symptomType === SymptomType.ChiefComplaint && (
                                <Grid item xs={12} lg={9}>
                                    <ChiefComplaintAutocomplete
                                        name="chiefComplaintId"
                                        formik={formik}
                                        size="small"
                                        required
                                    />
                                </Grid>
                            )}
                            {values.symptomType === SymptomType.Other && (
                                <Grid item xs={12} lg={9}>
                                    <FormikTextField
                                        name="chiefComplaintOther"
                                        label="หมายเหตุ"
                                        formik={formik}
                                        size="small"
                                        multiline
                                        rows={2}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </CustomPaper>
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

            <Box display="flex" justifyContent="flex-end" mb={5}>
                <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    disabled={formik.isSubmitting || (isMedical && (!isOcrDocsValid || isOcrLoading))}
                    onClick={handleSubmit}
                >
                    ถัดไป
                </Button>
            </Box>
        </>
    );
};

export default ClaimFormSection;
