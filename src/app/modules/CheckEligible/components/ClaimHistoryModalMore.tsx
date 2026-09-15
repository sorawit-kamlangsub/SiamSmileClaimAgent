import React from "react";
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Divider,
    Avatar,
    useMediaQuery,
    useTheme,
    CircularProgress,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { GetClaimHistoryDtoResponse } from "../../../api/coreClaimApi.client";
import { PaginationResultDto, PaginationSortableDto } from "../../_common";
import { formatDateString } from "../../../functionHelpers";

export interface ClaimHistoryItemExtended extends GetClaimHistoryDtoResponse {
    hospitalName?: string;
    uncoveredAmount?: number;
    paymentStatusName?: string;
    remark?: string;
    claimTypeCode?: "Continuous" | "DeathClaim" | "Normal";
    continuousCaseCount?: number;
}

interface Props {
    open: boolean;
    onClose: () => void;
    items: ClaimHistoryItemExtended[];
    handleDetailClick: (item: GetClaimHistoryDtoResponse) => void;
    paginated: PaginationResultDto;
    setPaginated: React.Dispatch<React.SetStateAction<PaginationSortableDto>>;
    isLoading?: boolean;
}

const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const claimTypeBadge = (claimTypeCode?: ClaimHistoryItemExtended["claimTypeCode"]) => {
    switch (claimTypeCode) {
        case "Continuous":
            return {
                label: "เคลมต่อเนื่อง",
                icon: <SwapHorizIcon sx={{ fontSize: 16 }} />,
                bgcolor: "#fdf1d9",
                color: "#b26a00",
            };
        case "DeathClaim":
            return {
                label: "DeathClaim",
                icon: <FavoriteIcon sx={{ fontSize: 16 }} />,
                bgcolor: "#fce4e4",
                color: "#c62828",
            };
        default:
            return {
                label: "เคลมปกติ",
                icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
                bgcolor: "#eceff1",
                color: "#616161",
            };
    }
};

const ClaimHistoryModalMore: React.FC<Props> = ({
    open,
    onClose,
    items,
    handleDetailClick,
    paginated,
    setPaginated,
    isLoading,
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const totalPages = Math.max(1, Math.ceil((paginated.totalAmountRecords ?? 1) / (paginated.recordsPerPage || 10)));
    const currentPage = paginated.currentPage || 1;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
            <DialogTitle sx={{ pb: 1.5, bgcolor: "#eaf5ff" }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Box display="flex" alignItems="center" gap={1.25}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#d9ecfb" }}>
                            <HistoryIcon sx={{ fontSize: 20, color: "primary.main" }} />
                        </Avatar>
                        <Box>
                            <Typography fontWeight={700} fontSize={16} color="#1a5da8">
                                รายการประวัติการเคลมทั้งหมด
                            </Typography>
                            <Typography fontSize={12} color="#1a5da8">
                                ทั้งหมด {paginated.totalAmountRecords || items[0]?.totalCount || items.length}{" "}
                                รายการ
                            </Typography>
                        </Box>
                    </Box>
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
            </DialogTitle>

            <DialogContent sx={{ pt: 2, pb: 2, bgcolor: "#f5f8fb", position: "relative", minHeight: 200 }}>
                {isLoading && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            bgcolor: "rgba(255,255,255,0.7)",
                            zIndex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CircularProgress size={32} />
                    </Box>
                )}
                {items.length === 0 ? (
                    <Box textAlign="center" py={4} color="text.secondary">
                        <Typography fontSize={14}>ไม่มีประวัติการเคลม</Typography>
                    </Box>
                ) : (
                    items.map((item, idx) => {
                        const badge = claimTypeBadge(item.claimTypeCode);
                        const isDeathClaim = item.claimTypeCode === "DeathClaim";
                        return (
                            <Box
                                key={item.claimNo ?? idx}
                                sx={{
                                    border: "1px solid",
                                    borderColor: isDeathClaim ? "#f3c8c8" : "divider",
                                    bgcolor: isDeathClaim ? "#fdf3f3" : "background.paper",
                                    borderRadius: 3,
                                    mb: 2,
                                    p: 2,
                                }}
                            >
                                {/* เลขที่เคลม + badge ประเภท */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    mb={1.5}
                                    flexWrap="wrap"
                                    gap={1}
                                >
                                    <Box>
                                        <Typography fontSize={12} color="text.secondary">
                                            เลขที่เคลม
                                        </Typography>
                                        <Typography
                                            fontSize={16}
                                            fontWeight={700}
                                            color="primary.main"
                                            sx={{ textDecoration: "underline", cursor: "pointer" }}
                                            onClick={() => handleDetailClick(item)}
                                        >
                                            {item.claimNo}
                                        </Typography>
                                    </Box>

                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={0.5}
                                        sx={{
                                            bgcolor: badge.bgcolor,
                                            color: badge.color,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 5,
                                        }}
                                    >
                                        {badge.icon}
                                        <Typography fontSize={13} fontWeight={700} sx={{ color: "inherit" }}>
                                            {badge.label}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* วันที่เกิดเหตุ / สถานพยาบาล */}
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                        gap: 2,
                                        mb: 1.5,
                                    }}
                                >
                                    <Box>
                                        <Typography fontSize={12} color="text.secondary">
                                            วันที่เกิดเหตุ
                                        </Typography>
                                        <Typography fontSize={14} fontWeight={600}>
                                            {item.incidentDate
                                                ? formatDateString(item.incidentDate.toString(), "DD/MM/BBBB")
                                                : "-"}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography fontSize={12} color="text.secondary">
                                            สถานพยาบาล
                                        </Typography>
                                        <Typography fontSize={14} fontWeight={600}>
                                            {item.hospitalName ?? "-"}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* อาการสำคัญ */}
                                <Box mb={1.5}>
                                    <Typography fontSize={12} color="text.secondary">
                                        อาการสำคัญ
                                    </Typography>
                                    <Typography fontSize={14} fontWeight={600}>
                                        {item.lastestChiefComplaint || "-"}
                                    </Typography>
                                </Box>

                                {/* ยอดเงินตามใบเสร็จรวม / ยอดจ่ายรวม */}
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                        gap: 2,
                                        mb: 1.5,
                                    }}
                                >
                                    <Box>
                                        <Typography fontSize={12} color="text.secondary">
                                            ยอดเงินตามใบเสร็จรวม
                                        </Typography>
                                        <Typography fontSize={15} fontWeight={700} color="primary.main">
                                            {fmt(item.totalCaseAmount ?? 0)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography fontSize={12} color="text.secondary">
                                            ยอดจ่ายรวม
                                        </Typography>
                                        <Typography fontSize={15} fontWeight={700} color="success.main">
                                            {fmt(item.paidAmount ?? 0)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* ยอดไม่คุ้มครอง / สถานะการจ่าย */}
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                        gap: 2,
                                        mb: 1.5,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            px: 1.5,
                                            py: 1,
                                            bgcolor: "background.paper",
                                        }}
                                    >
                                        <Typography fontSize={12} color="text.secondary">
                                            ยอดไม่คุ้มครอง
                                        </Typography>
                                        <Typography fontSize={14} fontWeight={700} color="error.main">
                                            {fmt(item.uncoveredAmount ?? 0)}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            px: 1.5,
                                            py: 1,
                                            bgcolor: "background.paper",
                                        }}
                                    >
                                        <Typography fontSize={12} color="text.secondary">
                                            สถานะการจ่าย
                                        </Typography>
                                        <Typography fontSize={14} fontWeight={600}>
                                            {item.paymentStatusName ?? "-"}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* วันที่จ่ายเงิน / หมายเหตุ */}
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                        gap: 2,
                                        mb: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            px: 1.5,
                                            py: 1,
                                            bgcolor: "background.paper",
                                        }}
                                    >
                                        <Typography fontSize={12} color="text.secondary">
                                            วันที่จ่ายเงิน
                                        </Typography>
                                        <Typography fontSize={14} fontWeight={600}>
                                            {item.paymentDate
                                                ? formatDateString(item.paymentDate.toString(), "DD/MM/BBBB")
                                                : "-"}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            px: 1.5,
                                            py: 1,
                                            bgcolor: "background.paper",
                                        }}
                                    >
                                        <Typography fontSize={12} color="text.secondary">
                                            หมายเหตุ
                                        </Typography>
                                        <Typography fontSize={14} fontWeight={600}>
                                            {item.remark ?? "-"}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* footer: ดูรายละเอียดเคสในเคลมนี้ */}
                                <Box
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    alignItems={{ xs: "stretch", sm: "center" }}
                                    justifyContent="space-between"
                                    gap={{ xs: 1.5, sm: 0 }}
                                    sx={{
                                        border: "1px solid",
                                        borderColor: isDeathClaim ? "error.light" : "primary.light",
                                        borderRadius: 2,
                                        px: 2,
                                        py: 1.25,
                                    }}
                                >
                                    <Box>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={0.75}
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => handleDetailClick(item)}
                                        >
                                            <ReceiptLongIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: isDeathClaim ? "error.main" : "primary.main",
                                                }}
                                            />
                                            <Typography
                                                fontSize={13}
                                                fontWeight={600}
                                                color={isDeathClaim ? "error.main" : "primary.main"}
                                            >
                                                ดูรายละเอียดเคสในเคลมนี้
                                            </Typography>
                                        </Box>
                                        <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
                                            {item.continuousCaseCount !== undefined
                                                ? `พบเคสต่อเนื่อง ${item.continuousCaseCount} รายการจากทั้งหมด ${
                                                      item.countCase ?? 0
                                                  } เคส`
                                                : item.claimTypeCode && item.claimTypeCode !== "Normal"
                                                ? `เคลมประเภท ${badge.label} จำนวน ${item.countCase ?? 0} เคส`
                                                : `ทั้งหมด ${item.countCase ?? 0} เคส`}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        color={isDeathClaim ? "error" : "primary"}
                                        startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                                        onClick={() => handleDetailClick(item)}
                                    >
                                        ดูรายละเอียด
                                    </Button>
                                </Box>
                            </Box>
                        );
                    })
                )}
            </DialogContent>

            <Divider />
            <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={1.5}>
                <Typography fontSize={13} color="text.secondary">
                    แสดงข้อมูล {paginated.recordsPerPage || items.length} รายการต่อหน้า
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                        size="small"
                        disabled={currentPage <= 1 || isLoading}
                        onClick={() => setPaginated((prev: any) => ({ ...prev, page: currentPage - 1 }))}
                        sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                        <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <Typography fontSize={13} fontWeight={600}>
                        หน้า {currentPage} จาก {totalPages}
                    </Typography>
                    <IconButton
                        size="small"
                        disabled={currentPage >= totalPages || isLoading}
                        onClick={() => setPaginated((prev: any) => ({ ...prev, page: currentPage + 1 }))}
                        sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        </Dialog>
    );
};

export default ClaimHistoryModalMore;
