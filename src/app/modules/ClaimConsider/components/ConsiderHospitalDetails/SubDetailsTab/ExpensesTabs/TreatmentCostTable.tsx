import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Select,
    MenuItem,
    IconButton,
    Paper,
    Button,
    CircularProgress,
    Alert,
    type SelectChangeEvent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTreatmentCostsHook, TreatmentCostRow } from "../../../../hooks/ClaimConsiderHospital/TreatmentCostsHook";

const REASON_OPTIONS = [
    "สาเหตุไม่คุ้มครอง",
    "เกินวงเงินความคุ้มครอง",
    "ไม่อยู่ในความคุ้มครองตามกรมธรรม์",
    "เกินระยะเวลารอคอย",
    "ไม่ระบุสาเหตุ",
];

// Shared "pill" style for the numeric inputs, colored per column
const numberFieldSx = (borderColor: string, bgColor: string) => ({
    width: "100%",
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        backgroundColor: bgColor,
        "& fieldset": { borderColor },
        "&:hover fieldset": { borderColor },
        "&.Mui-focused fieldset": { borderColor, borderWidth: "1px" },
    },
    "& input": {
        textAlign: "right",
        padding: "8px 12px",
        fontSize: "0.875rem",
    },
});

const COLUMN_STYLES = {
    receipt: { border: "#90caf9", bg: "#f2f8fe" },
    eligible: { border: "#a5d6a7", bg: "#f2faf3" },
    discount: { border: "#ffcc80", bg: "#fffaf0" },
    uncovered: { border: "#ef9a9a", bg: "#fdf3f3" },
};

interface TreatmentCostTableProps {
    /** Identifier for whatever case/claim this table's data belongs to. */
    caseId: string;
}

export default function TreatmentCostTable({ caseId }: TreatmentCostTableProps) {
    const { rows, updateField, deleteRow, save, saveSucceeded, saveFailed } = useTreatmentCostsHook(caseId);

    const handleReasonChange = (id: string, event: SelectChangeEvent) => {
        updateField(id, "reason", event.target.value);
    };

    // if (isLoading) {
    //     return (
    //         <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
    //             <CircularProgress size={28} />
    //         </Box>
    //     );
    // }

    // if (isError) {
    //     return (
    //         <Alert severity="error" sx={{ m: 2 }}>
    //             โหลดข้อมูลไม่สำเร็จ: {(error as Error)?.message ?? "unknown error"}
    //         </Alert>
    //     );
    // }

    return (
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                }}
            >
                <Typography variant="h6" sx={{ color: "#1565c0", fontWeight: 700 }}>
                    รายการค่ารักษา(เบื้องต้น)
                </Typography>
            </Box>

            {saveSucceeded && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    บันทึกข้อมูลสำเร็จ
                </Alert>
            )}
            {saveFailed && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่
                </Alert>
            )}

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: "auto" }}>
                <Table sx={{ minWidth: 1100 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#eaf4fd" }}>
                            <TableCell sx={{ fontWeight: 700, minWidth: 260 }}>รายการค่ารักษา</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>ยอดเงินตามใบเสร็จ</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>สิทธิ์เบิก</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>ส่วนลด</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>ยอดไม่คุ้มครอง</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>สาเหตุไม่คุ้มครอง</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>หมายเหตุ</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 60 }}>ลบ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row: TreatmentCostRow) => (
                            <TableRow key={row.id} hover>
                                <TableCell sx={{ fontSize: "0.875rem" }}>
                                    {row.code} {row.label}
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        type="number"
                                        placeholder="0.00"
                                        size="small"
                                        value={row.receiptAmount}
                                        onChange={(e) => updateField(row.id, "receiptAmount", e.target.value)}
                                        sx={numberFieldSx(COLUMN_STYLES.receipt.border, COLUMN_STYLES.receipt.bg)}
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        type="number"
                                        placeholder="0.00"
                                        size="small"
                                        value={row.eligibleAmount}
                                        onChange={(e) => updateField(row.id, "eligibleAmount", e.target.value)}
                                        sx={numberFieldSx(COLUMN_STYLES.eligible.border, COLUMN_STYLES.eligible.bg)}
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        type="number"
                                        placeholder="0.00"
                                        size="small"
                                        value={row.discount}
                                        onChange={(e) => updateField(row.id, "discount", e.target.value)}
                                        sx={numberFieldSx(COLUMN_STYLES.discount.border, COLUMN_STYLES.discount.bg)}
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        type="number"
                                        placeholder="0.00"
                                        size="small"
                                        value={row.uncoveredAmount}
                                        onChange={(e) => updateField(row.id, "uncoveredAmount", e.target.value)}
                                        sx={numberFieldSx(COLUMN_STYLES.uncovered.border, COLUMN_STYLES.uncovered.bg)}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Select
                                        size="small"
                                        value={row.reason}
                                        onChange={(e) => handleReasonChange(row.id, e)}
                                        sx={{ width: "100%", borderRadius: "8px" }}
                                    >
                                        {REASON_OPTIONS.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        placeholder="หมายเหตุ"
                                        size="small"
                                        fullWidth
                                        value={row.note}
                                        onChange={(e) => updateField(row.id, "note", e.target.value)}
                                        sx={{
                                            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                                        }}
                                    />
                                </TableCell>

                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => deleteRow(row.id)}
                                        sx={{
                                            color: "#fff",
                                            backgroundColor: "#e57373",
                                            "&:hover": { backgroundColor: "#ef5350" },
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

// ---- Example usage from a parent component ----------------------------
//
// function ClaimReviewPage() {
//   const { caseId } = useParams<{ caseId: string }>();
//   return <TreatmentCostTable caseId={caseId!} />;
// }
