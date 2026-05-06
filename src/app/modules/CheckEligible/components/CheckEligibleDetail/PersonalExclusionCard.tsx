import React from "react";
import { Box, Typography } from "@mui/material";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import { PersonalExclusionNote } from "../../hooks/CheckEligibleDetail/useCheckEligibleDetail";

type Props = {
    notes: PersonalExclusionNote[];
};

const PersonalExclusionCard: React.FC<Props> = ({ notes }) => {
    return (
        <Box
            sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                p: 2.5,
                bgcolor: "#fff",
                mb: 2,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: "#fdf6e3",
                    borderLeft: "4px solid #c8a415",
                    px: 2,
                    py: 1,
                    mb: 2,
                    borderRadius: "0 4px 4px 0",
                }}
            >
                <Typography variant="subtitle1" fontWeight={700} color="#c8a415">
                    เงื่อนไขข้อยกเว้นเฉพาะบุคคล
                </Typography>
            </Box>

            {/* Notes list */}
            {notes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    ไม่มีข้อมูล
                </Typography>
            ) : (
                notes.map((note) => (
                    <Box
                        key={note.id}
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                        sx={{
                            bgcolor: "#fdf6e3",
                            border: "1px solid #e8d48b",
                            borderRadius: 2,
                            px: 2,
                            py: 1.5,
                            mb: 1,
                        }}
                    >
                        <PrivacyTipIcon sx={{ color: "#c8a415", fontSize: 28 }} />
                        <Typography variant="body2" color="text.primary">
                            {note.message}
                        </Typography>
                    </Box>
                ))
            )}
        </Box>
    );
};

export default PersonalExclusionCard;
