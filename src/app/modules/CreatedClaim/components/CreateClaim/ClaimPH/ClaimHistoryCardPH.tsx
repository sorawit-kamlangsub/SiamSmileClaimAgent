import React from "react";
import { Box, Typography, IconButton, Divider, Tooltip, Link, Zoom } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";
import { useClaimHistory } from "../../../hooks/Monitor/useClaimHistory";
import { formatDateString } from "../../../../../functionHelpers";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";

const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ClaimHistoryCardPH: React.FC = () => {
    const { paged, page, setPage, totalPages, total, handleDetailClick } = useClaimHistory();

    return (
        <CustomBox sx={{ minHeight: 284 }}>
            {/* Header */}
            <HeadingWithColor text="ประวัติการเคลม" color="blue" icon={<HistoryIcon sx={{ fontSize: 27 }} />} />

            {/* Cards */}
            {paged.length === 0 ? (
                <Box textAlign="center" py={4} color="text.secondary">
                    <Typography fontSize={14}>ไม่มีประวัติการเคลม</Typography>
                </Box>
            ) : (
                paged.map((item, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            border: "0.5px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            mb: 1,
                            overflow: "hidden",
                            // "&:hover": { borderColor: "primary.light" },
                        }}
                    >
                        {/* Claim No + Arrow */}
                        <Box display="flex" alignItems="center" justifyContent="space-between" px={2} pt={1}>
                            <Link fontSize={15} fontWeight="bold" color="primary.main" onClick={() => {}}>
                                {item.claimNo}
                            </Link>
                            <Tooltip
                                title="ดูรายละเอียด"
                                arrow
                                placement="top"
                                TransitionComponent={Zoom}
                                enterDelay={100}
                                leaveDelay={50}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => handleDetailClick(item)}
                                    sx={{
                                        color: "primary.main",
                                        "&:hover": { color: "primary.main", borderColor: "primary.light" },
                                        border: "1px solid #e2eeff",
                                        bgcolor: "#e9f2ff",
                                    }}
                                >
                                    <ChevronRightIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Divider sx={{ mx: 1, mt: 1 }} />

                        {/* Fields */}
                        <Box
                            display="grid"
                            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                            gap="6px 12px"
                            px={2}
                            py={1.5}
                        >
                            <Box display="flex" alignItems="baseline" gap={1}>
                                <Typography fontSize={14} color="text.secondary" whiteSpace="nowrap">
                                    อาการสำคัญ :
                                </Typography>
                                <Typography fontSize={14} fontWeight="bold" color="primary.main">
                                    {item.chiefComplain}
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="baseline" gap={1}>
                                <Typography fontSize={14} color="text.secondary" whiteSpace="nowrap">
                                    วันที่เกิดเหตุ :
                                </Typography>
                                <Typography fontSize={14} fontWeight="bold" color="primary.main">
                                    {formatDateString(item.incidentDate.toString(), "DD/MM/BBBB")}
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="baseline" gap={1}>
                                <Typography fontSize={14} color="text.secondary" whiteSpace="nowrap">
                                    ยอดเบิกรวม :
                                </Typography>
                                <Typography fontSize={14} fontWeight="bold" color="error.main">
                                    {fmt(item.totalClaim)}
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="baseline" gap={1}>
                                <Typography fontSize={14} color="text.secondary" whiteSpace="nowrap">
                                    ยอดจ่ายรวม :
                                </Typography>
                                <Typography fontSize={14} fontWeight="bold" color="success.main">
                                    {fmt(item.totalPaid)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))
            )}

            {/* Dot pagination */}
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" gap={0.8} mt={0.5}>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Box
                            key={i}
                            onClick={() => setPage(i)}
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: i === page ? "primary.main" : "divider",
                                cursor: "pointer",
                                transition: "background .2s",
                            }}
                        />
                    ))}
                </Box>
            )}
            <Box display="flex" justifyContent="flex-end" gap={0.8} mt={0.5}>
                <Typography sx={{ fontSize: 13 }} color="text.secondary">
                    {page * 2 + 1}–{Math.min((page + 1) * 2, total)} / {total} รายการ
                </Typography>
            </Box>
        </CustomBox>
    );
};

export default ClaimHistoryCardPH;
