import React, { useRef } from "react";
import { Avatar, Box, Button, Grid, IconButton, Stack, Tooltip, Typography, Zoom } from "@mui/material";
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
    disableAddInsured?: boolean;
    disableAddInsuredReason?: string;
}

const ClaimSummaryPAInfo: React.FC<Props> = ({
    data,
    onDelete,
    onAddInsured,
    disableAddInsured,
    disableAddInsuredReason,
}) => {
    const listRef = useRef<HTMLDivElement>(null);

    const LG_VISIBLE_ROWS = 4;
    const showLgVerticalScroll = data.length > LG_VISIBLE_ROWS;
    const LG_ROW_HEIGHT = 96;
    const LG_GAP = 16;
    const lgMaxHeight = LG_VISIBLE_ROWS * LG_ROW_HEIGHT + (LG_VISIBLE_ROWS - 1) * LG_GAP;
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const el = listRef.current;
        if (!el) return;
        const canScrollY = el.scrollHeight > el.clientHeight;
        if (!canScrollY) return;
        el.scrollTop += e.deltaY;
    };

    return (
        <>
            <HeadingWithColor text="ข้อมูลเคลม" color="blue" />

            <Box
                ref={listRef}
                onWheel={handleWheel}
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "1fr",
                    },
                    gap: 2,
                    maxHeight: { xs: 520, sm: 560, md: 600, lg: showLgVerticalScroll ? lgMaxHeight : "none" },
                    overflowY: { xs: "auto", sm: "auto", md: "auto", lg: showLgVerticalScroll ? "auto" : "hidden" },
                    overflowX: { xs: "hidden", lg: "auto" },
                    scrollbarGutter: "stable",
                    pr: { xs: 0.5, lg: 0 },
                    pb: { lg: 1.5 },
                    "&::-webkit-scrollbar": {
                        width: 8,
                        height: 8,
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#B9D6EA",
                        borderRadius: 4,
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "transparent",
                    },
                }}
            >
                {data.map((item, index) => (
                    <Box
                        key={item.id}
                        sx={{
                            display: "grid",
                            gap: { xs: 1.5, lg: 2 },
                            border: "1px solid #E3EDF7",
                            borderRadius: 2,
                            bgcolor: "#fff",
                            p: { xs: 2, md: 2.5, lg: 3 },
                            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
                            gridTemplateColumns: { xs: "auto 1fr", lg: "72px 1fr 220px 220px 96px" },
                            minWidth: { lg: 960 },
                            gridTemplateAreas: {
                                xs: `
                                    "avatar header"
                                    "claim claim"
                                    "idcard idcard"
                                    "date date"
                                    "amount amount"
                                    "actions actions"
                                `,
                                lg: `
                                    "avatar header date amount actions"
                                    "avatar claim date amount actions"
                                    "avatar idcard date amount actions"
                                `,
                            },
                            alignItems: "center",
                        }}
                    >
                        <Avatar
                            sx={{
                                gridArea: "avatar",
                                width: { xs: 50, lg: 58 },
                                height: { xs: 50, lg: 58 },
                                bgcolor: "#D8EEFF",
                                color: "#005B96",
                                fontWeight: 700,
                                flexShrink: 0,
                                alignSelf: { xs: "center", lg: "center" },
                            }}
                        >
                            {item.seq ?? index + 1}
                        </Avatar>

                        <Typography
                            sx={{
                                gridArea: "header",
                                fontWeight: 700,
                                color: "#007AC1",
                                fontSize: { xs: 18, lg: 19 },
                                alignSelf: "center",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {item.customerName}
                        </Typography>

                        <Box sx={{ gridArea: "claim", minWidth: 0 }}>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary">
                                ลักษณะการเคลม :
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: "bold", color: "#007AC1", whiteSpace: "pre-wrap" }}>
                                {item.claimStyle}
                            </Typography>
                        </Box>

                        <Typography sx={{ gridArea: "idcard", fontSize: 14 }} color="text.secondary">
                            เลขบัตรประชาชน :{" "}
                            <Typography component="span" fontWeight="bold" color="#007AC1">
                                {item.idCard ?? "-"}
                            </Typography>
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ gridArea: "date" }}>
                            <CalendarMonthIcon sx={{ color: "#0076B6", fontSize: 28, flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                                    วันที่เกิดเหตุ :
                                </Typography>
                                <Typography sx={{ fontWeight: "bold", color: "#007AC1", whiteSpace: "pre-wrap" }}>
                                    {item.incidentDate
                                        ? formatDateString(item.incidentDate.toString(), "DD/MM/BBBB")
                                        : "-"}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ gridArea: "amount" }}>
                            <PaymentsIcon sx={{ color: "#0076B6", fontSize: 28, flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                                    จำนวนเงิน :
                                </Typography>
                                <Typography sx={{ fontWeight: "bold", color: "#007AC1", whiteSpace: "pre-wrap" }}>
                                    {Number(item.claimAmount || 0).toLocaleString("th-TH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack
                            direction="row"
                            justifyContent={{ xs: "flex-end", lg: "flex-end" }}
                            spacing={1}
                            sx={{ gridArea: "actions" }}
                        >
                            <Tooltip title="ลบรายการ" arrow TransitionComponent={Zoom} placement="top">
                                <IconButton
                                    size="small"
                                    onClick={() => onDelete(item.id)}
                                    sx={{
                                        width: 37,
                                        height: 37,
                                        bgcolor: "#FFE0E0",
                                        color: "#D94A4A",
                                        "&:hover": { bgcolor: "#FFCACA" },
                                    }}
                                >
                                    <DeleteForeverIcon sx={{ fontSize: 27 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                ))}
            </Box>

            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Tooltip
                    title={disableAddInsured ? disableAddInsuredReason ?? "" : ""}
                    arrow
                    TransitionComponent={Zoom}
                    placement="top"
                >
                    <span>
                        <Button
                            variant="outlined"
                            sx={{ height: 32 }}
                            color="primary"
                            onClick={() => onAddInsured()}
                            startIcon={<PersonAddIcon />}
                            disabled={disableAddInsured}
                        >
                            เพิ่มรายการ
                        </Button>
                    </span>
                </Tooltip>
            </Grid>
        </>
    );
};

export default ClaimSummaryPAInfo;
