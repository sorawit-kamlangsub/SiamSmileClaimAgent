import React, { useMemo } from "react";
import { Box, Avatar, Typography, Chip, useTheme, useMediaQuery, useScrollTrigger } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedIcon from "@mui/icons-material/Verified";
import SchoolIcon from "@mui/icons-material/School";
import { GetCustomerDetailByIdDtoResponse } from "../../../../api/coreClaimApi.client";

interface Props {
    data?: GetCustomerDetailByIdDtoResponse;
}

const chipSx = {
    bgcolor: "#fff",
    border: "1px solid #90caf9",
    color: "#1976d2",
    fontWeight: 500,
};

// ความสูง Toolbar dense ของ MUI = 48px ตอน desktop
const TOOLBAR_DENSE_HEIGHT = 48;
const BREADCRUMB_HEIGHT = 49; // toolbar dense + divider 1px

const ClaimStickyHeader: React.FC<Props> = ({ data }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // trigger เดียวกับที่ TitleAppBar ใช้ซ่อน breadcrumb (useScrollTrigger ค่า default)
    const breadcrumbHidden = useScrollTrigger();

    const appBarHeight = breadcrumbHidden ? TOOLBAR_DENSE_HEIGHT : TOOLBAR_DENSE_HEIGHT + BREADCRUMB_HEIGHT;

    const fullName = useMemo(() => {
        if (!data) return "-";
        const parts = [data.titleName, data.firstName, data.lastName].filter(Boolean);
        return parts.length ? parts.join(" ") : "-";
    }, [data]);

    return (
        <Box
            sx={{
                borderRadius: 3,
                p: 2,
                mb: 2,
                bgcolor: "#eaf2fe",
                border: "1px solid",
                borderColor: "primary.light",
                boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
                position: "sticky",
                top: appBarHeight,
                transition: "top 0.2s ease",
                zIndex: (t) => t.zIndex.appBar - 1,
            }}
        >
            <Avatar
                sx={{
                    bgcolor: "#1a5da8",
                    width: { xs: 36, sm: 48 },
                    height: { xs: 36, sm: 48 },
                    flexShrink: 0,
                }}
            >
                <PersonIcon fontSize={isMobile ? "medium" : "large"} />
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                    <VerifiedIcon sx={{ fontSize: 16, color: "#9e9e9e", flexShrink: 0 }} />
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                        ผู้เอาประกันที่กำลังดำเนินการ
                    </Typography>
                </Box>

                <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 0.5, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    noWrap
                >
                    {fullName}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", rowGap: 1 }}>
                    <Chip
                        label={
                            <>
                                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                                    ผลิตภัณฑ์{" "}
                                </Box>
                                {data?.productTypeName ?? "-"}
                            </>
                        }
                        size="small"
                        sx={chipSx}
                    />
                    <Chip
                        label={
                            <span>
                                เลขบัตรประชาชน{" "}
                                <Box component="span" sx={{ color: "text.secondary", fontWeight: 400 }}>
                                    {data?.cardTypeId === 2 ? data?.cardDetail : "-"}
                                </Box>
                            </span>
                        }
                        size="small"
                        sx={chipSx}
                    />
                    <Chip
                        label={
                            <span>
                                AppID{" "}
                                <Box component="span" sx={{ color: "text.secondary", fontWeight: 400 }}>
                                    {data?.policyCode ?? "-"}
                                </Box>
                            </span>
                        }
                        size="small"
                        sx={chipSx}
                    />
                    {data?.schoolName && (
                        <Chip
                            icon={<SchoolIcon sx={{ fontSize: 18, color: "#424242 !important" }} />}
                            label={data.schoolName}
                            size="small"
                            sx={{ bgcolor: "#fff", border: "1px solid #90caf9", color: "#212121", fontWeight: 500 }}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ClaimStickyHeader;
