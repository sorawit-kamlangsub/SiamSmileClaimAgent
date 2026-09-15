import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import VaccinesOutlinedIcon from "@mui/icons-material/VaccinesOutlined";
import HealingOutlinedIcon from "@mui/icons-material/HealingOutlined";
import DirectionsBikeOutlinedIcon from "@mui/icons-material/DirectionsBikeOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SentimentVeryDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentVeryDissatisfiedOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AccessibleIcon from "@mui/icons-material/Accessible";
import { Box } from "@mui/material";
import React from "react";

export const BenefitIcon: React.FC<{ benefitId?: number }> = ({ benefitId }) => {
    const iconMap: Record<number, React.ReactNode> = {
        // IPD
        2: <HotelOutlinedIcon />,
        3: <BedOutlinedIcon />,
        5: <LocalHospitalOutlinedIcon />,
        6: <MedicalServicesOutlinedIcon />,
        7: <VaccinesOutlinedIcon />,

        // OPD
        8: <HealingOutlinedIcon />,
        9: <LocalHospitalOutlinedIcon />,

        // PA
        11: <SentimentVeryDissatisfiedOutlinedIcon />,
        12: <DirectionsBikeOutlinedIcon />,
        13: <GavelOutlinedIcon />,
        14: <SentimentVeryDissatisfiedOutlinedIcon />,

        // เงินชดเชย
        16: <PaymentsOutlinedIcon />,
        17: <AttachMoneyOutlinedIcon />,
        18: <AttachMoneyOutlinedIcon />,

        // สูญเสียอวัยวะ
        22: <AccessibleIcon />,
        23: <DirectionsBikeOutlinedIcon />,

        // อื่น ๆ
        24: <CategoryOutlinedIcon />,
    };

    return (
        <Box
            sx={{
                bgcolor: "#e9f2ff",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 60,
                height: 60,
                flexShrink: 0,
            }}
        >
            {React.cloneElement((iconMap[benefitId ?? 0] as React.ReactElement) ?? <ShieldOutlinedIcon />, {
                sx: {
                    fontSize: 34,
                    color: "#1a5da8",
                },
            })}
        </Box>
    );
};
