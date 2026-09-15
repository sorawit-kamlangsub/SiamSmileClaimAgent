import React from "react";
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Link, Skeleton, Typography } from "@mui/material";
import { formatDateString } from "../../../../functionHelpers";
import { useMonitorTable } from "../../hooks/Monitor/useMonitorTable";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

const MonitorCard: React.FC = () => {
    const { data, isLoading, selectedRowIndex, handleSelect, search } = useMonitorTable();

    if (isLoading && !!search.searchDetail) {
        return (
            <Grid container spacing={2} mt={1}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        <Skeleton variant="rounded" height={200} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    const rows = data?.data || [];

    if (rows.length === 0) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mt={4}
                py={6}
                sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    backgroundColor: "#FAFBFC",
                }}
            >
                <InboxOutlinedIcon sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
                <Typography color="text.secondary" fontWeight={500}>
                    ไม่พบข้อมูล
                </Typography>
            </Box>
        );
    }

    return (
        <LinearLoading isLoading={isLoading && !!search.searchDetail}>
            <Grid container spacing={2} mt={1}>
                {rows.map((row: any, index: number) => {
                    const isSelected = index === selectedRowIndex;
                    return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                variant="outlined"
                                sx={{
                                    borderColor: isSelected ? "primary.main" : "divider",
                                    backgroundColor: isSelected ? "#EEF9FF" : "background.paper",
                                    borderRadius: 2,
                                    transition: "all 0.2s",
                                }}
                            >
                                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                    {/* Row 1: Chip + ปุ่มเลือก */}
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Chip
                                            label={row.productTypeName}
                                            size="small"
                                            sx={{
                                                backgroundColor: "#E3F0FB",
                                                color: "#02579B",
                                                fontWeight: 600,
                                                borderRadius: 1,
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            onClick={() => handleSelect(index)}
                                        >
                                            เลือก
                                        </Button>
                                    </Box>

                                    {/* Row 2: ชื่อผู้เอาประกัน */}
                                    <Typography variant="h6" fontWeight={700} lineHeight={1.3} mb={0.5}>
                                        {row.customerName}
                                    </Typography>

                                    {/* Row 3: AppID */}
                                    <Link
                                        href={`/checkeligible/detail/${btoa(row.id.toString())}`}
                                        target="_blank"
                                        underline="hover"
                                        color="primary"
                                        fontWeight={500}
                                        fontSize={14}
                                    >
                                        AppID: {row.policyCode}
                                    </Link>

                                    <Divider sx={{ my: 1.5 }} />

                                    {/* Rows: แผน / วันที่ */}
                                    <Box display="flex" flexDirection="column" gap={0.75}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">
                                                แผน
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {row.productName}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">
                                                เริ่มคุ้มครอง
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {formatDateString(row.coverageFrom?.toString(), "DD/MM/BBBB")}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">
                                                สิ้นสุด
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {row.coverageTo
                                                    ? formatDateString(row.coverageTo?.toString(), "DD/MM/BBBB")
                                                    : "-"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </LinearLoading>
    );
};

export default MonitorCard;
