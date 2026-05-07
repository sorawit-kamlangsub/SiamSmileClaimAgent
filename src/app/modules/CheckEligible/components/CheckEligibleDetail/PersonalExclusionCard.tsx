import React from "react";
import { Box, Typography } from "@mui/material";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import { PersonalExclusionNote } from "../../hooks/CheckEligibleDetail/useCheckEligibleDetail";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import CustomBox from "../../../_common/components/CustomComponent/CustomBox";

type Props = {
    notes: PersonalExclusionNote[];
};

const PersonalExclusionCard: React.FC<Props> = ({ notes }) => {
    return (
        <CustomBox>
            {/* Header */}
            <HeadingWithColor text="เงื่อนไขข้อยกเว้นเฉพาะบุคคล" color="yellow" />

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
        </CustomBox>
    );
};

export default PersonalExclusionCard;
