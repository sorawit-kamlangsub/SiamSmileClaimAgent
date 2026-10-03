import { Box, Skeleton } from "@mui/material";

export interface HospitalPaySettingHistoryTimelineSkeletonProps {
    rowCount?: number;
}

const HospitalPaySettingHistoryTimelineSkeleton = ({
    rowCount = 4,
}: HospitalPaySettingHistoryTimelineSkeletonProps) => {
    return (
        <Box
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "10px",
                backgroundColor: "#FFFFFF",
                padding: "16px 24px",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={220} height={24} />
            </Box>

            {Array.from({ length: rowCount }).map((_, index) => {
                const isLast = index === rowCount - 1;
                return (
                    <Box key={index} sx={{ display: "flex" }}>
                        {/* dot + connecting line column */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "20px",
                                flexShrink: 0,
                            }}
                        >
                            <Skeleton variant="circular" width={10} height={10} sx={{ marginTop: "4px" }} />
                            {!isLast && (
                                <Box
                                    sx={{ width: "2px", flexGrow: 1, backgroundColor: "#EEEEEE", minHeight: "36px" }}
                                />
                            )}
                        </Box>

                        {/* content */}
                        <Box sx={{ paddingLeft: "12px", paddingBottom: isLast ? 0 : "16px", flexGrow: 1 }}>
                            <Skeleton variant="text" width="40%" height={20} />
                            <Skeleton variant="text" width="65%" height={16} />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default HospitalPaySettingHistoryTimelineSkeleton;
