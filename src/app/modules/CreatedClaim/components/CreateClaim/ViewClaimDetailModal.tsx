import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Paper,
    Divider,
    LinearProgress,
    Chip,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import { GetCaseByClaimIdDtoResponse } from "../../../../api/coreClaimApi.client";
import { formatDateString } from "../../../../functionHelpers";
import { fmt } from "./ClaimHistoryCard";

interface Props {
    open: boolean;
    onClose: () => void;
    caseData?: GetCaseByClaimIdDtoResponse[];
    isLoading?: boolean;
}

const isTransferSuccess = (item: GetCaseByClaimIdDtoResponse) => item.paymentStatusId === 3;

// ช่วยลด repeat: label เทาอ่อน + value เข้ม
const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <Box minWidth={0}>
        <Typography fontSize={11} color="text.secondary" mb={0.4} noWrap>
            {label}
        </Typography>
        <Typography fontSize={13} fontWeight={600} sx={{ wordBreak: "break-word" }}>
            {value ?? "-"}
        </Typography>
    </Box>
);

const MEDICAL_TYPE_LABEL_BY_CONDITION: Record<string, string> = {
    death: "สาเหตุการเสียชีวิต",
    medical: "ประเภทการรักษา",
    disability: "สาเหตุการทุพพลภาพ/สูญเสียอวัยวะ",
};

const getMedicalTypeLabel = (item: GetCaseByClaimIdDtoResponse) => {
    const isDeath = item?.coverageTypeId === 5;
    const isDisability = item?.coverageTypeId === 4;

    return isDeath
        ? MEDICAL_TYPE_LABEL_BY_CONDITION.death
        : isDisability
        ? MEDICAL_TYPE_LABEL_BY_CONDITION.disability
        : MEDICAL_TYPE_LABEL_BY_CONDITION.medical;
};

const ViewClaimDetailModal: React.FC<Props> = ({ open, onClose, caseData, isLoading }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: { xs: 0, sm: 3 },
                    m: { xs: 0, sm: 3 },
                    height: { xs: "100%", sm: "auto" },
                    maxHeight: { xs: "100%", sm: "90vh" },
                },
            }}
            fullScreen={fullScreen}
        >
            <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                    display="flex"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={1.5}
                >
                    <Typography fontWeight={600} fontSize={{ xs: 16, sm: 18 }}>
                        รายละเอียด ClaimCase
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Chip
                            label={`${caseData?.[0]?.totalCount ?? "-"} ClaimCase`}
                            size="small"
                            sx={{ bgcolor: "#d9ecfb", color: "primary.dark", fontWeight: 600 }}
                        />
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                bgcolor: "error.main",
                                color: "common.white",
                                width: 32,
                                height: 32,
                                "&:hover": { bgcolor: "error.dark" },
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>
                </Box>
                <Divider sx={{ mt: 1.5 }} />
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 1.5, sm: 3 } }}>
                {isLoading ? (
                    <LinearProgress sx={{ height: 5 }} />
                ) : (
                    caseData?.map((item, index) => {
                        const transferred = isTransferSuccess(item);
                        const medicalTypeLabel = getMedicalTypeLabel(item);
                        return (
                            <Paper key={index} variant="outlined" sx={{ borderRadius: 3, mb: 2, overflow: "hidden" }}>
                                {/* Header แถบสีอ่อน */}
                                <Box
                                    sx={{
                                        bgcolor: "#f8f9fa",
                                        px: { xs: 2, sm: 2.5 },
                                        py: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1.5,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
                                        <DescriptionIcon sx={{ color: "primary.main", fontSize: 20 }} />
                                        <Box minWidth={0}>
                                            <Typography fontSize={11} color="text.secondary" noWrap>
                                                ClaimCaseNo
                                            </Typography>
                                            <Typography fontSize={14} fontWeight={600} color="primary.main" noWrap>
                                                {item?.caseNo}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Chip
                                        size="small"
                                        icon={
                                            transferred ? (
                                                <CheckCircleIcon sx={{ fontSize: 14, color: "#2e7d32 !important" }} />
                                            ) : (
                                                <AccessTimeIcon sx={{ fontSize: 14, color: "#ed6c02 !important" }} />
                                            )
                                        }
                                        label={item?.paymentStatusName ?? "รอพิจารณา"}
                                        sx={{
                                            bgcolor: transferred ? "#e6f4ea" : "#fdf1e6",
                                            color: transferred ? "#2e7d32" : "#ed6c02",
                                            fontWeight: 600,
                                            borderRadius: "999px",
                                        }}
                                    />
                                </Box>

                                {/* เนื้อหา */}
                                <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
                                    {/* แถวข้อมูลหลัก: วันที่ / เหตุ / ความคุ้มครอง / ประเภทรักษา */}
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "repeat(2, 1fr)",
                                                sm: "repeat(4, 1fr)",
                                            },
                                            gap: 2,
                                            mb: 2,
                                        }}
                                    >
                                        <Field
                                            label="วันที่เข้ารักษา"
                                            value={
                                                item?.occurrenceDate
                                                    ? formatDateString(item.occurrenceDate.toString(), "DD/MM/BBBB")
                                                    : "-"
                                            }
                                        />
                                        <Field label="เหตุของการเคลม" value={item?.incidentTypeName} />
                                        <Field label="ประเภทความคุ้มครอง" value={item?.coverageTypeName} />
                                        <Field label={medicalTypeLabel} value={item?.medicalTypeCode} />
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    {/* แถวล่าง: อาการ+หมายเหตุ / ยอดเบิก-ยอดจ่าย */}
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
                                            gap: 2,
                                            alignItems: "end",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                                gap: 2,
                                            }}
                                        >
                                            <Field label="อาการสำคัญ" value={item?.caseChiefComlaint} />
                                            <Field label="หมายเหตุ" value={item?.chiefComplaintCustom} />
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: 1,
                                                width: { xs: "100%", md: 260 },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    bgcolor: "#e6f1fb",
                                                    borderRadius: 2,
                                                    px: 2,
                                                    py: 1,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <Typography fontSize={11} color="#185fa5">
                                                    ยอดเบิก
                                                </Typography>
                                                <Typography fontSize={15} fontWeight={600} color="#185fa5">
                                                    {fmt(item?.totalCaseAmount ?? 0)}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    bgcolor: "#eaf3de",
                                                    borderRadius: 2,
                                                    px: 2,
                                                    py: 1,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <Typography fontSize={11} color="#3b6d11">
                                                    ยอดจ่าย
                                                </Typography>
                                                <Typography fontSize={15} fontWeight={600} color="#3b6d11">
                                                    {fmt(item?.casePaidAmount ?? 0)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        );
                    })
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ViewClaimDetailModal;
