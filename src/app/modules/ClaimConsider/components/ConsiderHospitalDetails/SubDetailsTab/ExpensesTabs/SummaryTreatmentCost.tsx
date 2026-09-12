import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    type SelectChangeEvent,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import HighlightRow from "./_common/HighlightRow";
import SummaryBox from "./_common/SummaryBox";
// TODO: point this at your actual typed-hooks file (same one used by
// TreatmentCostTable / TreatmentCostsHook) — adjust the relative depth
// to match where this component lives.

export interface InsuranceCompanyOption {
    value: string;
    label: string;
}

const DEFAULT_INSURANCE_COMPANIES: InsuranceCompanyOption[] = [
    { value: "aia", label: "AIA" },
    { value: "muang-thai", label: "เมืองไทยประกันชีวิต" },
    { value: "krungthai-axa", label: "กรุงไทย-แอกซ่า" },
    { value: "thai-life", label: "ไทยประกันชีวิต" },
];

interface PaymentSummaryCardProps {
    insuranceCompanies?: InsuranceCompanyOption[];
    onExcessChange?: (params: { isExcess: boolean; insuranceCompany: string }) => void;
}

export default function SummaryTreatmentCost({
    insuranceCompanies = DEFAULT_INSURANCE_COMPANIES,
    onExcessChange,
}: PaymentSummaryCardProps = {}) {
    // Reads the same rows TreatmentCostTable edits — sourced from the
    // treatmentCost slice, no prop drilling needed. Swap the state path
    // below (`state.treatmentCost.rows`) if your slice is named/shaped
    // differently once it lands.
    // const rows = useAppSelector((state) => state.treatmentCost.rows);

    const [isExcess, setIsExcess] = useState(false);
    const [insuranceCompany, setInsuranceCompany] = useState("");

    // const { totalReceipt, totalDiscount, totalUncovered, netAmount } = useMemo(() => {
    //     const totalReceipt = rows.reduce((sum, row) => sum + toNumber(row.receiptAmount), 0);
    //     const totalDiscount = rows.reduce((sum, row) => sum + toNumber(row.discount), 0);
    //     const totalUncovered = rows.reduce((sum, row) => sum + toNumber(row.uncoveredAmount), 0);
    //     // Net payable = what was billed, minus discounts and anything not covered.
    //     const netAmount = Math.max(totalReceipt - totalDiscount - totalUncovered, 0);
    //     return { totalReceipt, totalDiscount, totalUncovered, netAmount };
    // }, [rows]);

    // Transfer amount mirrors the net amount by default. Adjust here if
    // excess-from-insurer handling should change what actually gets
    // transferred once that business rule is confirmed.
    // const transferAmount = netAmount;

    const handleExcessToggle = (checked: boolean) => {
        setIsExcess(checked);
        onExcessChange?.({ isExcess: checked, insuranceCompany });
    };

    const handleCompanyChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setInsuranceCompany(value);
        onExcessChange?.({ isExcess, insuranceCompany: value });
    };

    return (
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, m: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Box
                    sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "6px",
                        backgroundColor: "#1565c0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ReceiptLongIcon sx={{ color: "#fff", fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: "#1565c0" }}>สรุปยอดเงิน</Typography>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr 1fr 1.4fr",
                    },
                    gap: 2,
                    mb: 2.5,
                }}
            >
                <SummaryBox label="ยอดเงินตามใบเสร็จรวม :" value={0} />
                <SummaryBox label="ส่วนลดรวม :" value={0} />
                <SummaryBox label="ยอดไม่คุ้มครองรวม :" value={0} />

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                    }}
                >
                    <HighlightRow
                        icon={<CreditCardIcon sx={{ color: "#2e7d32", fontSize: 18 }} />}
                        label="ยอดเงินสุทธิ :"
                        value={0}
                        bg="#eafaf0"
                        border="#a5d6a7"
                        valueColor="#2e7d32"
                    />
                    <HighlightRow
                        icon={<AccountBalanceWalletIcon sx={{ color: "#1565c0", fontSize: 18 }} />}
                        label="ยอดเงินโอน :"
                        value={0}
                        bg="#eaf4fd"
                        border="#90caf9"
                        valueColor="#1565c0"
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <FormControlLabel
                    control={<Checkbox checked={isExcess} onChange={(e) => handleExcessToggle(e.target.checked)} />}
                    label="เป็นส่วนเกินจากบริษัทประกัน"
                    sx={{ whiteSpace: "nowrap" }}
                />

                <Select
                    size="small"
                    displayEmpty
                    value={insuranceCompany}
                    onChange={handleCompanyChange}
                    disabled={!isExcess}
                    sx={{ minWidth: 280, borderRadius: "8px" }}
                >
                    <MenuItem value="">
                        <em>---เลือกบริษัทประกัน---</em>
                    </MenuItem>
                    {insuranceCompanies.map((company) => (
                        <MenuItem key={company.value} value={company.value}>
                            {company.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        </Paper>
    );
}
