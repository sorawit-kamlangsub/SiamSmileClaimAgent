import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Button,
    TextField,
    MenuItem,
    Chip,
    Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { ORGAN_ICON_MAP } from "./OrganLossIcons";
import {
    amountNumber,
    calculateFingerSideTotal,
    countSelectedFingers,
    createFingerState,
    FINGER_KEY_TO_SUB_PART_ID,
    FINGER_KEYS,
    FINGER_LABELS,
    FINGER_MAX_JOINTS,
    FINGER_SIDE_ID,
    FingerBodyPartOption,
    FingerKey,
    formatNoDecimal,
    isComboOrganKey,
    ORGAN_COMBO_PARTS,
    OrganChoiceWithId,
    OrganFingerState,
    OrganLossItem,
    OrganRuleResult,
} from "../../hooks/CreateClaim/organLoss.types";
import {
    useSingleBodyPartOptions,
    useComboBodyPartOptions,
    useCalculateDisabilityOptions,
    useFingerBodyPartOptions,
} from "../../hooks/CreateClaim/useOrganLoss";
import { GetNonCoveredReasonDtoResponse } from "../../../../api/coreClaimApi.client";
import { useGetDeductionSource } from "../../../../api/coreClaimMastersApi";

const CARD_BORDER = "#dbe6f3";
const CARD_SOFT_BG = "#eef6ff";
const PRIMARY = "#0b74bd";

export const StepBadge: React.FC<{ n: number }> = ({ n }) => (
    <Box
        sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: PRIMARY,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
        }}
    >
        {n}
    </Box>
);

const OrganIconGroup: React.FC<{ icons: OrganChoiceWithId["icons"]; size?: number }> = ({ icons, size = 22 }) => {
    if (icons.length <= 1) {
        const Icon = ORGAN_ICON_MAP[icons[0]];
        return (
            <Box
                sx={{
                    width: size + 20,
                    height: size + 20,
                    borderRadius: "50%",
                    bgcolor: CARD_SOFT_BG,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1,
                }}
            >
                <Icon sx={{ fontSize: size, color: PRIMARY }} />
            </Box>
        );
    }
    return (
        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={1}>
            {icons.map((iconKey, i) => {
                const Icon = ORGAN_ICON_MAP[iconKey];
                return (
                    <React.Fragment key={iconKey}>
                        {i > 0 && (
                            <Typography fontWeight={800} color={PRIMARY} fontSize={14}>
                                +
                            </Typography>
                        )}
                        <Box
                            sx={{
                                width: size + 20,
                                height: size + 20,
                                borderRadius: "50%",
                                bgcolor: CARD_SOFT_BG,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Icon sx={{ fontSize: size, color: PRIMARY }} />
                        </Box>
                    </React.Fragment>
                );
            })}
        </Box>
    );
};

const RuleResultBox: React.FC<{ rule: OrganRuleResult | null | undefined; compact?: boolean }> = ({
    rule,
    compact,
}) => {
    if (!rule) {
        return (
            <Box
                sx={{
                    border: "1px solid",
                    borderColor: CARD_BORDER,
                    borderRadius: 2,
                    bgcolor: CARD_SOFT_BG,
                    px: 2,
                    py: compact ? 1 : 1.5,
                    mt: 1.5,
                }}
            >
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                    ไม่พบเปอร์เซ็นต์ตามเงื่อนไข
                </Typography>
            </Box>
        );
    }

    const availableAmount = rule.coveredAmount - rule.sumUsedAmount;

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: CARD_BORDER,
                borderRadius: 2,
                bgcolor: CARD_SOFT_BG,
                px: 2,
                py: compact ? 1 : 1.5,
                mt: 1.5,
            }}
        >
            <Typography variant="body2" fontWeight={800} color="#075f99">
                {rule.description}
            </Typography>
            <Typography variant="body2" fontWeight={800} color="#0b65b1" mt={0.5}>
                {rule.percent}% ของจำนวนเงินเอาประกันภัย
            </Typography>
            <Typography variant="body2" fontWeight={800} color="#0b65b1">
                ยอดที่คุ้มครอง : {formatNoDecimal(availableAmount)} บาท
            </Typography>
            {/* {rule.sumUsedAmount > 0 && (
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    (จากยอดคุ้มครองเต็ม {formatNoDecimal(rule.coveredAmount)} บาท ใช้ไปแล้ว{" "}
                    {formatNoDecimal(rule.sumUsedAmount)} บาท)
                </Typography>
            )} */}
        </Box>
    );
};

// ── ปุ่มเลือกข้าง ใช้ทั้งกรณีอวัยวะเดี่ยว และแต่ละฝั่งของ combo ──
const SidePickToggle: React.FC<{
    value: number | undefined;
    onChange: (id: number, name: string) => void;
    options: { id: number; name: string }[];
    loading?: boolean;
    isCombo?: boolean;
}> = ({ value, onChange, options, loading, isCombo }) => {
    if (loading) {
        return (
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                กำลังโหลดตัวเลือก...
            </Typography>
        );
    }
    if (options.length === 0) {
        return (
            <Typography variant="body2" color="text.disabled" fontWeight={600}>
                ไม่มีตัวเลือกข้าง
            </Typography>
        );
    }
    return (
        <Box display="flex" gap={1} flexWrap="wrap" justifyContent={isCombo ? "center" : "flex-start"}>
            {options.map((opt) => (
                <Box
                    key={opt.id}
                    onClick={() => onChange(opt.id, opt.name)}
                    role="button"
                    tabIndex={0}
                    sx={{
                        px: 2,
                        py: 0.75,
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: value === opt.id ? PRIMARY : CARD_BORDER,
                        bgcolor: value === opt.id ? PRIMARY : "#fff",
                        color: value === opt.id ? "#fff" : "text.secondary",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    {opt.name}
                </Box>
            ))}
        </Box>
    );
};

// ── modal internal state ──
interface ModalState {
    key: string;
    editIndex: number;
    choice: OrganChoiceWithId;
    // อวัยวะเดี่ยว
    side: number | undefined; // bodyPartId ที่เลือก
    sideName: string; // disabilitySideName ที่เลือก (เก็บไว้ทำ summary/rule lookup)
    // combo
    comboPart1Id: number | undefined;
    comboPart1Name: string;
    comboPart2Id: number | undefined;
    comboPart2Name: string;
    resolvedComboBodyPartId: number | undefined;
    resolvedSingleBodyPartId: number | undefined;
    // ฟิลด์ร่วม
    amount: string;
    uncoveredAmount: string;
    uncoveredReason: number | undefined;
    exgratiaDeductSourceId: number | undefined;
    exgratiaDeductDetail: string;
    note: string;
    fingers: OrganFingerState | null;
    rule: OrganRuleResult | null;
    fingerRules: Record<string, OrganRuleResult | null>;
    standardMedicalExpenseId: number | undefined;
}

export interface OrganLossSelectorProps {
    value: OrganLossItem[];
    onChange: (items: OrganLossItem[]) => void;
    organChoices: OrganChoiceWithId[];
    isOrganChoicesLoading?: boolean;
    nonCoveredReason?: GetNonCoveredReasonDtoResponse[];
    isNonCoveredReasonLoading?: boolean;
    priorClaimWarning?: string;
    customerId: number | undefined;
    maxTransferAmount?: number;
}

const OrganLossSelector: React.FC<OrganLossSelectorProps> = ({
    value,
    onChange,
    organChoices,
    isOrganChoicesLoading,
    nonCoveredReason,
    isNonCoveredReasonLoading,
    priorClaimWarning,
    customerId,
    maxTransferAmount,
}) => {
    const [modal, setModal] = useState<ModalState | null>(null);
    const [formError, setFormError] = useState("");
    const notCoveredReasons = useMemo(() => {
        const raw = !!nonCoveredReason && nonCoveredReason.length > 0 ? nonCoveredReason : [];
        return raw.map((r) => ({
            value: r.nonCoveredReasonId,
            label: r.nonCoveredReasonName ?? "-",
        }));
    }, [nonCoveredReason]);

    const selectedKeys = useMemo(() => value.map((i) => i.key), [value]);
    const findOrganChoice = (key: string) => organChoices.find((c) => c.key === key);

    const totalAmount = useMemo(() => value.reduce((sum, i) => sum + amountNumber(i.totalAmount), 0), [value]);

    const openModal = (key: string) => {
        const choice = findOrganChoice(key);
        if (!choice) return;
        const editIndex = selectedKeys.indexOf(key);
        const existing = editIndex >= 0 ? value[editIndex] : undefined;
        setFormError("");
        setModal({
            key,
            editIndex,
            choice,
            side: existing?.bodyPartId,
            sideName: "",
            comboPart1Id: undefined,
            comboPart1Name: "",
            comboPart2Id: undefined,
            comboPart2Name: "",
            resolvedComboBodyPartId: existing?.bodyPartId,
            resolvedSingleBodyPartId: undefined,
            amount: existing?.amount || (existing?.totalAmount ? String(existing.totalAmount) : ""),
            uncoveredAmount: existing?.uncoveredAmount || "",
            uncoveredReason: existing?.uncoveredReason,
            exgratiaDeductSourceId: existing?.exgratiaDeductSourceId || undefined,
            exgratiaDeductDetail: existing?.exgratiaDeductDetail || "",
            note: existing?.note || "",
            fingers: choice.isFinger ? createFingerState(key, existing?.fingers) : null,
            rule: null,
            fingerRules: {},
            standardMedicalExpenseId: existing?.standardMedicalExpenseId,
        });
    };

    const closeModal = () => setModal(null);

    const patchModal = (patch: Partial<ModalState>) => setModal((m) => (m ? { ...m, ...patch } : m));

    const setFingerField = (
        side: "left" | "right",
        fingerKey: FingerKey,
        patch: Partial<{ selected: boolean; joints: number; amount: string }>
    ) => {
        setModal((m) => {
            if (!m?.fingers) return m;
            const fingers: OrganFingerState = {
                ...m.fingers,
                [side]: { ...m.fingers[side], [fingerKey]: { ...m.fingers[side][fingerKey], ...patch } },
            };
            return { ...m, fingers };
        });
    };
    const setRule = (rule: OrganRuleResult | null) => setModal((m) => (m ? { ...m, rule } : m));
    const setFingerRule = (side: "left" | "right", fingerKey: FingerKey, rule: OrganRuleResult | null) =>
        setModal((m) => (m ? { ...m, fingerRules: { ...m.fingerRules, [`${side}-${fingerKey}`]: rule } } : m));

    useEffect(() => {
        if (!modal || !modal.choice.isFinger) return;

        let totalExcess = 0;
        const sides: ("left" | "right")[] = ["left", "right"];
        for (const side of sides) {
            for (const fingerKey of FINGER_KEYS) {
                const data = modal.fingers![side][fingerKey];
                if (!data.selected) continue;
                const rule = modal.fingerRules[`${side}-${fingerKey}`];
                if (!rule) continue;

                const requestedAmount = amountNumber(data.amount); // ← ยอดที่ user กรอกจริง
                const available = rule.coveredAmount - rule.sumUsedAmount;
                if (requestedAmount > available) {
                    totalExcess += requestedAmount - available;
                }
            }
        }

        if (totalExcess > 0) {
            setModal((m) => (m ? { ...m, uncoveredAmount: String(totalExcess), uncoveredReason: 12 } : m));
        }
    }, [modal?.fingers, modal?.fingerRules]);
    const modalTotal = useMemo(() => {
        if (!modal) return 0;
        const gross = modal.choice.isFinger
            ? calculateFingerSideTotal(modal.fingers, "left") + calculateFingerSideTotal(modal.fingers, "right")
            : amountNumber(modal.amount);
        return gross - amountNumber(modal.uncoveredAmount);
    }, [modal]);

    const handleSave = () => {
        if (!modal) return;

        const isCombo = isComboOrganKey(modal.key);

        if (modal.key === "exgratia" && (!modal.exgratiaDeductSourceId || modal.exgratiaDeductSourceId === 0)) {
            setFormError("กรุณาระบุช่องทางการหัก");
            return;
        }

        if (modal.choice.isFinger) {
            const leftCount = countSelectedFingers(modal.fingers, "left");
            const rightCount = countSelectedFingers(modal.fingers, "right");
            if (leftCount + rightCount === 0) {
                setFormError("กรุณาเลือกนิ้วที่สูญเสียอย่างน้อย 1 รายการ");
                return;
            }
            // ── validate ห้ามเกินวงเงินคุ้มครอง - ยอดที่ใช้ไปแล้ว (เก็บ error ทุกนิ้วที่ผิด ไม่หยุดตัวแรก) ──
            const errors: string[] = [];
            const sides: ("left" | "right")[] = ["left", "right"];
            for (const side of sides) {
                for (const fingerKey of FINGER_KEYS) {
                    const data = modal.fingers![side][fingerKey];
                    if (!data.selected) continue;

                    const rule = modal.fingerRules[`${side}-${fingerKey}`];
                    const sideLabel = side === "left" ? "ซ้าย" : "ขวา";
                    const fingerLabel = FINGER_LABELS[modal.key]?.[fingerKey];

                    if (!rule) {
                        errors.push(`${fingerLabel}ข้าง${sideLabel} ไม่อยู่ในความคุ้มครอง`);
                    }
                }
            }
            if (errors.length > 0) {
                setFormError(errors.join("\n"));
                return;
            }
        } else {
            if (!modal.rule) {
                setFormError("รายการนี้ไม่อยู่ในความคุ้มครอง ไม่สามารถกรอกยอดเบิกได้");
                return;
            }
        }

        // ── ยอดไม่คุ้มครองห้ามเกินยอดเบิก (ไม่งั้นยอดสุทธิติดลบ) ──
        const grossAmount = modal.choice.isFinger
            ? calculateFingerSideTotal(modal.fingers, "left") + calculateFingerSideTotal(modal.fingers, "right")
            : amountNumber(modal.amount);
        const uncovered = amountNumber(modal.uncoveredAmount);
        if (uncovered > grossAmount) {
            setFormError(`ยอดไม่คุ้มครองต้องไม่เกินยอดเบิก (${formatNoDecimal(grossAmount)} บาท)`);
            return;
        }

        if (!isCombo && modal.choice.hasSide && !modal.choice.isFinger && !modal.side) {
            setFormError("กรุณาเลือกข้างที่สูญเสีย");
            return;
        }
        if (isCombo && !modal.resolvedComboBodyPartId) {
            setFormError("กรุณาเลือกข้างให้ครบทั้งสองอวัยวะ");
            return;
        }

        const item: OrganLossItem = {
            key: modal.key,
            label: modal.choice.label,
            icons: modal.choice.icons,
            disabilityLossPartId: modal.choice.disabilityLossPartId,
            uncoveredAmount: modal.uncoveredAmount,
            uncoveredReason: modal.uncoveredReason,
            exgratiaDeductSourceId: modal.exgratiaDeductSourceId,
            exgratiaDeductDetail: modal.exgratiaDeductDetail,
            note: modal.note,
            totalAmount: modalTotal,
            summaryText: "",
        };

        if (modal.choice.isFinger) {
            const leftCount = countSelectedFingers(modal.fingers, "left");
            const rightCount = countSelectedFingers(modal.fingers, "right");
            item.fingers = modal.fingers || undefined;
            item.summaryText = [
                `ข้างซ้าย ${leftCount} นิ้ว`,
                `ข้างขวา ${rightCount} นิ้ว`,
                `${formatNoDecimal(modalTotal)} บาท`,
            ].join(" • ");
        } else if (isCombo) {
            const comboParts = ORGAN_COMBO_PARTS[modal.key] || [];
            item.bodyPartId = modal.resolvedComboBodyPartId;
            item.standardMedicalExpenseId = modal.standardMedicalExpenseId;
            item.amount = modal.amount;
            item.side = `${modal.comboPart1Name} + ${modal.comboPart2Name}`;
            const comboSummary = [
                `${comboParts[0]?.label}: ${modal.comboPart1Name || "-"}`,
                `${comboParts[1]?.label}: ${modal.comboPart2Name || "-"}`,
            ].join(" • ");
            item.summaryText = [comboSummary, `${formatNoDecimal(modalTotal)} บาท`].filter(Boolean).join(" • ");
        } else {
            item.bodyPartId = modal.choice.hasSide ? modal.side : modal.resolvedSingleBodyPartId;
            item.side = modal.choice.hasSide ? modal.sideName : "";
            item.standardMedicalExpenseId = modal.standardMedicalExpenseId;
            item.amount = modal.amount;
            const exgratiaNote =
                modal.key === "exgratia" && modal.exgratiaDeductSourceId
                    ? `หักจาก: ${modal.exgratiaDeductSourceId}`
                    : "";
            item.summaryText = [item.side, exgratiaNote, `${formatNoDecimal(modalTotal)} บาท`]
                .filter(Boolean)
                .join(" • ");
        }

        const next = [...value];
        if (modal.editIndex >= 0) next[modal.editIndex] = item;
        else next.push(item);

        const nextTotal = next.reduce((sum, i) => sum + amountNumber(i.totalAmount), 0);
        if (maxTransferAmount != null && nextTotal > maxTransferAmount) {
            setFormError(`ยอดเบิกรวมทั้งหมดเกินวงเงินสูงสุด (${formatNoDecimal(maxTransferAmount)} บาท)`);
            return;
        }
        onChange(next);
        closeModal();
    };

    const handleDelete = () => {
        if (!modal || modal.editIndex < 0) return;
        const next = value.filter((_, i) => i !== modal.editIndex);
        onChange(next);
        closeModal();
    };

    const removeItem = (index: number) => onChange(value.filter((_, i) => i !== index));

    return (
        <Box>
            {priorClaimWarning && (
                <Alert
                    severity="warning"
                    icon={<WarningAmberOutlinedIcon />}
                    sx={{ mb: 2, borderRadius: 2, alignItems: "center", fontWeight: 700 }}
                >
                    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <span>ผู้เอาประกันรายนี้มีการเบิกสูญเสียอวัยวะแล้ว กรุณาตรวจสอบอีกครั้ง</span>
                        <Chip label={priorClaimWarning} size="small" sx={{ bgcolor: "#fff", fontWeight: 700 }} />
                    </Box>
                </Alert>
            )}

            {/* ── ขั้นตอน 1: เลือกอวัยวะที่สูญเสีย ── */}
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
                <Box display="flex" alignItems="flex-start" gap={1.25}>
                    <Box>
                        <Typography fontWeight={800} fontSize={17} color={PRIMARY}>
                            เลือกอวัยวะที่สูญเสีย{" "}
                            <Typography component="span" fontWeight={700} fontSize={14} color="text.secondary">
                                (เลือกได้มากกว่า 1 รายการ)
                            </Typography>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>
                            คลิกเลือกอวัยวะที่สูญเสีย แล้วกรอกรายละเอียดใน Modal
                        </Typography>
                    </Box>
                </Box>
                <Chip
                    icon={<DoneAllIcon sx={{ fontSize: 18 }} />}
                    label={`เลือกแล้ว ${value.length} รายการ`}
                    sx={{ bgcolor: CARD_SOFT_BG, color: PRIMARY, fontWeight: 800, px: 1 }}
                />
            </Box>

            {isOrganChoicesLoading || isNonCoveredReasonLoading ? (
                <Typography color="text.secondary" fontWeight={600} mb={3}>
                    กำลังโหลดข้อมูลอวัยวะ...
                </Typography>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                        gap: 1.5,
                        mb: 3,
                    }}
                >
                    {organChoices.map((choice) => {
                        const selected = selectedKeys.includes(choice.key);
                        return (
                            <Box
                                key={choice.key}
                                onClick={() => openModal(choice.key)}
                                role="button"
                                tabIndex={0}
                                sx={{
                                    position: "relative",
                                    border: "1px solid",
                                    borderColor: selected ? PRIMARY : CARD_BORDER,
                                    borderRadius: 2,
                                    bgcolor: selected ? CARD_SOFT_BG : "#fff",
                                    textAlign: "center",
                                    p: 2,
                                    cursor: "pointer",
                                    transition: "all .15s ease",
                                    "&:hover": { borderColor: PRIMARY, bgcolor: CARD_SOFT_BG },
                                }}
                            >
                                <OrganIconGroup icons={choice.icons} />
                                <Typography fontWeight={800} fontSize={15}>
                                    {choice.label}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                    display="block"
                                    mt={0.25}
                                >
                                    {choice.description}
                                </Typography>
                                {selected && (
                                    <Chip
                                        size="small"
                                        label="เลือกแล้ว"
                                        sx={{ mt: 1, bgcolor: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 11 }}
                                    />
                                )}
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* ── รายการอวัยวะที่เลือก ── */}
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <SummarizeOutlinedIcon sx={{ color: PRIMARY }} />
                <Typography fontWeight={800} fontSize={17} color="text.secondary">
                    รายการอวัยวะที่เลือก
                </Typography>
            </Box>

            {value.length === 0 ? (
                <Box
                    sx={{
                        border: "1px dashed",
                        borderColor: CARD_BORDER,
                        borderRadius: 2,
                        py: 4,
                        textAlign: "center",
                        color: "text.disabled",
                        fontWeight: 700,
                    }}
                >
                    ยังไม่ได้เลือกอวัยวะ
                </Box>
            ) : (
                <Box display="flex" flexDirection="column" gap={1.25}>
                    {value.map((item, index) => (
                        <Box
                            key={item.key}
                            sx={{
                                border: "1px solid",
                                borderColor: CARD_BORDER,
                                borderRadius: 2,
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1.5,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                    sx={{
                                        width: 100,
                                        height: 40,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: item.icons.length <= 1 ? 40 : "auto",
                                            height: 40,
                                            borderRadius: item.icons.length <= 1 ? "50%" : 0,
                                            bgcolor: item.icons.length <= 1 ? CARD_SOFT_BG : "transparent",
                                        }}
                                    >
                                        <OrganIconGroup icons={item.icons} size={22} />
                                    </Box>
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography fontWeight={800}>{item.label}</Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        {item.summaryText || "-"}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box display="flex" gap={1}>
                                <Button size="small" variant="outlined" onClick={() => openModal(item.key)}>
                                    แก้ไข
                                </Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => removeItem(index)}>
                                    ลบ
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            <Box
                sx={{
                    mt: 2,
                    bgcolor: "#f1f5f9",
                    borderRadius: 2,
                    py: 1.5,
                    textAlign: "center",
                    fontWeight: 800,
                    color: PRIMARY,
                    fontSize: 17,
                }}
            >
                ยอดเบิกรวม :{" "}
                <Box component="span" mx={1}>
                    {formatNoDecimal(totalAmount)}
                </Box>{" "}
                บาท
            </Box>

            {/* ── modal ระบุรายละเอียดการสูญเสีย ── */}
            <Dialog
                open={!!modal}
                onClose={closeModal}
                maxWidth={modal?.choice.isFinger ? "lg" : modal?.choice.isCombo ? "md" : "sm"}
                fullWidth
            >
                {modal && (
                    <>
                        <DialogTitle
                            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
                        >
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                    sx={{
                                        width: "auto",
                                        height: "auto",
                                        borderRadius: 2,
                                        bgcolor: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <OrganIconGroup icons={modal.choice.icons} size={20} />
                                </Box>
                                <Box>
                                    <Typography fontWeight={800}>ระบุรายละเอียดการสูญเสีย</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        กรอกรายละเอียดการสูญเสียแต่ละส่วนที่เลือก — {modal.choice.label}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                {modal.editIndex >= 0 && (
                                    <IconButton color="error" onClick={handleDelete}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                )}
                                <IconButton onClick={closeModal}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>

                        <DialogContent dividers>
                            {modal.choice.isFinger ? (
                                <FingerModalBody
                                    modal={modal}
                                    setFingerField={setFingerField}
                                    customerId={customerId}
                                    onRuleChange={setFingerRule}
                                />
                            ) : (
                                <SimpleModalBody
                                    modal={modal}
                                    patchModal={patchModal}
                                    customerId={customerId}
                                    modalTotal={modalTotal}
                                    onRuleChange={setRule}
                                />
                            )}

                            <Box display="grid" gap={2} gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} mt={3}>
                                <TextField
                                    label="ยอดไม่คุ้มครอง"
                                    size="small"
                                    fullWidth
                                    inputMode="decimal"
                                    value={modal.uncoveredAmount}
                                    onChange={(e) => patchModal({ uncoveredAmount: e.target.value })}
                                />
                                <TextField
                                    select
                                    label="สาเหตุไม่คุ้มครอง"
                                    size="small"
                                    fullWidth
                                    value={modal.uncoveredReason ?? ""}
                                    onChange={(e) => patchModal({ uncoveredReason: Number(e.target.value) })}
                                >
                                    {notCoveredReasons.map((r) => (
                                        <MenuItem key={r.value ?? r.label} value={r.value}>
                                            {r.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            <TextField
                                label="หมายเหตุ"
                                size="small"
                                fullWidth
                                multiline
                                minRows={2}
                                sx={{ mt: 2 }}
                                value={modal.note}
                                onChange={(e) => patchModal({ note: e.target.value })}
                            />

                            <Box
                                sx={{
                                    mt: 3,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 2,
                                    bgcolor: "#f8fafc",
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1.5,
                                }}
                            >
                                <Typography fontWeight={700} color="text.secondary">
                                    ยอดเบิกรวม :
                                </Typography>
                                <Typography fontWeight={800} fontSize={18} color={PRIMARY}>
                                    {formatNoDecimal(modalTotal)}
                                </Typography>
                                <Typography fontWeight={700} color="text.secondary">
                                    บาท
                                </Typography>
                            </Box>

                            {formError && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {formError}
                                </Alert>
                            )}

                            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={3}>
                                <Button variant="outlined" color="inherit" onClick={closeModal}>
                                    ยกเลิก
                                </Button>
                                <Button variant="contained" onClick={handleSave}>
                                    บันทึก
                                </Button>
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

// ── ส่วนย่อยของ modal: อวัยวะเดี่ยว/อวัยวะผสม (ไม่ใช่กลุ่มนิ้ว) ──
const SimpleModalBody: React.FC<{
    modal: ModalState;
    patchModal: (patch: Partial<ModalState>) => void;
    modalTotal: number;
    customerId: number | undefined;
    onRuleChange: (rule: OrganRuleResult | null) => void;
}> = ({ modal, patchModal, customerId, onRuleChange }) => {
    const isCombo = isComboOrganKey(modal.key);
    const comboParts = ORGAN_COMBO_PARTS[modal.key] || [];

    // ── กรณีอวัยวะเดี่ยว: เรียก API ด้วย disabilityLossPartId ของตัวเอง ──
    const {
        options: singleOptions,
        isLoading: singleLoading,
        findByBodyPartId: findSingleByBodyPartId,
    } = useSingleBodyPartOptions(!isCombo ? modal.choice.disabilityLossPartId : undefined);

    // ── กรณี combo: เรียก API ด้วย disabilityLossPartId ของตัว combo เอง ──
    const {
        part1Options,
        part2Options,
        resolveBodyPartId,
        findByBodyPartId: findComboByBodyPartId,
        isLoading: comboLoading,
    } = useComboBodyPartOptions(isCombo ? modal.choice.disabilityLossPartId : undefined);

    const standardMedicalExpenseId = isCombo
        ? findComboByBodyPartId(modal.resolvedComboBodyPartId)?.standardMedicalExpenseId
        : modal.choice.hasSide
        ? findSingleByBodyPartId(modal.side)?.standardMedicalExpenseId
        : singleOptions[0]?.standardMedicalExpenseId;

    const bodyPartIdForCalculate = isCombo
        ? modal.resolvedComboBodyPartId
        : modal.choice.hasSide
        ? modal.side
        : singleOptions[0]?.bodyPartId;

    const { options: disabilityOptions, isLoading: isRuleLoading } = useCalculateDisabilityOptions(
        customerId,
        bodyPartIdForCalculate,
        standardMedicalExpenseId
    );

    const { data: deductionSource } = useGetDeductionSource();
    const deductionSourceOptions = deductionSource?.data ?? [];

    const rule: OrganRuleResult | null = disabilityOptions[0] ?? null;

    useEffect(() => {
        onRuleChange(rule);
    }, [rule]);

    useEffect(() => {
        if (!rule || isCombo === undefined) return;
        const grossAmount = amountNumber(modal.amount);
        const available = rule.coveredAmount - rule.sumUsedAmount;

        if (grossAmount > available) {
            const excess = grossAmount - available;
            patchModal({ uncoveredAmount: String(excess), uncoveredReason: 12 });
        }
    }, [modal.amount, rule]);

    // ── ตอนเปิด modal แก้ไขรายการ combo เดิม: reverse-lookup part1Id/part2Id จาก bodyPartId ที่เก็บไว้ ──
    useEffect(() => {
        if (!isCombo || modal.editIndex < 0 || modal.comboPart1Id !== undefined) return;
        const found = findComboByBodyPartId(modal.resolvedComboBodyPartId);
        if (found) {
            patchModal({
                comboPart1Id: found.disabilitySidePart1Id,
                comboPart1Name: found.disabilitySidePart1Name,
                comboPart2Id: found.disabilitySidePart2Id,
                comboPart2Name: found.disabilitySidePart2Name,
            });
        }
    }, [isCombo, part1Options.length, part2Options.length]);

    // ── ทุกครั้งที่เลือกครบทั้งสองฝั่งของ combo: resolve หา bodyPartId จริง ──
    useEffect(() => {
        if (!isCombo) return;
        const resolved = resolveBodyPartId(modal.comboPart1Id, modal.comboPart2Id);
        patchModal({ resolvedComboBodyPartId: resolved?.bodyPartId });
    }, [isCombo, modal.comboPart1Id, modal.comboPart2Id]);

    useEffect(() => {
        patchModal({ standardMedicalExpenseId });
    }, [standardMedicalExpenseId]);

    useEffect(() => {
        if (!isCombo && !modal.choice.hasSide) {
            patchModal({ resolvedSingleBodyPartId: singleOptions[0]?.bodyPartId });
        }
    }, [isCombo, modal.choice.hasSide, singleOptions[0]?.bodyPartId]);
    return (
        <Box>
            {isCombo && (
                <Box mb={2}>
                    <Typography fontWeight={700} mb={1}>
                        ข้างที่สูญเสียตามอวัยวะ :
                    </Typography>
                    <Box display="grid" gap={1.5} gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}>
                        <Box sx={{ border: "1px solid", borderColor: CARD_BORDER, borderRadius: 2, p: 1.5 }}>
                            <Box gap={1} mb={1}>
                                <OrganIconGroup icons={comboParts[0] ? [comboParts[0].icon] : []} size={16} />
                                <Typography fontWeight={700} sx={{ display: "flex", justifyContent: "center" }}>
                                    {comboParts[0]?.label}
                                </Typography>
                            </Box>
                            <SidePickToggle
                                value={modal.comboPart1Id}
                                options={part1Options}
                                loading={comboLoading}
                                onChange={(id, name) => patchModal({ comboPart1Id: id, comboPart1Name: name })}
                                isCombo
                            />
                        </Box>
                        <Box sx={{ border: "1px solid", borderColor: CARD_BORDER, borderRadius: 2, p: 1.5 }}>
                            <Box gap={1} mb={1}>
                                <OrganIconGroup icons={comboParts[1] ? [comboParts[1].icon] : []} size={16} />
                                <Typography fontWeight={700} sx={{ display: "flex", justifyContent: "center" }}>
                                    {comboParts[1]?.label}
                                </Typography>
                            </Box>
                            <SidePickToggle
                                value={modal.comboPart2Id}
                                options={part2Options}
                                loading={comboLoading}
                                onChange={(id, name) => patchModal({ comboPart2Id: id, comboPart2Name: name })}
                                isCombo
                            />
                        </Box>
                    </Box>
                </Box>
            )}

            {!isCombo && modal.choice.hasSide && (
                <Box mb={2}>
                    <Typography fontWeight={700} mb={1}>
                        ข้างที่สูญเสีย :
                    </Typography>
                    <SidePickToggle
                        value={modal.side}
                        options={singleOptions.map((o) => ({ id: o.bodyPartId, name: o.disabilitySideName }))}
                        loading={singleLoading}
                        onChange={(id, name) => patchModal({ side: id, sideName: name, amount: "" })}
                    />
                </Box>
            )}

            <TextField
                label="ยอดเบิก"
                size="small"
                fullWidth
                inputMode="decimal"
                value={modal.amount}
                onChange={(e) => patchModal({ amount: e.target.value })}
                helperText={
                    rule
                        ? `แนะนำ: ${formatNoDecimal(rule.coveredAmount * (rule.percent / 100))} บาท (${rule.percent}%)`
                        : "กรอกยอดเบิกเอง"
                }
                sx={{ mt: isCombo ? 0 : undefined, mb: 2 }}
            />

            {modal.key === "exgratia" && (
                <Box
                    sx={{
                        mt: 2,
                        border: "1px solid #fde68a",
                        bgcolor: "#fffbeb",
                        borderRadius: 2,
                        p: 2,
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1} mb={1.5} color="#92400e" fontWeight={800}>
                        <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />
                        <Typography fontWeight={800} color="#92400e">
                            รายละเอียดการหัก
                        </Typography>
                    </Box>
                    <Box display="grid" gap={2} gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}>
                        <TextField
                            select
                            label="ช่องทางการหัก *"
                            size="small"
                            fullWidth
                            value={modal.exgratiaDeductSourceId}
                            onChange={(e) => patchModal({ exgratiaDeductSourceId: Number(e.target.value) })}
                        >
                            {deductionSourceOptions.map((opt) => (
                                <MenuItem key={opt.deductionSourceId} value={opt.deductionSourceId}>
                                    {opt.deductionSourceName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="รายละเอียดเพิ่มเติม"
                            size="small"
                            fullWidth
                            placeholder="ระบุรายละเอียดเพิ่มเติม"
                            value={modal.exgratiaDeductDetail}
                            onChange={(e) => patchModal({ exgratiaDeductDetail: e.target.value })}
                        />
                    </Box>
                </Box>
            )}

            {isRuleLoading ? (
                <Box
                    sx={{
                        border: "1px solid",
                        borderColor: CARD_BORDER,
                        borderRadius: 2,
                        bgcolor: CARD_SOFT_BG,
                        px: 2,
                        py: 1.5,
                        mt: 1.5,
                    }}
                >
                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                        กำลังคำนวณเงื่อนไข...
                    </Typography>
                </Box>
            ) : (
                <RuleResultBox rule={rule} />
            )}
        </Box>
    );
};

// ── ส่วนย่อยของ modal: กลุ่มนิ้วมือ/นิ้วเท้า (ซ้าย/ขวา x 5 นิ้ว) ──
const FingerModalBody: React.FC<{
    modal: ModalState;
    setFingerField: (
        side: "left" | "right",
        fingerKey: FingerKey,
        patch: Partial<{ selected: boolean; joints: number; amount: string }>
    ) => void;
    customerId: number | undefined;
    onRuleChange: (side: "left" | "right", fingerKey: FingerKey, rule: OrganRuleResult | null) => void;
}> = ({ modal, setFingerField, customerId, onRuleChange }) => {
    // ── โหลดตาราง bodyPart ของกลุ่มนิ้วนี้ทั้งหมด (ครั้งเดียว ใช้ร่วมกันทุกช่อง) ──
    const { findFingerBodyPart, isLoading: isFingerOptionsLoading } = useFingerBodyPartOptions(
        modal.choice.disabilityLossPartId
    );

    const renderSide = (side: "left" | "right", label: string) => (
        <Box mb={2}>
            <Typography fontWeight={800} mb={1}>
                ข้าง{label} :
            </Typography>
            <Box display="grid" gap={1.5} gridTemplateColumns={{ xs: "1fr 1fr", sm: "repeat(5, 1fr)" }}>
                {FINGER_KEYS.map((fingerKey) => (
                    <FingerCell
                        key={fingerKey}
                        modal={modal}
                        side={side}
                        fingerKey={fingerKey}
                        setFingerField={setFingerField}
                        findFingerBodyPart={findFingerBodyPart}
                        isFingerOptionsLoading={isFingerOptionsLoading}
                        customerId={customerId}
                        onRuleChange={onRuleChange}
                    />
                ))}
            </Box>
        </Box>
    );

    return (
        <Box>
            <Alert severity="info" icon={false} sx={{ mb: 2, bgcolor: CARD_SOFT_BG, color: PRIMARY, fontWeight: 700 }}>
                แสดงเปอร์เซ็นต์ตามจำนวนข้อจาก Master
            </Alert>
            {renderSide("left", "ซ้าย")}
            {renderSide("right", "ขวา")}
        </Box>
    );
};

// ── ช่องนิ้วเดี่ยว 1 ช่อง: ผูก bodyPartId ตาม (นิ้ว, ข้าง, จำนวนข้อ) ที่เปลี่ยนแบบ dynamic แล้วยิง API คำนวณ ──
const FingerCell: React.FC<{
    modal: ModalState;
    side: "left" | "right";
    fingerKey: FingerKey;
    setFingerField: (
        side: "left" | "right",
        fingerKey: FingerKey,
        patch: Partial<{
            selected: boolean;
            joints: number;
            amount: string;
            bodyPartId?: number;
            standardMedicalExpenseId?: number;
        }>
    ) => void;
    findFingerBodyPart: (subPartId: number, sideId: number, jointCount: number) => FingerBodyPartOption | undefined;
    isFingerOptionsLoading: boolean;
    customerId: number | undefined;
    onRuleChange: (side: "left" | "right", fingerKey: FingerKey, rule: OrganRuleResult | null) => void;
}> = ({
    modal,
    side,
    fingerKey,
    setFingerField,
    findFingerBodyPart,
    isFingerOptionsLoading,
    customerId,
    onRuleChange,
}) => {
    const data = modal.fingers![side][fingerKey];
    const label2 = FINGER_LABELS[modal.key]?.[fingerKey];
    const maxJoints = FINGER_MAX_JOINTS[modal.key]?.[fingerKey] || 3;

    const subPartId = FINGER_KEY_TO_SUB_PART_ID[modal.key]?.[fingerKey];
    const sideId = FINGER_SIDE_ID[side];
    const matched = subPartId !== undefined ? findFingerBodyPart(subPartId, sideId, data.joints) : undefined;

    const { options: ruleOptions, isLoading: isRuleLoading } = useCalculateDisabilityOptions(
        customerId,
        data.selected ? matched?.bodyPartId : undefined,
        data.selected ? matched?.standardMedicalExpenseId : undefined
    );
    const rule: OrganRuleResult | null = ruleOptions[0] ?? null;

    useEffect(() => {
        onRuleChange(side, fingerKey, data.selected ? rule : null);
    }, [rule, data.selected]);

    useEffect(() => {
        if (data.selected && matched) {
            setFingerField(side, fingerKey, {
                bodyPartId: matched.bodyPartId,
                standardMedicalExpenseId: matched.standardMedicalExpenseId,
            });
        }
    }, [data.selected, matched?.bodyPartId, matched?.standardMedicalExpenseId]);
    useEffect(() => {
        if (!data.selected) {
            setFingerField(side, fingerKey, { amount: "" });
        }
    }, [data.selected]);
    return (
        <Box sx={{ border: "1px solid", borderColor: CARD_BORDER, borderRadius: 2, p: 1.5 }}>
            <Box
                component="label"
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ cursor: "pointer" }}
                onClick={() => setFingerField(side, fingerKey, { selected: !data.selected })}
            >
                <input type="checkbox" checked={data.selected} readOnly style={{ width: 16, height: 16 }} />
                <Typography fontWeight={700} fontSize={14}>
                    {label2}
                </Typography>
            </Box>

            <Box mt={1.5}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                    จำนวนข้อ
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mt={0.5}>
                    <IconButton
                        size="small"
                        onClick={() => setFingerField(side, fingerKey, { joints: Math.max(1, data.joints - 1) })}
                    >
                        -
                    </IconButton>
                    <Typography fontWeight={800}>{data.joints}</Typography>
                    <IconButton
                        size="small"
                        onClick={() =>
                            setFingerField(side, fingerKey, { joints: Math.min(maxJoints, data.joints + 1) })
                        }
                    >
                        +
                    </IconButton>
                </Box>
            </Box>

            <TextField
                label={`ยอดเบิก${label2}`}
                size="small"
                fullWidth
                inputMode="decimal"
                value={data.amount}
                onChange={(e) => setFingerField(side, fingerKey, { amount: e.target.value })}
                sx={{ mt: 1.5 }}
            />

            {data.selected ? (
                isFingerOptionsLoading || isRuleLoading ? (
                    <Box
                        sx={{
                            border: "1px solid",
                            borderColor: CARD_BORDER,
                            borderRadius: 2,
                            bgcolor: CARD_SOFT_BG,
                            px: 2,
                            py: 1,
                            mt: 1.5,
                        }}
                    >
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                            กำลังคำนวณเงื่อนไข...
                        </Typography>
                    </Box>
                ) : (
                    <RuleResultBox rule={rule} compact />
                )
            ) : (
                <Box mt={1.5}>
                    <Typography variant="caption" color="text.disabled">
                        เปอร์เซ็นต์: เลือกนิ้วเพื่อแสดงเปอร์เซ็นต์
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default OrganLossSelector;
