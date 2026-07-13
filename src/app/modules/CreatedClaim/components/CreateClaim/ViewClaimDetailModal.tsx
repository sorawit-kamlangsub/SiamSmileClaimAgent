import React from "react";
import { Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, Paper, Divider, Avatar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { GetClaimHistoryDtoResponse } from "../../../../api/coreClaimApi.client";
import { formatDateString } from "../../../../functionHelpers";
import { fmt } from "./ClaimHistoryCard";
import HistoryIcon from "@mui/icons-material/History";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
interface Props {
    open: boolean;
    onClose: () => void;
    claim?: GetClaimHistoryDtoResponse;
}

const ViewClaimDetailModal: React.FC<Props> = ({ open, onClose, claim }) => {
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
                <Paper variant="outlined" sx={{ borderRadius: 3 }}>
                    <Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between" px={2} pt={2} pb={1.5}>
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
                                    {claim?.chiefComplaintDetail || "-"}
                                </Typography>
                            </Box>

                            <Box textAlign="right">
                                <Typography fontSize={16} color="text.secondary">
                                    ยอดเบิกรวม
                                </Typography>
                                <Typography fontSize={16} fontWeight={700} color="primary.main">
                                    {fmt(claim?.caseAmount ?? 0)}
                                </Typography>
                            </Box>

                            <Box textAlign="right">
                                <Typography fontSize={16} color="text.secondary">
                                    ยอดจ่ายรวม
                                </Typography>
                                <Typography fontSize={16} fontWeight={700} color="success.main">
                                    {fmt(claim?.totalPaidAmount ?? 0)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                <Divider sx={{ my: 3 }} />

                <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}></Paper>
            </DialogContent>
        </Dialog>
    );
};

export default ViewClaimDetailModal;
