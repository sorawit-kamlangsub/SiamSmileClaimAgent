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
    Avatar,
    LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { GetCaseByClaimIdDtoResponse, GetClaimHistoryDtoResponse } from "../../../../api/coreClaimApi.client";
import { formatDateString } from "../../../../functionHelpers";
import { fmt } from "./ClaimHistoryCard";
import DescriptionIcon from "@mui/icons-material/Description";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
interface Props {
    open: boolean;
    onClose: () => void;
    claim?: GetClaimHistoryDtoResponse;
    caseData?: GetCaseByClaimIdDtoResponse[];
    isLoading?: boolean;
}

const ViewClaimDetailModal: React.FC<Props> = ({ open, onClose, claim, caseData, isLoading }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#DCEFFC" }}>
                            <StickyNote2Icon sx={{ fontSize: 24, color: "primary.main" }} />
                        </Avatar>
                        <Typography fontWeight="bold" fontSize={18}>
                            รายละเอียดเคส
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "common.white",
                            width: 25,
                            height: 25,
                            "&:hover": { bgcolor: "error.dark" },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 23 }} />
                    </IconButton>
                </Box>

                <Divider sx={{ mt: 1.5 }} />
            </DialogTitle>

            <DialogContent>
                {isLoading ? (
                    <LinearProgress sx={{ height: "5px" }} />
                ) : (
                    <>
                        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
                            <Box>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    px={2}
                                    pt={2}
                                    pb={1.5}
                                >
                                    <Box>
                                        <Typography fontSize={16} color="text.secondary">
                                            เลขที่เคลม
                                        </Typography>
                                        <Typography
                                            fontSize={16}
                                            fontWeight={700}
                                            color="primary.main"
                                            sx={{ textDecoration: "underline", cursor: "pointer" }}
                                        >
                                            {claim?.claimNo}
                                        </Typography>
                                    </Box>

                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={0.75}
                                        sx={{
                                            border: "1px solid",
                                            borderColor: "divider",
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 5,
                                        }}
                                    >
                                        <CheckCircleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                        <Typography fontSize={14} fontWeight={700} color="text.secondary">
                                            เคลมปกติ
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box
                                    display="flex"
                                    flexWrap="wrap"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                    columnGap={3}
                                    rowGap={1.5}
                                    px={2}
                                    pb={2}
                                >
                                    <Box>
                                        <Typography fontSize={16} color="text.secondary">
                                            วันที่เกิดเหตุ
                                        </Typography>
                                        <Typography fontSize={16} fontWeight={600}>
                                            {claim?.incidentDate
                                                ? formatDateString(claim?.incidentDate.toString(), "DD/MM/BBBB")
                                                : "-"}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ flex: 1, minWidth: 160 }}>
                                        <Typography fontSize={16} color="text.secondary">
                                            อาการสำคัญ
                                        </Typography>
                                        <Typography fontSize={16} fontWeight={600}>
                                            {claim?.lastestChiefComplaint || "-"}
                                        </Typography>
                                    </Box>

                                    <Box textAlign="right">
                                        <Typography fontSize={16} color="text.secondary">
                                            ยอดเบิกรวม
                                        </Typography>
                                        <Typography fontSize={16} fontWeight={700} color="primary.main">
                                            {fmt(claim?.totalCaseAmount ?? 0)}
                                        </Typography>
                                    </Box>

                                    <Box textAlign="right">
                                        <Typography fontSize={16} color="text.secondary">
                                            ยอดจ่ายรวม
                                        </Typography>
                                        <Typography fontSize={16} fontWeight={700} color="success.main">
                                            {fmt(claim?.paidAmount ?? 0)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>

                        <Divider sx={{ my: 3 }} />
                        {caseData?.map((item, index) => (
                            <div key={index} style={{ marginBottom: "16px" }}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 4,
                                        p: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        flexWrap: { xs: "wrap", md: "nowrap" }, // รองรับ responsive
                                        gap: 2,
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={2} sx={{ minWidth: 280 }}>
                                        <Box
                                            sx={{
                                                backgroundColor: "#e8f4fd",
                                                borderRadius: 3,
                                                width: 48,
                                                height: 48,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <DescriptionIcon sx={{ color: "#10609d", fontSize: 24 }} />
                                        </Box>

                                        <Typography
                                            fontSize={16}
                                            fontWeight={600}
                                            color="#10609d"
                                            sx={{ cursor: "pointer" }}
                                        >
                                            {item?.caseNo}
                                        </Typography>

                                        {index === 0 && (
                                            <Box
                                                sx={{
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 4,
                                                    backgroundColor: "#f8f9fa",
                                                }}
                                            >
                                                <Typography fontSize={13} fontWeight={500} color="text.secondary">
                                                    เคสแรก
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                        flex={1}
                                        justifyContent="flex-end"
                                        sx={{ flexWrap: { xs: "wrap", sm: "nowrap" }, width: "100%" }}
                                    >
                                        <Box
                                            sx={{
                                                border: "1px solid #f0f0f0",
                                                borderRadius: 3,
                                                p: 1.5,
                                                minWidth: 130,
                                                textAlign: "center",
                                            }}
                                        >
                                            <Typography fontSize={13} color="text.secondary" mb={0.5}>
                                                วันที่เข้ารักษา
                                            </Typography>
                                            <Typography fontSize={15} fontWeight={600} color="text.primary">
                                                {item?.occurrenceDate
                                                    ? formatDateString(item?.occurrenceDate?.toString(), "DD/MM/BBBB")
                                                    : "18/02/2569"}
                                            </Typography>
                                        </Box>

                                        {/* อาการสำคัญ */}
                                        <Box
                                            sx={{
                                                border: "1px solid #f0f0f0",
                                                borderRadius: 3,
                                                p: 1.5,
                                                flex: 1,
                                                minWidth: 200,
                                            }}
                                        >
                                            <Typography fontSize={13} color="text.secondary" mb={0.5}>
                                                อาการสำคัญ
                                            </Typography>
                                            <Typography fontSize={15} fontWeight={600} color="text.primary" noWrap>
                                                {item?.lastestChiefComplaint}
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                backgroundColor: "#f0f6ff",
                                                border: "1px solid #e1eeff",
                                                borderRadius: 3,
                                                p: 1.5,
                                                minWidth: 120,
                                            }}
                                        >
                                            <Typography fontSize={13} color="text.secondary" mb={0.5}>
                                                ยอดเบิก
                                            </Typography>
                                            <Typography fontSize={16} fontWeight={700} color="#10609d">
                                                {fmt(item?.totalCaseAmount ?? 0)}
                                            </Typography>
                                        </Box>

                                        {/* ยอดจ่าย (กล่องสีเขียวอ่อน) */}
                                        <Box
                                            sx={{
                                                backgroundColor: "#f4fbf7",
                                                border: "1px solid #e6f7ed",
                                                borderRadius: 3,
                                                p: 1.5,
                                                minWidth: 120,
                                            }}
                                        >
                                            <Typography fontSize={13} color="text.secondary" mb={0.5}>
                                                ยอดจ่าย
                                            </Typography>
                                            <Typography fontSize={16} fontWeight={700} color="#2e7d32">
                                                {fmt(item?.casePaidAmount ?? 0)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </div>
                        ))}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ViewClaimDetailModal;
