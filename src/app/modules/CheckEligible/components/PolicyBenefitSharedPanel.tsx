import React from "react";
import { Box, Divider, Grid, Typography } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SchoolIcon from "@mui/icons-material/School";
import HotelIcon from "@mui/icons-material/Hotel";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import CustomBox from "../../_common/components/CustomComponent/CustomBox";
import LinearLoading from "../../_common/components/CustomComponent/LinearLoading";
import { useGetPolicyBenefitShered } from "../../../api/coreClaimApi";
import { GetPolicyBenefitSheredDtoResponse } from "../../../api/coreClaimApi.client";

type Props = {
    applicationId?: string;
    customerTypeCode?: string;
};

const BENEFIT_ICON_RULES: { keyword: string; Icon: SvgIconComponent }[] = [
    { keyword: "อาหาร", Icon: RestaurantIcon },
    { keyword: "รักษาพยาบาล", Icon: LocalHospitalIcon },
    { keyword: "อัคคีภัย", Icon: HomeWorkIcon },
    { keyword: "เคลื่อนย้าย", Icon: LocalShippingIcon },
    { keyword: "สาธารณะ", Icon: ApartmentIcon },
    { keyword: "สถานศึกษา", Icon: SchoolIcon },
    { keyword: "ผู้ป่วยใน", Icon: HotelIcon },
    { keyword: "ICU", Icon: MedicalServicesIcon },
    { keyword: "อุบัติเหตุ", Icon: LocationOnIcon },
    { keyword: "เดินทาง", Icon: DirectionsCarIcon },
    { keyword: "ธรรมชาติ", Icon: ThunderstormIcon },
    { keyword: "โรค", Icon: MedicalServicesIcon },
];

const getBenefitIcon = (text: string): SvgIconComponent => {
    const rule = BENEFIT_ICON_RULES.find(({ keyword }) => text.includes(keyword));
    return rule?.Icon ?? VerifiedUserIcon;
};

const PolicyBenefitSharedPanel: React.FC<Props> = ({ applicationId, customerTypeCode }) => {
    const { data, isLoading } = useGetPolicyBenefitShered(applicationId, customerTypeCode);

    const items: GetPolicyBenefitSheredDtoResponse[] = data?.data ?? [];

    if (!isLoading && items.length === 0) return null;

    return (
        <LinearLoading isLoading={isLoading} sx={{ mt: "1.5rem" }}>
            <CustomBox sx={{ mt: 2 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.25}>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ width: 35, height: 35, borderRadius: "50%", bgcolor: "#eaf5ff", flexShrink: 0 }}
                        >
                            <VerifiedUserIcon sx={{ color: "#1a5da8", fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="body1" fontWeight={700} color="#1a5da8">
                                สิทธิประโยชน์ร่วม
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ความคุ้มครองเพิ่มเติมสำหรับผู้เอาประกันรายนี้
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap", mt: 0.5 }}>
                        {items.length} รายการ
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    {items.map((item, index) => {
                        const Icon = getBenefitIcon(item.benefitName || item.shortBenefit || "");
                        return (
                            <Grid item xs={12} sm={6} key={item.benefitId ?? index}>
                                <Box
                                    sx={{
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 2,
                                        p: 1.75,
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                    }}
                                >
                                    <Box display="flex" alignItems="flex-start" gap={1}>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: "50%",
                                                bgcolor: "#eaf5ff",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon sx={{ color: "#1a5da8", fontSize: 16 }} />
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} color="#1c2b3a">
                                            {item.benefitName || item.shortBenefit || "-"}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            bgcolor: "#eaf5ff",
                                            color: "#1a5da8",
                                            borderRadius: 1.5,
                                            px: 1.25,
                                            py: 0.75,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            ml: { sm: "36px" },
                                        }}
                                    >
                                        {item.fullBenefitDisplay || "-"}
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </CustomBox>
        </LinearLoading>
    );
};

export default PolicyBenefitSharedPanel;

