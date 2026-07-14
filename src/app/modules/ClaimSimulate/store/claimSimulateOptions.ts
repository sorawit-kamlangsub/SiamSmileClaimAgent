import AccessibleIcon from "@mui/icons-material/Accessible";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PaidOutlinedIcon from "@mui/icons-material/Paid";
import HealingIcon from "@mui/icons-material/Healing";

export const REASON_OPTIONS = [
    { value: "", label: "----------" },
    { value: "1", label: "ไม่คุ้มครอง" },
    { value: "2", label: "เกินวงเงิน" },
    { value: "3", label: "ไม่ตรงเงื่อนไข" },
    { value: "4", label: "รอเอกสารเพิ่มเติม" },
];



export const CONTINUOUS_CLAIM_OPTIONS = [
    { value: "CL2024001", label: "CL2024001 - 01/03/2567" },
    { value: "CL2024002", label: "CL2024002 - 15/03/2567" },
];

export const NOT_COVERED_REASON_OPTIONS = [
    { nonCoveredReasonId: "1", nonCoveredReasonName: "เกินสิทธิ์" },
    { nonCoveredReasonId: "2", nonCoveredReasonName: "ไม่อยู่ในความคุ้มครอง" },
    { nonCoveredReasonId: "3", nonCoveredReasonName: "โรคเดิม" },
    { nonCoveredReasonId: "4", nonCoveredReasonName: "อื่นๆ" },
];

// ── เหตุของการเคลม ──
export const CLAIM_CAUSE_OPTIONS = [
    {
        value: 2,
        label: "เจ็บป่วย",
        description: "กรณีเข้ารักษาจากโรคหรืออาการเจ็บป่วยทั่วไป",
        icon: HealingIcon,
    },
    {
        value: 3,
        label: "อุบัติเหตุ",
        description: "กรณีบาดเจ็บจากเหตุการณ์ที่เกิดขึ้นฉับพลันจากปัจจัยภายนอก",
        icon: PersonOutlineOutlinedIcon,
    },
] as const;

// ── ประเภทความคุ้มครอง ──
export const COVERAGE_TYPE_OPTIONS = [
    { value: 2, label: "ค่ารักษา", icon: MedicalServicesIcon },
    { value: 3, label: "ค่าชดเชย(ใหญ่)", icon: PaidOutlinedIcon },
    { value: 4, label: "ทุพพลภาพ/สูญเสียอวัยวะ", icon: AccessibleIcon },
    { value: 5, label: "เสียชีวิต", icon: SentimentVeryDissatisfiedIcon },
] as const;

// ── ประเภทการรักษา  ───────────────────────────────
export const MEDICAL_TYPE_OPTIONS = [
    { value: 1, label: "OPD" },
    { value: 2, label: "IPD" },
    { value: 3, label: "OR" },
    { value: 4, label: "Amb" },
    { value: 5, label: "HM" },
    { value: 6, label: "Day Case Surgery" },
] as const;

// ── สาเหตุของการเกิดเหตุ  ──────────────────────
export const CAUSE_OF_INCIDENT_OPTIONS = [
    { value: 2, label: "โรคทั่วไป" },
    { value: 3, label: "อุบัติเหตุทั่วไป" },
    { value: 4, label: "ขับขี่/โดยสารจักรยานยนต์" },
    { value: 5, label: "ฆาตกรรม" },
    { value: 7, label: "ภัยสาธารณะ" },
    { value: 8, label: "รับผิดสถานศึกษา" },
] as const;

// ── ประเภทรายการค่าใช้จ่าย (FormatType) ──────────────────────
export const FORMAT_TYPE_OPTIONS = [
    { value: 2, label: "SSS" },
    { value: 3, label: "Disability" },
    { value: 4, label: "Death" },
    { value: 5, label: "SIM B1" },
    { value: 6, label: "SIM B2" },
] as const;
