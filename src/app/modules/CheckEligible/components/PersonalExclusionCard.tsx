import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
// import VerifiedIcon from "@mui/icons-material/Verified";
import CustomBox from "../../_common/components/CustomComponent/CustomBox";
import { PersonalExclusionNote } from "../hooks/useCheckEligibleDetail";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";

type Props = {
    notes: PersonalExclusionNote[];
};

const PersonalExclusionCard: React.FC<Props> = ({ notes }) => {
    return (
        <CustomBox>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        width: 35,
                        height: 35,
                        borderRadius: "20%",
                        bgcolor: "#fdf6e3",
                    }}
                >
                    <PrivacyTipIcon sx={{ color: "#e8971f", fontSize: 25 }} />
                </Box>
                <Typography variant="body2" fontWeight={700} color="#6e5210">
                    เงื่อนไขข้อยกเว้นเฉพาะบุคคล
                </Typography>
            </Box>
            <Divider sx={{ my: 1.5, mx: -2.5 }} />

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
                            mb: 0,
                        }}
                    >
                        <WarningAmberIcon sx={{ color: "#e8971f", fontSize: 28 }} />
                        <Typography variant="body2" color="#6e5210">
                            {note.message}
                        </Typography>
                    </Box>
                ))
            )}
        </CustomBox>
    );
};

export default PersonalExclusionCard;
