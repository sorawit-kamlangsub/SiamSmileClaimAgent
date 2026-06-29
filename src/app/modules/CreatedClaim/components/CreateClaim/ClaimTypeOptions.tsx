import HealingIcon from "@mui/icons-material/Healing";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AccessibleIcon from "@mui/icons-material/Accessible";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import PaymentsIcon from "@mui/icons-material/Payments";

const iconSx = { fontSize: 28, color: "#02579B" };

export const INCIDENT_DESCRIPTION_MAP: Record<number, string> = {
    2: "กรณีเข้ารักษาจากโรคหรืออาการเจ็บป่วยทั่วไป",
    3: "กรณีบาดเจ็บจากเหตุการณ์ที่เกิดขึ้นอย่างกะทันหันจากปัจจัยภายนอก",
};
export const INCIDENT_ICON_MAP: Record<number, React.ReactElement> = {
    2: <HealingIcon sx={iconSx} />,
    3: <DirectionsRunIcon sx={iconSx} />,
};

export const COVERAGE_ICON_MAP: Record<number, React.ReactElement> = {
    2: <MedicalServicesIcon sx={iconSx} />,
    3: <PaymentsIcon sx={iconSx} />,
    4: <AccessibleIcon sx={iconSx} />,
    5: <LocalFloristIcon sx={iconSx} />,
};
