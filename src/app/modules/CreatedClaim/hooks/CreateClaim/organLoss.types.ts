// ── ประเภทและข้อมูลอ้างอิงสำหรับ "เลือกอวัยวะที่สูญเสีย" (ทุพพลภาพ/สูญเสียอวัยวะ) ──

export type OrganSide = "ซ้าย" | "ขวา" | "ทั้งสองข้าง";

export type OrganIconKey = "hand" | "foot" | "eye" | "ear" | "finger" | "walk" | "wheelchair" | "payment";

export interface OrganChoice {
    key: string;
    label: string;
    description: string;
    icons: OrganIconKey[];
    hasSide: boolean;
    isFinger: boolean;
    isCombo: boolean;
}

export const ORGAN_CHOICES: OrganChoice[] = [
    {
        key: "hand",
        label: "มือ",
        description: "แขน/มือ ตั้งแต่ข้อมือขึ้นไป",
        icons: ["hand"],
        hasSide: true,
        isFinger: false,
        isCombo: false,
    },
    {
        key: "foot",
        label: "เท้า",
        description: "ขา/เท้า ตั้งแต่ข้อเท้าขึ้นไป",
        icons: ["foot"],
        hasSide: true,
        isFinger: false,
        isCombo: false,
    },
    {
        key: "eye",
        label: "ตา",
        description: "การสูญเสียการมองเห็น",
        icons: ["eye"],
        hasSide: true,
        isFinger: false,
        isCombo: false,
    },
    {
        key: "ear",
        label: "หู",
        description: "การสูญเสียการได้ยินหรือใบหู",
        icons: ["ear"],
        hasSide: true,
        isFinger: false,
        isCombo: false,
    },
    {
        key: "finger",
        label: "นิ้วมือ",
        description: "ระบุนิ้วและจำนวนข้อ",
        icons: ["finger"],
        hasSide: false,
        isFinger: true,
        isCombo: false,
    },
    {
        key: "toe",
        label: "นิ้วเท้า",
        description: "ระบุนิ้วและจำนวนข้อ",
        icons: ["foot"],
        hasSide: false,
        isFinger: true,
        isCombo: false,
    },
    {
        key: "hand_foot",
        label: "มือ + เท้า",
        description: "มือหนึ่งข้างและเท้าหนึ่งข้าง",
        icons: ["hand", "foot"],
        hasSide: true,
        isFinger: false,
        isCombo: true,
    },
    {
        key: "hand_eye",
        label: "มือ + ตา",
        description: "มือหนึ่งข้างและสายตาหนึ่งข้าง",
        icons: ["hand", "eye"],
        hasSide: true,
        isFinger: false,
        isCombo: true,
    },
    {
        key: "foot_eye",
        label: "เท้า + ตา",
        description: "เท้าหนึ่งข้างและสายตาหนึ่งข้าง",
        icons: ["foot", "eye"],
        hasSide: true,
        isFinger: false,
        isCombo: true,
    },
    {
        key: "partial_disability",
        label: "ทุพพลบางส่วน",
        description: "สูญเสียสมรรถภาพบางส่วน",
        icons: ["walk"],
        hasSide: false,
        isFinger: false,
        isCombo: false,
    },
    {
        key: "permanent_disability",
        label: "ทุพพลภาพถาวร",
        description: "ทุพพลภาพถาวรโดยสิ้นเชิง",
        icons: ["wheelchair"],
        hasSide: false,
        isFinger: false,
        isCombo: false,
    },
    {
        key: "exgratia",
        label: "Exgratia",
        description: "พิจารณาจ่ายตามดุลยพินิจ",
        icons: ["payment"],
        hasSide: false,
        isFinger: false,
        isCombo: false,
    },
];

export const getOrganChoice = (key: string): OrganChoice | undefined => ORGAN_CHOICES.find((c) => c.key === key);

export interface OrganComboPart {
    key: string;
    label: string;
    icon: OrganIconKey;
}

export const ORGAN_COMBO_PARTS: Record<string, OrganComboPart[]> = {
    hand_foot: [
        { key: "hand", label: "มือ", icon: "hand" },
        { key: "foot", label: "เท้า", icon: "foot" },
    ],
    hand_eye: [
        { key: "hand", label: "มือ", icon: "hand" },
        { key: "eye", label: "ตา", icon: "eye" },
    ],
    foot_eye: [
        { key: "foot", label: "เท้า", icon: "foot" },
        { key: "eye", label: "ตา", icon: "eye" },
    ],
};

export const isComboOrganKey = (key: string): boolean => Object.prototype.hasOwnProperty.call(ORGAN_COMBO_PARTS, key);

export const FINGER_KEYS = ["thumb", "index", "middle", "ring", "little"] as const;
export type FingerKey = (typeof FINGER_KEYS)[number];

export const FINGER_LABELS: Record<string, Record<FingerKey, string>> = {
    finger: { thumb: "นิ้วหัวแม่มือ", index: "นิ้วชี้", middle: "นิ้วกลาง", ring: "นิ้วนาง", little: "นิ้วก้อย" },
    toe: { thumb: "นิ้วหัวแม่เท้า", index: "นิ้วชี้", middle: "นิ้วกลาง", ring: "นิ้วนาง", little: "นิ้วก้อย" },
};

export const FINGER_DEFAULT_JOINTS: Record<string, Record<FingerKey, number>> = {
    finger: { thumb: 1, index: 1, middle: 2, ring: 1, little: 1 },
    toe: { thumb: 1, index: 1, middle: 2, ring: 1, little: 1 },
};

export const FINGER_MAX_JOINTS: Record<string, Record<FingerKey, number>> = {
    finger: { thumb: 2, index: 3, middle: 3, ring: 3, little: 3 },
    toe: { thumb: 2, index: 3, middle: 3, ring: 3, little: 3 },
};

export const FINGER_KEY_TO_SUB_PART_ID: Record<string, Record<FingerKey, number>> = {
    finger: { thumb: 1, index: 2, middle: 3, ring: 4, little: 5 },
    toe: { thumb: 6, index: 7, middle: 8, ring: 9, little: 10 },
};

export const FINGER_SIDE_ID: Record<"left" | "right", number> = {
    left: 2,
    right: 3,
};

export interface FingerBodyPartOption {
    bodyPartId: number;
    disabilityLossSubPartId: number;
    disabilitySideId: number;
    lossJointCount: number;
    standardMedicalExpenseId: number;
}
export interface FingerJointState {
    selected: boolean;
    joints: number;
    amount: string;
    bodyPartId?: number;
    standardMedicalExpenseId?: number;
}
export type FingerSideState = Record<FingerKey, FingerJointState>;
export interface OrganFingerState {
    left: FingerSideState;
    right: FingerSideState;
}

export const createFingerState = (organKey: string, existing?: Partial<OrganFingerState>): OrganFingerState => {
    const build = (side: "left" | "right"): FingerSideState =>
        FINGER_KEYS.reduce((acc, fingerKey) => {
            const old = existing?.[side]?.[fingerKey];
            acc[fingerKey] = {
                selected: !!old?.selected,
                joints: Number(old?.joints || FINGER_DEFAULT_JOINTS[organKey]?.[fingerKey] || 1),
                amount: old?.amount || "",
            };
            return acc;
        }, {} as FingerSideState);
    return { left: build("left"), right: build("right") };
};

export const countSelectedFingers = (fingers: OrganFingerState | null, side: "left" | "right"): number =>
    fingers ? FINGER_KEYS.filter((k) => fingers[side][k]?.selected).length : 0;

export const amountNumber = (value: string | number | undefined): number =>
    Number(String(value ?? "").replace(/,/g, "")) || 0;

export const formatNoDecimal = (value: number | string | undefined): string =>
    Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

export const calculateFingerSideTotal = (fingers: OrganFingerState | null, side: "left" | "right"): number =>
    fingers
        ? FINGER_KEYS.reduce(
              (sum, k) => (fingers[side][k]?.selected ? sum + amountNumber(fingers[side][k].amount) : sum),
              0
          )
        : 0;

export const UNCOVERED_REASON_OPTIONS = [
    "สาเหตุไม่คุ้มครอง",
    "ไม่เข้าเงื่อนไขความคุ้มครอง",
    "เกินวงเงิน",
    "เอกสารไม่ครบ",
];
export const EXGRATIA_DEDUCT_SOURCE_OPTIONS = [
    "แต้มผู้แทน",
    "เงินผู้แทน",
    "แต้มสาขา",
    "เงินสาขา",
    "ส่วนกลาง",
    "บริษัทคู่ค้า",
];

export interface OrganRuleResult {
    description: string;
    percent: number;
    coveredAmount: number;
    sumUsedAmount: number;
}

export interface BodyPartOption {
    bodyPartId: number;
    bodyPartName: string;
    disabilitySideId: number;
    disabilitySideName: string;
    standardMedicalExpenseId: number;
}

export interface ComboBodyPartOption {
    bodyPartId: number;
    disabilitySidePart1Id: number;
    disabilitySidePart1Name: string;
    disabilitySidePart2Id: number;
    disabilitySidePart2Name: string;
    standardMedicalExpenseId: number;
}

export interface SidePickOption {
    id: number;
    name: string;
}

export interface OrganChoiceWithId extends OrganChoice {
    disabilityLossPartId: number;
}

export interface OrganLossItem {
    key: string;
    label: string;
    icons: OrganIconKey[];
    disabilityLossPartId?: number;
    bodyPartId?: number;
    standardMedicalExpenseId?: number;
    side?: string;
    comboSides?: Record<string, OrganSide>;
    amount?: string;
    uncoveredAmount?: string;
    uncoveredReason?: number;
    exgratiaDeductSourceId?: number;
    exgratiaDeductDetail?: string;
    note?: string;
    fingers?: OrganFingerState;
    totalAmount: number;
    summaryText: string;
}
