import React, { useMemo, useState } from "react";
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
import { ORGAN_ICON_MAP } from "../components/OrganLossIcons";

import {
    ORGAN_CHOICES,
    ORGAN_COMBO_PARTS,
    UNCOVERED_REASON_OPTIONS,
    EXGRATIA_DEDUCT_SOURCE_OPTIONS,
    FINGER_KEYS,
    FINGER_LABELS,
    FINGER_MAX_JOINTS,
    isComboOrganKey,
    getOrganChoice,
    createFingerState,
    countSelectedFingers,
    calculateFingerSideTotal,
    amountNumber,
    formatNoDecimal,
    OrganChoice,
    OrganSide,
    OrganFingerState,
    OrganLossItem,
    OrganRuleResult,
    FingerKey,
} from "../hooks/organLoss.types";

const CARD_BORDER = "#dbe6f3";
const CARD_SOFT_BG = "#eef6ff";
const PRIMARY = "#0b74bd";

const StepBadge: React.FC<{ n: number }> = ({ n }) => (
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

const OrganIconGroup: React.FC<{ icons: OrganChoice["icons"]; selected?: boolean; size?: number }> = ({
    icons,
    selected,
    size = 22,
}) => {
    if (icons.length <= 1) {
        const Icon = ORGAN_ICON_MAP[icons[0]];
        return (
            <Box
                sx={{
                    width: size + 20,
                    height: size + 20,
                    borderRadius: "50%",
                    bgcolor: selected ? "#fff" : CARD_SOFT_BG,
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
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                bgcolor: selected ? "#fff" : CARD_SOFT_BG,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Icon sx={{ fontSize: 16, color: PRIMARY }} />
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
                    ไม่พบรายละเอียดเงื่อนไขการคำนวณ
                </Typography>
            </Box>
        );
    }
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
                ยอดที่คุ้มครอง : {formatNoDecimal(rule.coveredAmount)} บาท
            </Typography>
        </Box>
    );
};

const SideToggle: React.FC<{
    value: OrganSide;
    onChange: (side: OrganSide) => void;
    includeBoth?: boolean;
}> = ({ value, onChange, includeBoth = true }) => {
    const options: OrganSide[] = includeBoth ? ["ซ้าย", "ขวา", "ทั้งสองข้าง"] : ["ซ้าย", "ขวา"];
    return (
        <Box display="flex" gap={1}>
            {options.map((side) => (
                <Box
                    key={side}
                    onClick={() => onChange(side)}
                    role="button"
                    tabIndex={0}
                    sx={{
                        px: 2,
                        py: 0.75,
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: value === side ? PRIMARY : CARD_BORDER,
                        bgcolor: value === side ? PRIMARY : "#fff",
                        color: value === side ? "#fff" : "text.secondary",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    {side}
                </Box>
            ))}
        </Box>
    );
};

// ── modal internal state ──
interface ModalState {
    key: string;
    editIndex: number;
    choice: OrganChoice;
    side: OrganSide;
    comboSides: Record<string, OrganSide>;
    amount: string;
    uncoveredAmount: string;
    uncoveredReason: string;
    exgratiaDeductSource: string;
    exgratiaDeductDetail: string;
    note: string;
    fingers: OrganFingerState | null;
}

const buildComboSides = (choice: OrganChoice, existing?: Record<string, OrganSide>, fallback: OrganSide = "ขวา") => {
    const parts = ORGAN_COMBO_PARTS[choice.key] || [];
    return parts.reduce(
        (acc, part) => {
            acc[part.key] = existing?.[part.key] || fallback;
            return acc;
        },
        {} as Record<string, OrganSide>
    );
};

export interface OrganLossSelectorProps {
    value: OrganLossItem[];
    onChange: (items: OrganLossItem[]) => void;
    priorClaimWarning?: string;
    getSimpleRule?: (organKey: string, side: OrganSide | "") => OrganRuleResult | null;
    getFingerRule?: (organKey: string, fingerKey: FingerKey, joints: number) => OrganRuleResult | null;
}

const OrganLossSelector: React.FC<OrganLossSelectorProps> = ({
    value,
    onChange,
    priorClaimWarning,
    getSimpleRule,
    getFingerRule,
}) => {
    const [modal, setModal] = useState<ModalState | null>(null);
    const [formError, setFormError] = useState("");

    const selectedKeys = useMemo(() => value.map((i) => i.key), [value]);

    const totalAmount = useMemo(() => value.reduce((sum, i) => sum + amountNumber(i.totalAmount), 0), [value]);

    const openModal = (key: string) => {
        const choice = getOrganChoice(key);
        if (!choice) return;
        const editIndex = selectedKeys.indexOf(key);
        const existing = editIndex >= 0 ? value[editIndex] : undefined;
        setFormError("");
        setModal({
            key,
            editIndex,
            choice,
            side: (existing?.side as OrganSide) || "ขวา",
            comboSides: buildComboSides(choice, existing?.comboSides, (existing?.side as OrganSide) || "ขวา"),
            amount: existing?.amount || (existing?.totalAmount ? String(existing.totalAmount) : ""),
            uncoveredAmount: existing?.uncoveredAmount || "",
            uncoveredReason: existing?.uncoveredReason || "สาเหตุไม่คุ้มครอง",
            exgratiaDeductSource: existing?.exgratiaDeductSource || "",
            exgratiaDeductDetail: existing?.exgratiaDeductDetail || "",
            note: existing?.note || "",
            fingers: choice.isFinger ? createFingerState(key, existing?.fingers) : null,
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

    const modalTotal = useMemo(() => {
        if (!modal) return 0;
        if (modal.choice.isFinger)
            return calculateFingerSideTotal(modal.fingers, "left") + calculateFingerSideTotal(modal.fingers, "right");
        return amountNumber(modal.amount);
    }, [modal]);

    const handleSave = () => {
        if (!modal) return;

        if (modal.key === "exgratia" && !modal.exgratiaDeductSource) {
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
        }

        const item: OrganLossItem = {
            key: modal.key,
            label: modal.choice.label,
            icons: modal.choice.icons,
            uncoveredAmount: modal.uncoveredAmount,
            uncoveredReason: modal.uncoveredReason,
            exgratiaDeductSource: modal.exgratiaDeductSource,
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
        } else if (isComboOrganKey(modal.key)) {
            item.comboSides = modal.comboSides;
            item.side = Object.values(modal.comboSides).join(" + ");
            item.amount = modal.amount;
            const comboSummary = (ORGAN_COMBO_PARTS[modal.key] || [])
                .map((part) => `${part.label}: ${modal.comboSides[part.key] || "-"}`)
                .join(" • ");
            item.summaryText = [comboSummary, `${formatNoDecimal(modalTotal)} บาท`].filter(Boolean).join(" • ");
        } else {
            item.side = modal.choice.hasSide ? modal.side : "";
            item.amount = modal.amount;
            const exgratiaNote =
                modal.key === "exgratia" && modal.exgratiaDeductSource ? `หักจาก: ${modal.exgratiaDeductSource}` : "";
            item.summaryText = [item.side, exgratiaNote, `${formatNoDecimal(modalTotal)} บาท`]
                .filter(Boolean)
                .join(" • ");
        }

        const next = [...value];
        if (modal.editIndex >= 0) next[modal.editIndex] = item;
        else next.push(item);
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
                    <StepBadge n={1} />
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

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                    gap: 1.5,
                    mb: 3,
                }}
            >
                {ORGAN_CHOICES.map((choice) => {
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
                            <OrganIconGroup icons={choice.icons} selected={selected} />
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
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        bgcolor: CARD_SOFT_BG,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <OrganIconGroup icons={item.icons} selected size={16} />
                                </Box>
                                <Box>
                                    <Typography fontWeight={800}>{item.label}</Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        {item.summaryText || "-"}
                                    </Typography>
                                    {item.note && (
                                        <Typography variant="caption" color="text.disabled">
                                            หมายเหตุ: {item.note}
                                        </Typography>
                                    )}
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
            <Dialog open={!!modal} onClose={closeModal} maxWidth={modal?.choice.isFinger ? "lg" : "sm"} fullWidth>
                {modal && (
                    <>
                        <DialogTitle
                            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
                        >
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        bgcolor: CARD_SOFT_BG,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <OrganIconGroup icons={modal.choice.icons} selected size={20} />
                                </Box>
                                <Box>
                                    <Typography fontWeight={800}>2 ระบุรายละเอียดการสูญเสีย</Typography>
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
                                    getFingerRule={getFingerRule}
                                />
                            ) : (
                                <SimpleModalBody
                                    modal={modal}
                                    patchModal={patchModal}
                                    getSimpleRule={getSimpleRule}
                                    modalTotal={modalTotal}
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
                                    value={modal.uncoveredReason}
                                    onChange={(e) => patchModal({ uncoveredReason: e.target.value })}
                                >
                                    {UNCOVERED_REASON_OPTIONS.map((r) => (
                                        <MenuItem key={r} value={r}>
                                            {r}
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
    getSimpleRule?: OrganLossSelectorProps["getSimpleRule"];
    modalTotal: number;
}> = ({ modal, patchModal, getSimpleRule, modalTotal }) => {
    const isCombo = isComboOrganKey(modal.key);
    const rule = isCombo ? null : getSimpleRule?.(modal.key, modal.choice.hasSide ? modal.side : "") ?? null;

    return (
        <Box>
            {isCombo && (
                <Box mb={2}>
                    <Typography fontWeight={700} mb={1}>
                        ข้างที่สูญเสียตามอวัยวะ :
                    </Typography>
                    <Box display="grid" gap={1.5} gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}>
                        {(ORGAN_COMBO_PARTS[modal.key] || []).map((part) => (
                            <Box
                                key={part.key}
                                sx={{ border: "1px solid", borderColor: CARD_BORDER, borderRadius: 2, p: 1.5 }}
                            >
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <OrganIconGroup icons={[part.icon]} selected size={16} />
                                    <Typography fontWeight={700}>{part.label}</Typography>
                                </Box>
                                <SideToggle
                                    value={modal.comboSides[part.key] || "ขวา"}
                                    onChange={(side) =>
                                        patchModal({ comboSides: { ...modal.comboSides, [part.key]: side } })
                                    }
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {!isCombo && modal.choice.hasSide && (
                <Box mb={2}>
                    <Typography fontWeight={700} mb={1}>
                        ข้างที่สูญเสีย :
                    </Typography>
                    <SideToggle value={modal.side} onChange={(side) => patchModal({ side, amount: "" })} />
                </Box>
            )}

            <TextField
                label="ยอดเบิก"
                size="small"
                fullWidth
                inputMode="decimal"
                value={modal.amount}
                onChange={(e) => patchModal({ amount: e.target.value })}
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
                            value={modal.exgratiaDeductSource}
                            onChange={(e) => patchModal({ exgratiaDeductSource: e.target.value })}
                        >
                            <MenuItem value="">--- โปรดระบุ ---</MenuItem>
                            {EXGRATIA_DEDUCT_SOURCE_OPTIONS.map((o) => (
                                <MenuItem key={o} value={o}>
                                    {o}
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

            {!isCombo && <RuleResultBox rule={rule} />}
            {isCombo && (
                <Box mt={1.5}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        ยอดเบิกรวม: {formatNoDecimal(modalTotal)} บาท (คำนวณจากยอดเบิกที่กรอกด้านบน)
                    </Typography>
                </Box>
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
    getFingerRule?: OrganLossSelectorProps["getFingerRule"];
}> = ({ modal, setFingerField, getFingerRule }) => {
    const renderSide = (side: "left" | "right", label: string) => (
        <Box mb={2}>
            <Typography fontWeight={800} mb={1}>
                ข้าง{label} :
            </Typography>
            <Box display="grid" gap={1.5} gridTemplateColumns={{ xs: "1fr 1fr", sm: "repeat(5, 1fr)" }}>
                {FINGER_KEYS.map((fingerKey) => {
                    const data = modal.fingers![side][fingerKey];
                    const label2 = FINGER_LABELS[modal.key]?.[fingerKey];
                    const maxJoints = FINGER_MAX_JOINTS[modal.key]?.[fingerKey] || 3;
                    const rule = data.selected ? getFingerRule?.(modal.key, fingerKey, data.joints) ?? null : null;
                    return (
                        <Box
                            key={fingerKey}
                            sx={{ border: "1px solid", borderColor: CARD_BORDER, borderRadius: 2, p: 1.5 }}
                        >
                            <Box
                                component="label"
                                display="flex"
                                alignItems="center"
                                gap={1}
                                sx={{ cursor: "pointer" }}
                                onClick={() => setFingerField(side, fingerKey, { selected: !data.selected })}
                            >
                                <input
                                    type="checkbox"
                                    checked={data.selected}
                                    readOnly
                                    style={{ width: 16, height: 16 }}
                                />
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
                                        onClick={() =>
                                            setFingerField(side, fingerKey, { joints: Math.max(1, data.joints - 1) })
                                        }
                                    >
                                        −
                                    </IconButton>
                                    <Typography fontWeight={800}>{data.joints}</Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            setFingerField(side, fingerKey, {
                                                joints: Math.min(maxJoints, data.joints + 1),
                                            })
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
                                sx={{ mt: 1.5 }}
                                value={data.amount}
                                onChange={(e) => setFingerField(side, fingerKey, { amount: e.target.value })}
                            />

                            {data.selected ? (
                                <RuleResultBox rule={rule} compact />
                            ) : (
                                <Box mt={1.5}>
                                    <Typography variant="caption" color="text.disabled">
                                        เปอร์เซ็นต์: เลือกนิ้วเพื่อแสดงเปอร์เซ็นต์
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    );
                })}
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

export default OrganLossSelector;
