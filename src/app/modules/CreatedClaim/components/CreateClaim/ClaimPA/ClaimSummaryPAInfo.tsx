import React from "react";
import { Avatar, Box, IconButton, Stack, Tooltip, Typography, Zoom } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import { ClaimInsuredItem } from "../../../store/claimPASlice";
import { formatDateString } from "../../../../../functionHelpers";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";

interface Props {
    data: ClaimInsuredItem[];
    onEdit: (item: ClaimInsuredItem) => void;
    onDelete: (id: string) => void;
    onAddInsured: () => void;
}

const ClaimSummaryPAInfo: React.FC<Props> = ({ data, onEdit, onDelete, onAddInsured }) => {
    return (
        <>
            <HeadingWithColor text="ข้อมูลเคลม" color="blue" />

            <Stack spacing={2}>
                {data.map((item, index) => (
                    <Box
                        key={item.id}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "64px 1fr",
                                md: "72px 1fr 220px 220px 96px",
                            },
                            alignItems: "center",
                            gap: 2,
                            border: "1px solid #E3EDF7",
                            borderRadius: 2,
                            bgcolor: "#fff",
                            p: 3,
                            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 58,
                                height: 58,
                                bgcolor: "#D8EEFF",
                                color: "#005B96",
                                fontWeight: 700,
                            }}
                        >
                            {item.seq ?? index + 1}
                        </Avatar>

                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>{item.customerName}</Typography>

                                {/* <Typography
                                    component="button"
                                    type="button"
                                    onClick={() => {
                                        onEdit(item);
                                    }}
                                    sx={{
                                        border: 0,
                                        bgcolor: "transparent",
                                        p: 0,
                                        color: "#005B96",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        fontSize: 13,
                                    }}
                                >
                                    ต่อเนื่อง
                                </Typography> */}
                            </Stack>

                            <Typography sx={{ mt: 2 }} color="text.secondary">
                                ลักษณะการเคลม :
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: "bold", color: "#007AC1", whiteSpace: "pre-wrap" }}>
                                {item.claimStyle}
                            </Typography>
                        </Box>

                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CalendarMonthIcon sx={{ color: "#0076B6", fontSize: 30 }} />
                            <Box>
                                <Typography color="text.secondary">วันที่เกิดเหตุ :</Typography>
                                <Typography sx={{ fontWeight: "bold", color: "#007AC1", whiteSpace: "pre-wrap" }}>
                                    {item.incidentDate
                                        ? formatDateString(item.incidentDate.toString(), "DD/MM/BBBB")
                                        : "-"}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <PaymentsIcon sx={{ color: "#0076B6", fontSize: 30 }} />
                            <Box>
                                <Typography color="text.secondary">จำนวนเงิน :</Typography>
                                <Typography sx={{ fontWeight: "bold", color: "#007AC1", whiteSpace: "pre-wrap" }}>
                                    {Number(item.claimAmount || 0).toLocaleString("th-TH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <Tooltip title="แก้ไขรายการ" arrow TransitionComponent={Zoom} placement="top">
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        onAddInsured();
                                    }}
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        bgcolor: "#FFF1BE",
                                        color: "#9A6A00",
                                        "&:hover": { bgcolor: "#FFE59A" },
                                    }}
                                    disabled
                                >
                                    <PersonAddIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="ลบรายการ" arrow TransitionComponent={Zoom} placement="top">
                                <IconButton
                                    size="small"
                                    onClick={() => onDelete(item.id)}
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        bgcolor: "#FFE0E0",
                                        color: "#D94A4A",
                                        "&:hover": { bgcolor: "#FFCACA" },
                                    }}
                                    disabled
                                >
                                    <DeleteForeverIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </>
    );
};

export default ClaimSummaryPAInfo;
