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
    Stack,
    Pagination,
    Avatar,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import { formatDateString } from "../../../../functionHelpers";
import { GetClaimHistoryDtoResponse } from "../../../../api/coreClaimApi.client";
import { fmt } from "./ClaimHistoryCard";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";

interface Props {
    open: boolean;
    onClose: () => void;
    items: GetClaimHistoryDtoResponse[];
    handleDetailClick: (item: GetClaimHistoryDtoResponse) => void;
    paginated: PaginationResultDto;
    setPaginated: React.Dispatch<React.SetStateAction<PaginationSortableDto>>;
}

const ViewClaimHistoryModal: React.FC<Props> = ({
    open,
    onClose,
    items,
    handleDetailClick,
    paginated,
    setPaginated,
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#DCEFFC" }}>
                            <HistoryIcon sx={{ fontSize: 24, color: "primary.main" }} />
                        </Avatar>
                        <Typography fontWeight="bold" fontSize={18}>
                            {`ประวัติการเคลมทั้งหมด ${items[0]?.totalCount ?? 0} รายการ`}
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

            <DialogContent sx={{ pt: 1, pb: 3 }}>
                {items.length === 0 ? (
                    <Box textAlign="center" py={4} color="text.secondary">
                        <Typography fontSize={14}>ไม่มีประวัติการเคลม</Typography>
                    </Box>
                ) : (
                    items.map((item, idx) => (
                        <Box
                            key={item.claimNo ?? idx}
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 3,
                                mb: 1.5,
                                overflow: "hidden",
                                transition: "all 0.2s",
                                "&:hover": {
                                    borderColor: "primary.light",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                },
                            }}
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                px={2}
                                pt={2}
                                pb={1.5}
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
                                    <Typography fontSize={13} fontWeight={700} color="text.secondary">
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
                                    <Typography fontSize={12} color="text.secondary">
                                        วันที่เกิดเหตุ
                                    </Typography>
                                    <Typography fontSize={14} fontWeight={600}>
                                        {item.incidentDate
                                            ? formatDateString(item.incidentDate.toString(), "DD/MM/BBBB")
                                            : "-"}
                                    </Typography>
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 160 }}>
                                    <Typography fontSize={12} color="text.secondary">
                                        อาการสำคัญ
                                    </Typography>
                                    <Typography fontSize={14} fontWeight={600}>
                                        {item.lastestChiefComplaint || "-"}
                                    </Typography>
                                </Box>

                                <Box textAlign="right">
                                    <Typography fontSize={12} color="text.secondary">
                                        ยอดเบิกรวม
                                    </Typography>
                                    <Typography fontSize={15} fontWeight={700} color="primary.main">
                                        {fmt(item.totalCaseAmount ?? 0)}
                                    </Typography>
                                </Box>

                                <Box textAlign="right">
                                    <Typography fontSize={12} color="text.secondary">
                                        ยอดจ่ายรวม
                                    </Typography>
                                    <Typography fontSize={15} fontWeight={700} color="success.main">
                                        {fmt(item.paidAmount ?? 0)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box px={2} pb={2}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{
                                        border: "1px solid",
                                        borderColor: "primary.light",
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
                                            <ReceiptLongIcon sx={{ fontSize: 18, color: "primary.main" }} />
                                            <Typography fontSize={13} fontWeight={600} color="primary.main">
                                                ดูรายละเอียดเคสในเคลมนี้
                                            </Typography>
                                        </Box>

                                        <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
                                            ทั้งหมด {item.countCase} เคส
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                                        onClick={() => handleDetailClick(item)}
                                    >
                                        ดูรายละเอียด
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    ))
                )}
            </DialogContent>
            <Stack direction="row" justifyContent="center" sx={{ mt: 1, mb: 1 }}>
                <Pagination
                    page={paginated.currentPage}
                    count={Math.ceil((paginated.totalAmountRecords ?? 1) / (paginated.recordsPerPage ?? 10))}
                    color="primary"
                    onChange={(_, page) =>
                        setPaginated((prev: any) => ({
                            ...prev,
                            page,
                        }))
                    }
                />
            </Stack>
        </Dialog>
    );
};

export default ViewClaimHistoryModal;
