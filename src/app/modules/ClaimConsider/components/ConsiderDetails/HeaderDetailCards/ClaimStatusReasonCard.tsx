import { Box, Chip, Paper, Typography } from "@mui/material";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NotesIcon from "@mui/icons-material/Notes";
import { ReactNode } from "react";
import { backgroundColorMapDecision, colorMapDecision } from "../../../../../functionHelpers";

/** decisionId ที่ต้องแสดง Card : 4 รอแก้ไข · 5 ปฏิเสธ · 6 ยกเลิก (ชุดเดียวกับ colorMapDecision) */
export const CLAIM_STATUS_REASON_DECISION_IDS = [4, 5, 6];

type ClaimStatusReasonCardProps = {
    decisionId: number | undefined;
    decisionNameTH: string | undefined;
    decisionReasonName: string | undefined;
    decisionRemark: string | undefined;
};

const ACCENT = "#F59E0B";

const InfoBox = ({ icon, label, value }: { icon: ReactNode; label: string; value: string | undefined }) => (
    <Paper variant="outlined" sx={{ flex: 1, p: 1.5, borderRadius: 2, borderColor: "#e3e9f0", minWidth: 0 }}>
        <Box display="flex" alignItems="center" gap={0.75} mb={0.75} sx={{ color: ACCENT }}>
            {icon}
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {label}
            </Typography>
        </Box>
        <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {value?.trim() || "-"}
        </Typography>
    </Paper>
);

/**
 * RC-005 5.1 (บันทึกข้อมูลเคลม - เคลมโรงพยาบาล) : Card "รายละเอียดสถานะรายการ" พร้อมสาเหตุและรายละเอียด
 * แสดงเฉพาะเมื่อสถานะเป็น รอแก้ไข / ปฏิเสธ / ยกเลิก — สถานะอื่นไม่ render อะไรเลย
 */
const ClaimStatusReasonCard = ({
    decisionId,
    decisionNameTH,
    decisionReasonName,
    decisionRemark,
}: ClaimStatusReasonCardProps) => {
    if (!decisionId || !CLAIM_STATUS_REASON_DECISION_IDS.includes(decisionId)) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 1.5,
                p: 1.5,
                borderRadius: 3,
                border: "1px solid #e3e9f0",
                borderTop: `3px solid ${ACCENT}`,
                background: "linear-gradient(90deg, #FFF8EC 0%, #ffffff 30%)",
            }}
        >
            <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: { md: 240 }, px: 1 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "#fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: ACCENT,
                        flexShrink: 0,
                    }}
                >
                    <PlaylistAddCheckIcon />
                </Box>
                <Box>
                    <Typography variant="body2" fontWeight={600}>
                        รายละเอียดสถานะรายการ
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                            สถานะปัจจุบัน
                        </Typography>
                        <Chip
                            label={decisionNameTH ?? "-"}
                            size="small"
                            sx={{
                                backgroundColor: backgroundColorMapDecision[decisionId] ?? "#EEEEEE",
                                color: colorMapDecision[decisionId] ?? "#616161",
                                fontWeight: 600,
                                borderRadius: "16px",
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            <InfoBox icon={<HelpOutlineIcon sx={{ fontSize: 18 }} />} label="สาเหตุ" value={decisionReasonName} />
            <InfoBox icon={<NotesIcon sx={{ fontSize: 18 }} />} label="รายละเอียด" value={decisionRemark} />
        </Paper>
    );
};

export default ClaimStatusReasonCard;
