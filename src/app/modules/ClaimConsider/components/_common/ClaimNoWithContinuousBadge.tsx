import { Box, Chip } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

export type ClaimNoWithContinuousBadgeProps = {
    claimNo?: string;
    caseCount?: number;
};

/** แสดง ClaimNo พร้อม badge "เคลมต่อเนื่อง" เมื่อ caseCount > 1 (เคลมนี้มีหลายเคส) */
const ClaimNoWithContinuousBadge = ({ claimNo, caseCount }: ClaimNoWithContinuousBadgeProps) => {
    const isContinuousClaim = (caseCount ?? 0) > 1;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {claimNo || "-"}
            {isContinuousClaim && (
                <Chip
                    icon={<SwapHorizIcon />}
                    label="เคลมต่อเนื่อง"
                    size="small"
                    variant="outlined"
                    sx={{
                        color: "#c77700",
                        borderColor: "#f5c26b",
                        backgroundColor: "#fff8e6",
                        fontWeight: 600,
                        "& .MuiChip-icon": { color: "#c77700" },
                    }}
                />
            )}
        </Box>
    );
};

export default ClaimNoWithContinuousBadge;
