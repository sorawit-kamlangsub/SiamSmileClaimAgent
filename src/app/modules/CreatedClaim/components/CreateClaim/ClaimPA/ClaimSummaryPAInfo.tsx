import React from "react";
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
}

const ClaimSummaryPAInfo: React.FC<Props> = ({ data, onDelete, onAddInsured }) => {
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
                                xs: "1fr",
                                sm: "56px 1fr",
                                md: "72px 1fr 220px 220px 96px",
                            },
                            alignItems: { xs: "flex-start", md: "center" },
                            gap: { xs: 1.5, md: 2 },
                            border: "1px solid #E3EDF7",
                            borderRadius: 2,
                            bgcolor: "#fff",
                            p: { xs: 2, md: 3 },
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

                        <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography sx={{ fontWeight: 700, color: "#007AC1", fontSize: 19 }}>
                                    {item.customerName}
                                </Typography>
                            </Stack>

                            <Typography sx={{ mt: 1, fontSize: 14 }} color="text.secondary">
                                ลักษณะการเคลม :
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: "bold", color: "#007AC1", whiteSpace: "pre-wrap" }}>
                                {item.claimStyle}
                            </Typography>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={{ xs: 0.5, sm: 2 }}
                                flexWrap="wrap"
                                sx={{ mt: 1, rowGap: 0.5 }}
                            >
                                <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                                    เลขบัตรประชาชน :{" "}
                                    <Typography component="span" fontWeight="bold" color="#007AC1">
                                        {item.idCard ?? "-"}
                                    </Typography>
                                </Typography>
                                {/* <Typography color="text.secondary" fontSize={{ xs: 13, md: 14 }}>
                                    วันที่เข้า รพ. :{" "}
                                    <Typography component="span" fontWeight="bold" color="#007AC1" fontSize="inherit">
                                        {item.admissionDate
                                            ? formatDateString(item.admissionDate.toString(), "DD/MM/BBBB")
                                            : "-"}
                                    </Typography>
                                </Typography>
                                <Typography color="text.secondary" fontSize={{ xs: 13, md: 14 }}>
                                    วันที่ออก รพ. :{" "}
                                    <Typography component="span" fontWeight="bold" color="#007AC1" fontSize="inherit">
                                        {item.dischargeDate
                                            ? formatDateString(item.dischargeDate.toString(), "DD/MM/BBBB")
                                            : "-"}
                                    </Typography>
                                </Typography> */}
                            </Stack>
                        </Box>

                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <CalendarMonthIcon sx={{ color: "#0076B6", fontSize: 30 }} />
                            <Box>
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

                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <PaymentsIcon sx={{ color: "#0076B6", fontSize: 30 }} />
                            <Box>
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

                        <Stack direction="row" justifyContent={{ xs: "flex-start", md: "flex-end" }} spacing={1}>
                            {/* <Tooltip title="แก้ไขรายการ" arrow TransitionComponent={Zoom} placement="top">
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
                                >
                                    <PersonAddIcon />
                                </IconButton>
                            </Tooltip> */}

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
            </Stack>
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button
                    variant="outlined"
                    sx={{ height: 32 }}
                    color="primary"
                    onClick={() => onAddInsured()}
                    startIcon={<PersonAddIcon />}
                    
                >
                    เพิ่มรายการ
                </Button>
            </Grid>
        </>
    );
};

export default ClaimSummaryPAInfo;
