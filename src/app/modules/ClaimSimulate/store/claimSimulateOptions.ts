import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessibilityNewOutlinedIcon from "@mui/icons-material/AccessibilityNewOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

export const REASON_OPTIONS = [
    { value: "", label: "----------" },
    { value: "1", label: "ไม่คุ้มครอง" },
    { value: "2", label: "เกินวงเงิน" },
    { value: "3", label: "ไม่ตรงเงื่อนไข" },
    { value: "4", label: "รอเอกสารเพิ่มเติม" },
];

export interface TreatmentTypeOption {
    CaseTypeId: number;
    CaseTypeName: string;
}

export const TREATMENT_TYPE_OPTIONS: TreatmentTypeOption[] = [
    { CaseTypeId: 2, CaseTypeName: "IPD" },
    { CaseTypeId: 3, CaseTypeName: "OPD" },
    { CaseTypeId: 4, CaseTypeName: "DAY_Surgery" },
    { CaseTypeId: 5, CaseTypeName: "DeathCase" },
    { CaseTypeId: 6, CaseTypeName: "Disability" },
];

export const CONTINUOUS_CLAIM_OPTIONS = [
    { value: "CL2024001", label: "CL2024001 - 01/03/2567" },
    { value: "CL2024002", label: "CL2024002 - 15/03/2567" },
];

export const NOT_COVERED_REASON_OPTIONS = [
    { value: "1", label: "เกินสิทธิ์" },
    { value: "2", label: "ไม่อยู่ในความคุ้มครอง" },
    { value: "3", label: "โรคเดิม" },
    { value: "4", label: "อื่นๆ" },
];

// ── ตัวเลือกค้นหาผู้เอาประกัน ──
export const INSURED_SEARCH_TYPE_OPTIONS = [
    { value: "nationalId", label: "เลขบัตรประชาชน" },
    { value: "appId", label: "Application ID" },
    { value: "name", label: "ชื่อ-นามสกุล" },
];

// ── เหตุของการเคลม ──
export const CLAIM_CAUSE_OPTIONS = [
    {
        value: 2,
        label: "เจ็บป่วย",
        description: "กรณีเข้ารักษาจากโรคหรืออาการเจ็บป่วยทั่วไป",
        icon: HealthAndSafetyOutlinedIcon,
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
    { value: 2, label: "ค่ารักษา (Medical)", icon: DescriptionOutlinedIcon },
    { value: 3, label: "ค่าชดเชย (Compensate)", icon: AttachMoneyIcon },
    { value: 4, label: "ทุพพลภาพ (Disability)", icon: AccessibilityNewOutlinedIcon },
    { value: 5, label: "เสียชีวิต (DeathCase)", icon: WarningAmberOutlinedIcon },
] as const;

// ── ประเภทการรักษา (MedicalTypeId จริงจาก DB) ───────────────────────────────
// อ้างอิงไว้เผื่อใช้แทน/เทียบกับ MedicalTypeDropDown ที่ดึงจาก master API อยู่แล้ว
export const MEDICAL_TYPE_OPTIONS = [
    { value: 1, label: "OPD" },
    { value: 2, label: "IPD" },
    { value: 3, label: "OR" },
    { value: 4, label: "Amb" },
    { value: 5, label: "HM" },
    { value: 6, label: "Day Case Surgery" },
] as const;
