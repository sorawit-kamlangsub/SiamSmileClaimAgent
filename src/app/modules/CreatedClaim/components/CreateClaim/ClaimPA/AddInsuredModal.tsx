import React, { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { MUIDataTableColumn } from "mui-datatables";
import { useAppDispatch } from "../../../../../../redux";
import { addClaimItem, ClaimInsuredItem } from "../../../store/claimPASlice";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../../../functionHelpers";
import { StandardDataTable } from "../../../../_common";
import { FormikTextField } from "../../../../_common";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import SearchTypeDropDown from "../../../../_common/components/ClaimAgent/CustomDropdown/SearchTypeDropDown";

interface SearchResult {
    appId: string;
    customerName: string;
    insuredType: string;
    plan: string;
    startCoverDate: string;
    effectiveDate: string;
    endCoverDate: string;
    prefix: string;
    firstName: string;
    lastName: string;
}

interface ClaimHistoryRow {
    claimCase: string;
    chiefComplain: string;
    incidentDate: string;
    claimAmount: number;
    paidAmount: number;
}

interface Props {
    open: boolean;
    onClose: () => void;
    currentItemCount: number; // เพื่อคำนวณ seq
}

// ── Mock search results ───────────────────────────────────────
const MOCK_SEARCH_RESULTS: SearchResult[] = [
    {
        appId: "69360005",
        prefix: "ด.ญ.",
        firstName: "วิจิตรัน",
        lastName: "อุตมกัตถ์",
        customerName: "ด.ญ.วิจิตรัน อุตมกัตถ์",
        insuredType: "นักเรียน",
        plan: "เลือกสิทธิ์",
        startCoverDate: "2026-01-01",
        effectiveDate: "2026-01-01",
        endCoverDate: "2026-12-31",
    },
    {
        appId: "69360006",
        prefix: "ด.ช.",
        firstName: "วิชัย",
        lastName: "อุตมกัตถ์",
        customerName: "ด.ช.วิชัย อุตมกัตถ์",
        insuredType: "นักเรียน",
        plan: "เลือกสิทธิ์",
        startCoverDate: "2026-01-01",
        effectiveDate: "2026-01-01",
        endCoverDate: "2026-12-31",
    },
];

const MOCK_CLAIM_HISTORY: ClaimHistoryRow[] = [];

// const SEARCH_BY_OPTIONS = [
//     { value: "nationalId", label: "เลขบัตรประชาชน" },
//     { value: "passport", label: "Passport" },
//     { value: "name", label: "ชื่อ-นามสกุล" },
// ];

const AddInsuredModal: React.FC<Props> = ({ open, onClose, currentItemCount }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedInsured, setSelectedInsured] = useState<SearchResult | null>(null);
    const [claimHistory, setClaimHistory] = useState<ClaimHistoryRow[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const formik = useFormik({
        initialValues: { searchBy: 3, keyword: "" },
        validate: (v) => {
            const e: any = {};
            if (!v.searchBy) e.searchBy = "โปรดระบุ";
            if (!v.keyword.trim()) e.keyword = "โปรดระบุ";
            return e;
        },
        onSubmit: () => {
            // TODO: เรียก API จริง
            setSearchResults(MOCK_SEARCH_RESULTS);
            setSelectedInsured(null);
            setClaimHistory([]);
            setHasSearched(true);
        },
    });

    const handleSelect = (result: SearchResult) => {
        setSelectedInsured(result);
        // TODO: เรียก API ดึงประวัติเคลม
        setClaimHistory(MOCK_CLAIM_HISTORY);
    };

    const handleAddClaim = () => {
        if (!selectedInsured) return;
        const item: ClaimInsuredItem = {
            id: Date.now().toString(),
            seq: currentItemCount + 1,
            customerName: selectedInsured.customerName,
            claimStyle: `${selectedInsured.insuredType} (${selectedInsured.plan})`,
            incidentDate: dayjs(),
            admissionDate: dayjs(),
            dischargeDate: dayjs(),
            idCard: selectedInsured.appId,
            claimAmount: 0,
        };

        dispatch(addClaimItem(item));
        navigate(-1);
        handleClose();
    };

    const handleClose = () => {
        formik.resetForm();
        setSearchResults([]);
        setSelectedInsured(null);
        setClaimHistory([]);
        setHasSearched(false);
        onClose();
    };

    // ── columns: ตารางค้นหา ──
    const searchColumns: MUIDataTableColumn[] = [
        {
            name: "select",
            label: " ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRenderLite: (i) => {
                    const result = searchResults[i];
                    const isSelected = selectedInsured?.appId === result.appId;
                    return (
                        <Button
                            size="small"
                            variant={isSelected ? "contained" : "outlined"}
                            color="primary"
                            onClick={() => handleSelect(result)}
                            sx={{ minWidth: 60 }}
                        >
                            เลือก
                        </Button>
                    );
                },
            },
        },
        {
            name: "customerName",
            label: "ชื่อผู้เอาประกัน",
            options: { ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "insuredType",
            label: "ประเภทผู้เอาประกัน",
            options: { ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "plan",
            label: "แผน",
            options: { ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "startCoverDate",
            label: "วันที่เริ่มคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (v) => formatDateString(v, "DD/MM/BBBB"),
            },
        },
        {
            name: "effectiveDate",
            label: "วันที่มีผลคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (v) => formatDateString(v, "DD/MM/BBBB"),
            },
        },
        {
            name: "endCoverDate",
            label: "วันที่สิ้นสุดความคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (v) => formatDateString(v, "DD/MM/BBBB"),
            },
        },
    ];

    // ── columns: ประวัติการเคลม ──
    const historyColumns: MUIDataTableColumn[] = [
        {
            name: "claimCase",
            label: "ClaimCase",
            options: { ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "chiefComplain",
            label: "ChiefComplain",
            options: { ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "incidentDate",
            label: "วันที่เกิดเหตุ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (v) => formatDateString(v, "DD/MM/BBBB"),
            },
        },
        {
            name: "claimAmount",
            label: "ยอดเบิก",
            options: {
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (v) => Number(v).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "paidAmount",
            label: "ยอดจ่าย",
            options: {
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (v) => Number(v).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
    ];

    return (
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogTitle>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#DCEFFC" }}>
                            <PersonSearchIcon sx={{ fontSize: 30, color: "primary.main" }} />
                        </Avatar>
                        <Typography fontWeight={700}>ค้นหาผู้เอาประกัน</Typography>
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "common.white",
                            width: 25,
                            height: 25,
                            "&:hover": { bgcolor: "error.dark" },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 23 }} />
                    </IconButton>
                </Grid>
                <Divider sx={{ mt: 1.5 }} />
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={2}>
                    {/* ── Search bar ── */}
                    <Grid item xs={12} sm={4} md={3}>
                        {/* <FormikDropdown
                            name="searchBy"
                            label="ค้นหาจาก *"
                            formik={formik}
                            data={SEARCH_BY_OPTIONS}
                            firstItemText="-- เลือก --"
                            displayFieldName="label"
                            valueFieldName="value"
                            fullWidth
                            size="small"
                        /> */}
                        <SearchTypeDropDown formik={formik} name="searchBy" filterIds={[2, 4, 5]} required />
                    </Grid>
                    <Grid item xs={12} sm={6} md={7}>
                        <FormikTextField
                            name="keyword"
                            label="คำค้นหา *"
                            formik={formik}
                            size="small"
                            fullWidth
                            onKeyDown={(e) => {
                                if (e.key === "Enter") formik.handleSubmit();
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2} md={2} display="flex" alignItems="center">
                        <Button
                            variant="contained"
                            sx={{ height: "38px", fontSize: 15 }}
                            startIcon={<SearchIcon sx={{ fontSize: 20 }} />}
                            onClick={() => formik.handleSubmit()}
                            fullWidth
                        >
                            ค้นหา
                        </Button>
                    </Grid>

                    {/* ── ตารางผลลัพธ์ ── */}
                    {hasSearched && (
                        <Grid item xs={12}>
                            <StandardDataTable
                                name="InsuredSearchTable"
                                title=""
                                data={searchResults}
                                isLoading={false}
                                columns={searchColumns}
                                color="primary"
                                columnHeaderAlign="center"
                                displayToolbar={false}
                                options={{
                                    ...defaultOptionStandardDataTable,
                                    textLabels: { body: { noMatch: "ไม่พบข้อมูล" } },
                                }}
                                sx={smallSizeFooter}
                            />
                        </Grid>
                    )}

                    {/* ── ประวัติการเคลม (แสดงเมื่อเลือกแล้ว) ── */}
                    {selectedInsured && (
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    border: "1px solid #b3d4f0",
                                    borderRadius: 1,
                                    p: 2,
                                    bgcolor: "#F5FCFF",
                                }}
                            >
                                <HeadingWithColor text="ประวัติการเคลม" color="blue" />
                                <StandardDataTable
                                    name="InsuredClaimHistoryTable"
                                    title=""
                                    data={claimHistory}
                                    isLoading={false}
                                    columns={historyColumns}
                                    color="primary"
                                    columnHeaderAlign="center"
                                    displayToolbar={false}
                                    options={{
                                        ...defaultOptionStandardDataTable,
                                        textLabels: { body: { noMatch: "ไม่พบข้อมูล" } },
                                    }}
                                    sx={smallSizeFooter}
                                />
                            </Box>
                        </Grid>
                    )}

                    {/* ── ปุ่มแจ้งเคลม ── */}
                    {selectedInsured && (
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="medium"
                                    startIcon={<AddCircleIcon />}
                                    // disabled={!selectedInsured}
                                    onClick={handleAddClaim}
                                >
                                    แจ้งเคลม
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default AddInsuredModal;
