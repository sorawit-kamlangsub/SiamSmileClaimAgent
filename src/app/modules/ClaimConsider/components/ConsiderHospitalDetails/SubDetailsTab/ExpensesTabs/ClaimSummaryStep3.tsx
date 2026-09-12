import { useEffect, useMemo, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    Grid,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import { MUIDataTableColumn } from "mui-datatables";

import { useGetBank } from "../../../../../../api/coreClaimMastersApi";
import { StandardDataTable } from "../../../../../_common";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import { cellAlignOptions } from "../../../../../../functionHelpers";
import {
    CompensationSummaryData,
    MergeOption,
    calculateCompensationSummary,
} from "./_common/calculateCompensationSummary";

/** 1 แถวของตารางรายการค่ารักษาในหน้าสรุป */
export type Step3TreatmentRow = {
    benefitName: string;
    /** รายการเบิก (สิทธิ์ความคุ้มครอง — coveredAmount) */
    amountNet: number;
    /** สิทธิ์เบิก */
    payAmount: number;
    /** ส่วนเกินสิทธิ์ */
    unPayAmount: number;
};

export type Step3CompensationRow = {
    description: string;
    amount: number;
};

export type Step3PayoutAccount = {
    phone?: string;
    accountName?: string;
    /** id จาก master ธนาคาร (GetOrganizeDtoResponse.organizeId) — คู่กับ bankName เสมอ */
    bankId?: number;
    bankName?: string;
    accountNo?: string;
    /** ป้ายความสัมพันธ์ของเจ้าของบัญชี เช่น "ผู้ชำระเบี้ยในระบบ" */
    relationLabel?: string;
};

export type Step3StayDays = {
    ipdDays: number;
    icuDays: number;
    totalDays: number;
};

type ClaimSummaryStep3Props = {
    treatmentRows?: Step3TreatmentRow[];
    compensationRows?: Step3CompensationRow[];
    /** ค่าตั้งต้นจาก API คำนวณ (ยังไม่มี endpoint สำหรับหน้าพิจารณา จึง default 0) */
    summary?: Partial<CompensationSummaryData>;
    /**
     * ให้ผู้ใช้เลือก "โอนค่าชดเชยรวมกับค่ารักษา" ได้เอง (IPD / Day Case ที่ไม่ใช่ PA)
     * false (default) = บังคับโอนรวม : checkbox Checked + Disabled, ค่าชดเชยคงเหลือ = 0, ไม่แสดงบัญชีรับเงินค่าชดเชย
     * true = ผู้ใช้ติ๊กได้ตาม flow, แสดงบัญชีรับเงินค่าชดเชยเมื่อมีการโอนแยก (คงเหลือ > 0)
     */
    allowSeparateCompensation?: boolean;
    payoutAccount?: Step3PayoutAccount;
    /** แจ้ง parent เมื่อผู้ใช้แก้ไขข้อมูลบัญชีรับเงินค่าชดเชย (มีผลเฉพาะรายการนี้) */
    onPayoutAccountChange?: (next: Step3PayoutAccount) => void;
    /** จำนวนวันนอน (เฉพาะ IPD) — มีค่าเมื่อประเภทการรักษา = IPD */
    stayDays?: Step3StayDays;
    /** ยกสถานะ checkbox "โอนค่าชดเชยรวมกับค่ารักษา" ให้ parent คุม (optional) */
    mergeChecked?: boolean;
    onMergeChange?: (checked: boolean) => void;
    /**
     * ซ่อนตาราง "ค่าชดเชย" (compensationRows) — ใช้เมื่อหน้าเรียกไม่มีรายการค่าชดเชยแยกต่อบรรทัดให้แสดง
     * (เช่นหน้าวางบิลเคลมโรงพยาบาล ที่สเปคมีแค่สรุปค่าชดเชยรวม ไม่มีตารางย่อย) default false = พฤติกรรมเดิม
     */
    hideCompensationTable?: boolean;
    /**
     * บรรทัดสุดท้ายของการ์ด "สรุปค่าใช้จ่ายโรงพยาบาล" — default "excess" = พฤติกรรมเดิม
     * ("ส่วนเกิน (ลูกค้าจ่าย)" = medicalUnpay) ส่วน "compensateRemain" = "ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)"
     * ตามสเปคหน้าวางบิลเคลมโรงพยาบาล
     */
    lastSummaryLine?: "excess" | "compensateRemain";
    /** ปิดปุ่ม "แก้ไขบัญชี" ของ "บัญชีรับเงินค่าชดเชย" — default false = พฤติกรรมเดิม */
    disableAccountEdit?: boolean;
    /**
     * แจ้ง parent ว่า "บัญชีรับเงินค่าชดเชย" ยังไม่พร้อมให้กดอนุมัติ — true เมื่อกำลังแก้ไขอยู่
     * (ยังไม่กด "เสร็จสิ้น") หรือข้อมูลบัญชียังไม่ครบ (เบอร์โทร/ชื่อบัญชี/ธนาคาร/เลขที่บัญชี)
     * ขณะที่การ์ดนี้แสดงอยู่ (showPayoutAccount) — parent ใช้ gate ปุ่ม "อนุมัติ"
     */
    onPayoutAccountBlockingChange?: (isBlocking: boolean) => void;
};

const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

const withTotalRow = <T extends Record<string, unknown>>(rows: T[], totalRow: T): T[] =>
    rows.length === 0 ? [] : [...rows, totalRow];

const tableSx = {
    "& td, & th": { fontSize: "15px !important", py: "5px !important", px: "9px !important" },
    "& td": {
        borderRight: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
        "&:last-child": { borderRight: "none" },
    },
    "& tbody tr:last-child:not(:only-child) td": {
        bgcolor: "#3d3d3d !important",
        color: "#fff !important",
        fontWeight: "700 !important",
    },
    "& table": { borderCollapse: "collapse" as const },
};

const tableOptions = {
    serverSide: false,
    pagination: false,
    selectableRows: "none" as const,
    search: false,
    filter: false,
    download: false,
    print: false,
    viewColumns: false,
};

const SummaryLine = ({
    label,
    value,
    bold = false,
    color,
    bg,
    noDivider = false,
}: {
    label: string;
    value: string;
    bold?: boolean;
    color?: string;
    bg?: string;
    noDivider?: boolean;
}) => (
    <>
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            py={0.75}
            px={1.5}
            sx={{ bgcolor: bg ?? "transparent" }}
        >
            <Typography variant="body2" fontWeight={bold ? 700 : 400} color={color ?? "text.primary"}>
                {label}
            </Typography>
            <Typography
                variant="body2"
                fontWeight={bold ? 700 : 400}
                color={color ?? "text.primary"}
                minWidth={110}
                textAlign="right"
            >
                {value}
            </Typography>
        </Box>
        {!noDivider && <Divider />}
    </>
);

/**
 * Step 3 : สรุปรายการเคลม (เคลมโรงพยาบาล) — ส่วนค่าใช้จ่าย/ค่าชดเชย
 *
 * Layout ย้ายมาจาก ClaimSimulate/ConfirmCalaulateModal — รายการค่ารักษา + ค่าชดเชย +
 * สรุปค่าชดเชย (โอนรวมกับค่ารักษา) + สรุปค่าใช้จ่ายโรงพยาบาล
 * (ส่วน "รายละเอียดเคลม" read-only + ตารางสแกนเอกสาร ใช้ ClaimSummary ต่อด้านบน)
 * ยอดเงินรอ API คำนวณของหน้าพิจารณา ตอนนี้รับผ่าน props (default 0)
 */
const ClaimSummaryStep3 = ({
    treatmentRows = [],
    compensationRows = [],
    summary,
    allowSeparateCompensation = false,
    payoutAccount,
    onPayoutAccountChange,
    stayDays,
    mergeChecked: mergeCheckedProp,
    onMergeChange,
    hideCompensationTable = false,
    lastSummaryLine = "excess",
    disableAccountEdit = false,
    onPayoutAccountBlockingChange,
}: ClaimSummaryStep3Props) => {
    // ติ๊ก "โอนค่าชดเชยรวมกับค่ารักษา" : default = โอนรวม (controlled ได้จาก parent)
    const [mergeCheckedInternal, setMergeCheckedInternal] = useState(true);
    const mergeChecked = mergeCheckedProp ?? mergeCheckedInternal;
    const setMergeChecked = (checked: boolean) => {
        setMergeCheckedInternal(checked);
        onMergeChange?.(checked);
    };

    // แก้ไขบัญชีรับเงินค่าชดเชย : เก็บค่าที่แก้ไว้ใน local state (มีผลเฉพาะรายการนี้)
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [accountDraft, setAccountDraft] = useState<Step3PayoutAccount>(payoutAccount ?? {});
    // แสดง error ใต้ช่องเมื่อพยายามกด "เสร็จสิ้น" ทั้งที่กรอกไม่ครบ (เหมือนพฤติกรรม touched ของ formik)
    const [accountTouched, setAccountTouched] = useState(false);
    useEffect(() => {
        if (!isEditingAccount) setAccountDraft(payoutAccount ?? {});
    }, [payoutAccount, isEditingAccount]);

    /**
     * อัปเดต draft + แจ้ง parent ทันทีทุกครั้งที่แก้ field — ไม่ต้องรอกด "เสร็จสิ้น"
     * (ก่อนหน้านี้ค่าที่กรอกไม่ไหลออกไป payoutAccount จน dialog ยืนยันไม่เห็นค่าที่กรอก)
     */
    const emitAccount = (next: Step3PayoutAccount) => {
        setAccountDraft(next);
        onPayoutAccountChange?.(next);
    };

    const handleAccountField = (field: keyof Step3PayoutAccount, value: string) => {
        emitAccount({ ...accountDraft, [field]: value });
    };

    // ธนาคารต้องเลือกจาก master เพื่อให้ได้ bankId ไปเป็น toBankId ใน payload อนุมัติ
    const { data: bankListData } = useGetBank();
    const bankOptions = bankListData?.data ?? [];
    const handleToggleEditAccount = () => {
        if (isEditingAccount) {
            // กด "เสร็จสิ้น" ทั้งที่ข้อมูลบัญชียังไม่ครบ — ไม่ปิดโหมดแก้ไข ให้ขึ้น error ใต้ช่องที่ขาดแทน
            if (!isPayoutAccountValid) {
                setAccountTouched(true);
                return;
            }
            onPayoutAccountChange?.(accountDraft);
            setAccountTouched(false);
        }
        setIsEditingAccount((prev) => !prev);
    };

    // บังคับโอนรวมเมื่อไม่ใช่กรณี IPD / Day Case ที่ไม่ใช่ PA
    // "โอนค่าชดเชยรวมกับค่ารักษา" = merge เท่าที่มีส่วนเกิน (medicalUnpay) ส่วนที่เกินจากส่วนเกิน
    // ยังเป็น "ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)" → ตรงกับ "single" ไม่ใช่ "all" (all จะบังคับคงเหลือ = 0 เสมอ)
    const isMerged = !allowSeparateCompensation || mergeChecked;
    const mergeOption: MergeOption = isMerged ? "single" : null;

    const calc = useMemo(
        () =>
            calculateCompensationSummary(
                {
                    compensateNet: summary?.compensateNet ?? 0,
                    compensateInclude: summary?.compensateInclude ?? 0,
                    compensateRemain: summary?.compensateRemain ?? 0,
                    medicalNet: summary?.medicalNet ?? 0,
                    medicalCoverPay: summary?.medicalCoverPay ?? 0,
                    medicalCompensateInclude: summary?.medicalCompensateInclude ?? 0,
                    medicalPay: summary?.medicalPay ?? 0,
                    medicalUnpay: summary?.medicalUnpay ?? 0,
                },
                mergeOption
            ),
        [summary, mergeOption]
    );

    // บัญชีรับเงินค่าชดเชย : แสดงเมื่อมีค่าชดเชยคงเหลือต้องโอนให้ลูกค้า (คงเหลือ > 0) และเป็นกรณีที่เลือกโอนแยกได้
    // — ไม่ว่าจะติ๊ก "โอนรวม" หรือไม่ ถ้าค่าชดเชยเกินส่วนเกินแล้วมีคงเหลือ ก็ต้องมีบัญชีปลายทาง
    const showPayoutAccount = allowSeparateCompensation && calc.compensateRemain > 0;

    // ช่องบังคับกรอกของ "บัญชีรับเงินค่าชดเชย" — required ทั้ง 4 ช่องตามเครื่องหมาย * บนฟอร์ม
    const payoutAccountErrors = {
        phone: accountDraft.phone?.trim() ? undefined : "กรุณากรอกข้อมูล",
        accountName: accountDraft.accountName?.trim() ? undefined : "กรุณากรอกข้อมูล",
        bankId: accountDraft.bankId ? undefined : "กรุณาเลือกข้อมูล",
        accountNo: accountDraft.accountNo?.trim() ? undefined : "กรุณากรอกข้อมูล",
    };
    const isPayoutAccountValid = !Object.values(payoutAccountErrors).some(Boolean);
    // ต้องกันปุ่ม "อนุมัติ" ทั้งตอนที่ยังแก้ไขค้างอยู่ (ยังไม่กด "เสร็จสิ้น") และตอนข้อมูลบัญชียังไม่ครบ
    const isPayoutAccountBlocking = showPayoutAccount && (isEditingAccount || !isPayoutAccountValid);

    useEffect(() => {
        onPayoutAccountBlockingChange?.(isPayoutAccountBlocking);
    }, [isPayoutAccountBlocking]);

    const treatmentColumns: MUIDataTableColumn[] = [
        { name: "benefitName", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
        {
            name: "amountNet",
            label: "รายการเบิก",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(Number(v)) },
        },
        {
            name: "payAmount",
            label: "สิทธิ์เบิกตามความคุ้มครอง",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(Number(v)) },
        },
        {
            name: "unPayAmount",
            label: "ส่วนเกินสิทธิ์",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(Number(v)) },
        },
    ];

    const compensationColumns: MUIDataTableColumn[] = [
        { name: "description", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
        {
            name: "amount",
            label: "สิทธิ์เบิกตามความคุ้มครอง",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(Number(v)) },
        },
    ];

    const treatmentData = withTotalRow(treatmentRows, {
        benefitName: "รวมทั้งหมด",
        amountNet: treatmentRows.reduce((s, r) => s + r.amountNet, 0),
        payAmount: treatmentRows.reduce((s, r) => s + r.payAmount, 0),
        unPayAmount: treatmentRows.reduce((s, r) => s + r.unPayAmount, 0),
    });

    const compensationData = withTotalRow(compensationRows, {
        description: "รวมทั้งหมด",
        amount: compensationRows.reduce((s, r) => s + r.amount, 0),
    });

    return (
        <Grid container spacing={2.5}>
            <Grid item xs={12}>
                <HeadingWithColor
                    text="รายการค่ารักษา"
                    color="blue"
                    icon={<LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />}
                />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
                    <StandardDataTable
                        name="HospitalTreatmentSummaryTable"
                        title=""
                        data={treatmentData}
                        isLoading={false}
                        columns={treatmentColumns}
                        color="primary"
                        columnHeaderAlign="center"
                        displayToolbar={false}
                        displayFooter={false}
                        options={tableOptions}
                        sx={tableSx}
                    />
                </Paper>
            </Grid>

            {!hideCompensationTable && (
                <Grid item xs={12}>
                    <HeadingWithColor
                        text="ค่าชดเชย"
                        color="blue"
                        icon={<MonetizationOnOutlinedIcon sx={{ fontSize: 18 }} />}
                    />
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
                        <StandardDataTable
                            name="HospitalCompensationTable"
                            title=""
                            data={compensationData}
                            isLoading={false}
                            columns={compensationColumns}
                            color="primary"
                            columnHeaderAlign="center"
                            displayToolbar={false}
                            displayFooter={false}
                            options={tableOptions}
                            sx={tableSx}
                        />
                    </Paper>
                </Grid>
            )}

            {stayDays && (
                <Grid item xs={12}>
                    <HeadingWithColor
                        text="สรุปจำนวนวันนอน"
                        color="blue"
                        icon={<HotelOutlinedIcon sx={{ fontSize: 18 }} />}
                    />
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
                        <SummaryLine label="จำนวนวัน IPD" value={`${stayDays.ipdDays} วัน`} />
                        <SummaryLine label="จำนวนวัน ICU" value={`${stayDays.icuDays} วัน`} />
                        <SummaryLine label="จำนวนวันนอน" value={`${stayDays.totalDays} วัน`} bold noDivider />
                    </Paper>
                </Grid>
            )}

            <Grid item xs={12} md={6}>
                <HeadingWithColor
                    text="สรุปค่าชดเชย"
                    color="blue"
                    icon={<SummarizeOutlinedIcon sx={{ fontSize: 18 }} />}
                />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
                    <Box px={1.5} py={0.5} bgcolor="#f8f9fa">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={isMerged}
                                    disabled={!allowSeparateCompensation}
                                    onChange={(e) => setMergeChecked(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={<Typography variant="body2">โอนค่าชดเชยรวมกับค่ารักษา</Typography>}
                            sx={{ m: 0, display: "flex", py: 0.5 }}
                        />
                    </Box>
                    <Divider />
                    <SummaryLine label="ค่าชดเชยรวม" value={fmt(calc.compensateNet)} />
                    <SummaryLine label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)" value={fmt(calc.compensateInclude)} />
                    <SummaryLine
                        label="ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)"
                        value={fmt(calc.compensateRemain)}
                        bold
                        color="#15803d"
                        bg="#F7FEE7"
                        noDivider
                    />
                </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
                <HeadingWithColor
                    text="สรุปค่าใช้จ่ายโรงพยาบาล"
                    color="blue"
                    icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />}
                />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
                    <SummaryLine label="ค่าใช้จ่ายทั้งหมด" value={fmt(calc.medicalNet)} />
                    <SummaryLine label="สิทธิ์ความคุ้มครอง" value={fmt(calc.medicalCoverPay)} />
                    <SummaryLine label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)" value={fmt(calc.compensateInclude)} />
                    <SummaryLine
                        label="สิทธิ์โรงพยาบาลตั้งเบิกกับบริษัท"
                        value={fmt(calc.medicalPay)}
                        bold
                        color="#1a5da8"
                        bg="#e8f0fb"
                    />
                    {lastSummaryLine === "compensateRemain" ? (
                        <SummaryLine
                            label="ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)"
                            value={fmt(calc.compensateRemain)}
                            bold
                            color="#15803d"
                            bg="#F7FEE7"
                            noDivider
                        />
                    ) : (
                        <SummaryLine
                            label="ส่วนเกิน (ลูกค้าจ่าย)"
                            value={fmt(calc.medicalUnpay)}
                            bold
                            color="#FF6467"
                            bg="#FEF2F2"
                            noDivider
                        />
                    )}
                </Paper>
            </Grid>

            {/* บัญชีรับเงินค่าชดเชย — โชว์เฉพาะ PH + IPD */}
            {showPayoutAccount && (
                <Grid item xs={12}>
                    <Paper
                        variant="outlined"
                        sx={{ borderRadius: 2, p: 2, borderColor: "#c8e6c9", bgcolor: "#f6fdf8" }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                            <AccountBalanceOutlinedIcon sx={{ fontSize: 18, color: "#15803d" }} />
                            <Typography sx={{ fontWeight: 700, color: "#15803d" }}>บัญชีรับเงินค่าชดเชย</Typography>
                            {payoutAccount?.relationLabel && (
                                <Chip
                                    label={payoutAccount.relationLabel}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            <Button
                                size="small"
                                variant={isEditingAccount ? "contained" : "outlined"}
                                disabled={disableAccountEdit}
                                onClick={handleToggleEditAccount}
                                sx={{ ml: "auto" }}
                            >
                                {isEditingAccount ? "เสร็จสิ้น" : "แก้ไขบัญชี"}
                            </Button>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            ระบบแสดงข้อมูล Default จากข้อมูลผู้ชำระเบี้ย / ข้อมูลบัญชีที่มีอยู่
                            สามารถแก้ไขเฉพาะรายการนี้ได้
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    label="เบอร์โทรศัพท์"
                                    value={accountDraft.phone ?? ""}
                                    onChange={(e) => handleAccountField("phone", e.target.value)}
                                    InputProps={{ readOnly: !isEditingAccount }}
                                    error={accountTouched && !!payoutAccountErrors.phone}
                                    helperText={accountTouched ? payoutAccountErrors.phone : undefined}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    label="ชื่อบัญชี"
                                    value={accountDraft.accountName ?? ""}
                                    onChange={(e) => handleAccountField("accountName", e.target.value)}
                                    InputProps={{ readOnly: !isEditingAccount }}
                                    error={accountTouched && !!payoutAccountErrors.accountName}
                                    helperText={accountTouched ? payoutAccountErrors.accountName : undefined}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    disabled={!isEditingAccount}
                                    options={bankOptions}
                                    getOptionLabel={(option) => option.organizeName ?? ""}
                                    isOptionEqualToValue={(option, value) => option.organizeId === value.organizeId}
                                    value={bankOptions.find((b) => b.organizeId === accountDraft.bankId) ?? null}
                                    // เซ็ต bankId กับ bankName พร้อมกัน ป้องกัน toBankId ไม่ตรงกับ toBankName
                                    onChange={(_event, option) =>
                                        emitAccount({
                                            ...accountDraft,
                                            bankId: option?.organizeId,
                                            bankName: option?.organizeName,
                                        })
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="ธนาคาร"
                                            error={accountTouched && !!payoutAccountErrors.bankId}
                                            helperText={accountTouched ? payoutAccountErrors.bankId : undefined}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    label="เลขที่บัญชี"
                                    value={accountDraft.accountNo ?? ""}
                                    onChange={(e) => handleAccountField("accountNo", e.target.value)}
                                    InputProps={{ readOnly: !isEditingAccount }}
                                    error={accountTouched && !!payoutAccountErrors.accountNo}
                                    helperText={accountTouched ? payoutAccountErrors.accountNo : undefined}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            )}
        </Grid>
    );
};

export default ClaimSummaryStep3;
