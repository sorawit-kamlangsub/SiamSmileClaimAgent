import { Box, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { useGetHistoryHospitalSetting } from "../historySettingAPI";
import HospitalPaySettingHistoryTimelineSkeleton from "./HospitalpaysettingHistoryTimelineSkeleton";
import dayjs from "dayjs";

export interface HospitalPaySettingHistoryEntry {
    actionName: string;
    createdDate: string;
    createdByUser: string;
}

export interface HospitalPaySettingHistoryTimelineProps {
    hospitalPaymentSettingId: string;
    hospitalName: string;
}

const HistorySettingByHospitalId = ({
    hospitalPaymentSettingId,
    hospitalName,
}: HospitalPaySettingHistoryTimelineProps) => {
    const { data, isLoading } = useGetHistoryHospitalSetting(hospitalPaymentSettingId);

    if (isLoading) {
        return <HospitalPaySettingHistoryTimelineSkeleton />;
    }
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
                <HistoryIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, color: "#212121" }}>ประวัติการตั้งค่า — {hospitalName}</Typography>
            </Box>

            {data?.data.length === 0 ? (
                <Typography sx={{ fontSize: "0.85rem", color: "#9E9E9E", paddingLeft: "4px" }}>
                    ไม่มีประวัติการตั้งค่า
                </Typography>
            ) : (
                data?.data.map((entry: any, index: any) => {
                    const isLast = index === data?.data.length - 1;
                    return (
                        <Box key={entry.actionName} sx={{ display: "flex" }}>
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
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        backgroundColor: "#1565C0",
                                        marginTop: "4px",
                                        flexShrink: 0,
                                    }}
                                />
                                {!isLast && (
                                    <Box
                                        sx={{
                                            width: "2px",
                                            flexGrow: 1,
                                            backgroundColor: "#BBDEFB",
                                            minHeight: "36px",
                                        }}
                                    />
                                )}
                            </Box>

                            {/* content */}
                            <Box sx={{ paddingLeft: "12px", paddingBottom: isLast ? 0 : "16px" }}>
                                <Typography sx={{ fontWeight: 700, color: "#212121", fontSize: "0.9rem" }}>
                                    {entry.actionName}
                                </Typography>
                                <Typography sx={{ fontSize: "0.8rem", color: "#9E9E9E" }}>
                                    {dayjs(entry.createdDate).format("DD/MM/YYYY HH:mm")} · ผู้ทำรายการ:{" "}
                                    {entry.createdByUser}{" "}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })
            )}
        </Box>
    );
};

export default HistorySettingByHospitalId;
