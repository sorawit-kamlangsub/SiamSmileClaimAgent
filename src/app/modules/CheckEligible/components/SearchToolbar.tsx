import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PolicyIcon from "@mui/icons-material/Policy";
import AddCommentIcon from "@mui/icons-material/AddComment";
import HealingIcon from "@mui/icons-material/Healing";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccessibleIcon from "@mui/icons-material/Accessible";
import LinkIcon from "@mui/icons-material/Link";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import useCheckEligibleToolbar from "../hooks/useCheckEligibleToolbar";
import { useClaimTypeCascadeFields } from "../hooks/useClaimTypeCascadeFields";
import { FormikCheckbox } from "../../_common";
import FormikDatePicker from "../../_common/components/CustomFormik/FormikDatePicker";
import CustomPaper from "../../_common/components/CustomComponent/CustomPaper";
import ContinuousClaimDialog from "./ContinuousClaimDialog";
import { setContinuousClaimState } from "../store/checkeligibleSlice";
import { isProductType, PRODUCT_TYPE_GROUP } from "../../../functionHelpers";
import PersonalExclusionCard from "./PersonalExclusionCard";
import PolicyConditionCard from "./PolicyConditionCard";
import { PersonalExclusionNote } from "../hooks/useCheckEligibleDetail";
import PolicyConditionExclusionModal from "./PolicyConditionExclusionModal";
import { Dayjs } from "dayjs";
import WaitingPeriodStatusBanner from "./WaitingPeriodStatusBanner";

const mockNotes: PersonalExclusionNote[] = [{ id: 1, message: "ติดเงื่อนไข โรคกระเพาะอาหาร" }];

type Props = {
    productTypeId?: number;
    productCategoryCode?: string;
    applicationId?: string;
    customerId?: number;
    coverageFrom?: Dayjs;
    coverageTo?: Dayjs;
};

const CLAIM_CAUSE_ICON_MAP: Record<number, React.ReactNode> = {
    2: <HealingIcon fontSize="small" />,
    3: <DirectionsRunIcon fontSize="small" />,
};

const COVERAGE_TYPE_ICON_MAP: Record<number, React.ReactNode> = {
    2: <LocalHospitalIcon fontSize="small" />,
    3: <PaymentsIcon fontSize="small" />,
    4: <AccessibleIcon fontSize="small" />,
    5: <LocalFloristIcon fontSize="small" />,
};

const getClaimRoutePrefix = (productTypeId?: number): "ph" | "pa" | undefined => {
    if (isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH)) return "ph";
    if (isProductType(productTypeId, PRODUCT_TYPE_GROUP.PA)) return "pa";
    return undefined;
};

const CHIP_SELECTED_BG = "#eaf5ff";

const StepBadge: React.FC<{ n: number }> = ({ n }) => (
    <Box
        sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
        }}
    >
        {n}
    </Box>
);

type ChipOptionProps = {
    label: string;
    icon?: React.ReactNode;
    isSelected: boolean;
    isLocked?: boolean;
    onSelect: () => void;
};

const ChipOption: React.FC<ChipOptionProps> = ({ label, icon, isSelected, isLocked, onSelect }) => (
    <Box
        onClick={() => !isLocked && onSelect()}
        role="button"
        tabIndex={isLocked ? -1 : 0}
        sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            cursor: isLocked ? "default" : "pointer",
            userSelect: "none",
            border: "1px solid",
            borderColor: isSelected ? "primary.main" : "divider",
            borderRadius: "10px",
            px: 2,
            py: 0.75,
            bgcolor: isSelected ? CHIP_SELECTED_BG : "background.paper",
            opacity: isLocked ? 0.85 : 1,
            transition: "all .15s ease",
            "&:hover": isLocked ? undefined : { borderColor: "primary.main", bgcolor: CHIP_SELECTED_BG },
        }}
    >
        {icon && (
            <Box
                display="flex"
                alignItems="center"
                sx={{ "& svg": { fontSize: 18, color: isSelected ? "primary.main" : "text.secondary" } }}
            >
                {icon}
            </Box>
        )}
        <Typography
            variant="body2"
            fontWeight={isSelected ? 700 : 600}
            color={isSelected ? "primary.main" : "text.secondary"}
        >
            {label}
        </Typography>
    </Box>
);

const stepBoxSx = {
    p: 2,
    mb: 2,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const SearchToolbar: React.FC<Props> = ({
    productTypeId,
    productCategoryCode,
    applicationId,
    customerId,
    coverageFrom,
    coverageTo,
}) => {
    const dispatch = useDispatch();
    const { formik } = useCheckEligibleToolbar();
    const {
        claimCauseOptions,
        coverageTypeOptions,
        medicalTypeOptions,
        causeOfIncidentOptions,
        isMedicalTypeVisible,
        isCauseOfIncidentVisible,
        isMedicalTypeLocked,
        isCauseOfIncidentLocked,
        noClaimCauseMessage,
        noCoverageTypeMessage,
        handleSelectClaimCause,
        handleSelectCoverageType,
        handleSelectMedicalType,
        handleSelectCauseOfIncident,
    } = useClaimTypeCascadeFields(formik, productTypeId, productCategoryCode);

    const showErrors = formik.submitCount > 0;
    const [continuousDialogOpen, setContinuousDialogOpen] = useState(false);
    const [exclusionOpen, setExclusionOpen] = useState(false);
    useEffect(() => {
        if (formik.values.isContinuous) {
            if (!formik.values.continuousClaim) {
                setContinuousDialogOpen(true);
            }
        } else {
            if (formik.values.continuousClaim) {
                formik.setFieldValue("continuousClaim", undefined);
            }
            dispatch(setContinuousClaimState({ isContinuous: false, continuousClaim: undefined }));
        }
    }, [formik.values.isContinuous]);

    const handleCloseContinuousDialog = () => {
        setContinuousDialogOpen(false);
        if (!formik.values.continuousClaim) {
            formik.setFieldValue("isContinuous", false);
        }
    };

    const handleSubmitOnEnter = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            event.preventDefault();
            formik.submitForm();
        }
    };

    const claimRoutePrefix = getClaimRoutePrefix(productTypeId);
    const canOpenClaim = !!formik.values.claimCause && !!claimRoutePrefix && !!applicationId && !!customerId;

    const handleOpenClaim = () => {
        if (!claimRoutePrefix || !applicationId || !customerId) return;
        window.open(`/claim/${claimRoutePrefix}/${btoa(applicationId)}/${btoa(customerId.toString())}`, "_blank");
    };

    const handleOpenExclusion = () => {
        setExclusionOpen(true);
    };

    const exclusionProductTypeLabel = isProductType(productTypeId, PRODUCT_TYPE_GROUP.PA) ? "PA" : "PH";

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box onKeyDown={handleSubmitOnEnter}>
                <CustomPaper>
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={3} lg={3.5}>
                            <FormikDatePicker formik={formik} name="incidentDate" label="วันที่เกิดเหตุ" fullWidth />
                        </Grid>

                        <Grid item xs={12} sm={3} lg={3.5}>
                            <Box display="flex" flexDirection="column" gap={0.5}>
                                <FormikCheckbox formik={formik} name="isContinuous" label="เป็นเคลมต่อเนื่อง" />
                                {formik.values.isContinuous && formik.values.continuousClaim && (
                                    <Box display="flex" alignItems="center" gap={0.5} pl={4}>
                                        <LinkIcon sx={{ fontSize: 14, color: "primary.main" }} />
                                        <Typography variant="caption" color="primary.main" fontWeight={700}>
                                            {formik.values.continuousClaim.claimNo}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="primary.main"
                                            sx={{ textDecoration: "underline", cursor: "pointer" }}
                                            onClick={() => setContinuousDialogOpen(true)}
                                        >
                                            เปลี่ยน
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={3} lg={2}>
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
                        <Grid item xs={12} sm={3} lg={2}>
                            <Button
                                variant="contained"
                                startIcon={<AddCommentIcon />}
                                onClick={handleOpenClaim}
                                disabled={!canOpenClaim}
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

                    <Grid container spacing={2}>
                        {productTypeId === 6 && (
                            <Grid item xs={12} sm={6}>
                                <PersonalExclusionCard notes={mockNotes} />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                            <PolicyConditionCard onOpenExclusion={handleOpenExclusion} />
                        </Grid>
                    </Grid>
                    {productTypeId === 6 && (
                        <WaitingPeriodStatusBanner
                            incidentDate={formik.values.incidentDate}
                            coverageFrom={coverageFrom}
                            coverageTo={coverageTo}
                        />
                    )}
                    {/* 1) เหตุของการเคลม */}
                    <Box sx={stepBoxSx}>
                        <Box display="flex" alignItems="center" gap={1} mb={1.25}>
                            <StepBadge n={1} />
                            <Typography variant="body2" fontWeight={700}>
                                เหตุของการเคลม{" "}
                                <Box component="span" color="error.main">
                                    *
                                </Box>
                            </Typography>
                        </Box>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            {claimCauseOptions.map((opt) => (
                                <ChipOption
                                    key={opt.value}
                                    label={opt.label}
                                    icon={CLAIM_CAUSE_ICON_MAP[opt.value]}
                                    isSelected={formik.values.claimCause === opt.value}
                                    onSelect={() => handleSelectClaimCause(opt.value)}
                                />
                            ))}
                        </Box>
                        {showErrors && !formik.values.claimCause && (
                            <Typography variant="caption" color="error.main" sx={{ mt: 1, display: "block" }}>
                                กรุณาเลือกเหตุของการเคลม
                            </Typography>
                        )}
                    </Box>

                    {/* 2) ประเภทความคุ้มครอง */}
                    <Box sx={stepBoxSx}>
                        <Box display="flex" alignItems="center" gap={1} mb={1.25}>
                            <StepBadge n={2} />
                            <Typography variant="body2" fontWeight={700}>
                                ประเภทความคุ้มครอง{" "}
                                <Box component="span" color="error.main">
                                    *
                                </Box>
                            </Typography>
                        </Box>
                        {!formik.values.claimCause ? (
                            <Typography variant="body2" color="text.secondary">
                                {noClaimCauseMessage}
                            </Typography>
                        ) : (
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {coverageTypeOptions.map((opt) => (
                                    <ChipOption
                                        key={opt.value}
                                        label={opt.label}
                                        icon={COVERAGE_TYPE_ICON_MAP[opt.value]}
                                        isSelected={formik.values.coverageType === opt.value}
                                        onSelect={() => handleSelectCoverageType(opt.value)}
                                    />
                                ))}
                            </Box>
                        )}
                        {showErrors && !!formik.values.claimCause && !formik.values.coverageType && (
                            <Typography variant="caption" color="error.main" sx={{ mt: 1, display: "block" }}>
                                กรุณาเลือกประเภทความคุ้มครอง
                            </Typography>
                        )}
                    </Box>

                    {/* 3) ประเภทการรักษา (หรือสาเหตุของการเกิดเหตุ) */}
                    <Box sx={{ ...stepBoxSx, mb: 0 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1.25}>
                            <StepBadge n={3} />
                            <Typography variant="body2" fontWeight={700}>
                                {isCauseOfIncidentVisible ? "สาเหตุของการเกิดเหตุ" : "ประเภทการรักษา"}{" "}
                                <Box component="span" color="error.main">
                                    *
                                </Box>
                            </Typography>
                        </Box>
                        {!formik.values.coverageType ? (
                            <Typography variant="body2" color="text.secondary">
                                {noCoverageTypeMessage}
                            </Typography>
                        ) : isMedicalTypeVisible ? (
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {medicalTypeOptions.map((opt) => (
                                    <ChipOption
                                        key={opt.value}
                                        label={opt.label}
                                        isSelected={formik.values.medicalType === opt.value}
                                        isLocked={isMedicalTypeLocked}
                                        onSelect={() => handleSelectMedicalType(opt.value)}
                                    />
                                ))}
                            </Box>
                        ) : isCauseOfIncidentVisible ? (
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {causeOfIncidentOptions.map((opt) => (
                                    <ChipOption
                                        key={opt.value}
                                        label={opt.label}
                                        isSelected={formik.values.causeOfIncident === opt.value}
                                        isLocked={isCauseOfIncidentLocked}
                                        onSelect={() => handleSelectCauseOfIncident(opt.value)}
                                    />
                                ))}
                            </Box>
                        ) : null}
                        {showErrors &&
                            !!formik.values.coverageType &&
                            isMedicalTypeVisible &&
                            !formik.values.medicalType && (
                                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: "block" }}>
                                    กรุณาเลือกประเภทการรักษา
                                </Typography>
                            )}
                        {showErrors &&
                            !!formik.values.coverageType &&
                            isCauseOfIncidentVisible &&
                            !formik.values.causeOfIncident && (
                                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: "block" }}>
                                    กรุณาเลือกสาเหตุของการเกิดเหตุ
                                </Typography>
                            )}
                    </Box>
                </CustomPaper>
            </Box>

            <ContinuousClaimDialog
                open={continuousDialogOpen}
                applicationId={applicationId}
                onClose={handleCloseContinuousDialog}
                onConfirm={(claim) => {
                    formik.setFieldValue("continuousClaim", claim);
                    dispatch(setContinuousClaimState({ isContinuous: true, continuousClaim: claim }));
                    setContinuousDialogOpen(false);
                }}
            />
            <PolicyConditionExclusionModal
                open={exclusionOpen}
                onClose={() => setExclusionOpen(false)}
                productTypeLabel={exclusionProductTypeLabel}
            />
        </LocalizationProvider>
    );
};

export default SearchToolbar;
