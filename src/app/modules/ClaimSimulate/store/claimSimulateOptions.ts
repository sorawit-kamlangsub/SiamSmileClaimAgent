import AccessibleIcon from "@mui/icons-material/Accessible";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PaidOutlinedIcon from "@mui/icons-material/Paid";
import HealingIcon from "@mui/icons-material/Healing";
import { SvgIconComponent } from "@mui/icons-material";

export const NOT_COVERED_REASON_OPTIONS = [
    { nonCoveredReasonId: "1", nonCoveredReasonName: "เกินสิทธิ์" },
    { nonCoveredReasonId: "2", nonCoveredReasonName: "ไม่อยู่ในความคุ้มครอง" },
    { nonCoveredReasonId: "3", nonCoveredReasonName: "โรคเดิม" },
    { nonCoveredReasonId: "4", nonCoveredReasonName: "อื่นๆ" },
];

export const CLAIM_CAUSE_OPTIONS = [
    { value: 2, label: "เจ็บป่วย", description: "กรณีเข้ารักษาจากโรคหรืออาการเจ็บป่วยทั่วไป", icon: HealingIcon },
    {
        value: 3,
        label: "อุบัติเหตุ",
        description: "กรณีบาดเจ็บจากเหตุการณ์ที่เกิดขึ้นฉับพลันจากปัจจัยภายนอก",
        icon: PersonOutlineOutlinedIcon,
    },
] as const;

export const COVERAGE_TYPE_ICON_MAP: Record<number, SvgIconComponent> = {
    2: MedicalServicesIcon,
    3: PaidOutlinedIcon,
    4: AccessibleIcon,
    5: SentimentVeryDissatisfiedIcon,
};

export const FORMAT_TYPE_OPTIONS = [
    { value: 2, label: "SSS" },
    { value: 3, label: "Disability" },
    { value: 4, label: "Death" },
    { value: 5, label: "SIM B1" },
    { value: 6, label: "SIM B2" },
] as const;
