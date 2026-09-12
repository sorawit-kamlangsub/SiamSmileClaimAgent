import React, { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PersonIcon from "@mui/icons-material/Person";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { MUIDataTableColumn } from "mui-datatables";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import {
    claimPASelector,
    LocalClaimEntry,
    resetClaimForm,
    setEditingItemId,
    setPendingInsured,
    setTmpClaimItem,
} from "../../../store/claimPASlice";
import { cellAlignOptions, defaultOptionStandardDataTable, formatDateString } from "../../../../../functionHelpers";
import { FormikDropdown, FormikTextField, StandardDataTable } from "../../../../_common";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PaginationSortableDto } from "../../../../_common/types";
import { useGetClaimHistory, useGetCustomerSearchByPolicyCode } from "../../../../../api/coreClaimApi";
import { GetCustomerSearchByPolicyCodeDtoResponse } from "../../../../../api/coreClaimApi.client";
import LinearLoading from "../../../../_common/components/CustomComponent/LinearLoading";
import { generateTempId } from "../../../hooks/CreateClaim/ClaimPA/useClaimPAForm";

interface InsuredDetailItem {
    label: string;
    value: string;
}

interface SearchResult {
    id: number;
    appId: string;
    customerName: string;
    idCardNo: string;
    insuredType: string;
    plan: string;
    startCoverDate?: dayjs.Dayjs;
    endCoverDate?: dayjs.Dayjs;
    coverageStatus: string;
    productLabel: string;
    extraDetails?: InsuredDetailItem[];
    customerCode?: string; // เพิ่ม
    productId?: number; // เพิ่ม
    productCategoryCode?: string; // เพิ่ม
    memberNo?: string; // เพิ่ม
}

interface Props {
    open: boolean;
    onClose: () => void;
    currentItemCount: number; // เพื่อคำนวณ seq
}

const mapCoverageStatus = (appStatusId?: number) => (appStatusId === 1 ? "คุ้มครอง" : "ไม่คุ้มครอง");

const mapToSearchResult = (dto: GetCustomerSearchByPolicyCodeDtoResponse): SearchResult => {
    const extraDetails: InsuredDetailItem[] = [
        { label: "สถานศึกษา", value: dto.schoolName || "-" },
        { label: "เลขบัตรประกันนักเรียน", value: dto.memberNo || "-" },
        //{ label: "เบอร์โทรศัพท์", value: dto.mobilePhoneNumber || "-" },
    ];

    return {
        id: dto.id ?? 0,
        appId: dto.policyCode ?? "",
        customerName: dto.customerName ?? "",
        idCardNo: dto.cardDetail ?? "",
        insuredType: dto.productCategoryName ?? dto.productTypeName ?? "-",
        plan: dto.productName ?? "-",
        startCoverDate: dto.coverageFrom,
        endCoverDate: dto.coverageTo,
        coverageStatus: mapCoverageStatus(dto.appStatusId),
        productLabel: [dto.productTypeName, dto.productCategoryName].filter(Boolean).join(" ") || "-",
        extraDetails,
        customerCode: dto.customerCode,
        productId: dto.productId,
        productCategoryCode: dto.productCategoryCode,
        memberNo: dto.memberNo,
    };
};

const cardSx = {
    border: "1px solid #d9e6f5",
    borderRadius: 2,
    overflow: "hidden",
} as const;

const searchTypeData = [
    { searchTypeId: 1, searchTypeName: "เลขบัตรประชาชน" },
    { searchTypeId: 2, searchTypeName: "ชื่อ-นามสกุล(ผู้เอาประกัน)" },
    { searchTypeId: 3, searchTypeName: "เลขประจำตัวผู้เอาประกัน" },
];

const AddInsuredModal: React.FC<Props> = ({ open, onClose }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { insured } = useAppSelector(claimPASelector);
    const [selectedInsured, setSelectedInsured] = useState<SearchResult | null>(null);
    const [submittedSearch, setSubmittedSearch] = useState<{ searchIndex: number; searchDetail: string } | null>(null);
    const hasSearched = submittedSearch !== null;

    const formik = useFormik({
        initialValues: { searchBy: 2, keyword: "" },
        validate: (v) => {
            const e: any = {};
            if (!v.searchBy) e.searchBy = "โปรดระบุ";
            if (!v.keyword.trim()) e.keyword = "โปรดระบุ";
            return e;
        },
        onSubmit: (values) => {
            setSubmittedSearch({ searchIndex: values.searchBy, searchDetail: values.keyword });
            setSelectedInsured(null);
            setSearchPaginated({ page: 1, recordsPerPage: 10 });
        },
    });

    const [searchPaginated, setSearchPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });

    const { data: searchResponse, isFetching: isSearchLoading } = useGetCustomerSearchByPolicyCode(
        insured?.policyCode,
        submittedSearch?.searchIndex,
        submittedSearch?.searchDetail,
        searchPaginated.orderingField,
        searchPaginated.ascendingOrder,
        searchPaginated.page,
        searchPaginated.recordsPerPage
    );
    const searchResults: SearchResult[] = (searchResponse?.data ?? []).map(mapToSearchResult);
    const searchTotalCount = searchResponse?.data?.[0]?.totalCount ?? searchResults.length;

    const [historyPaginated, setHistoryPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });

    const { data: claimHistoryResponse, isLoading: isClaimHistoryLoading } = useGetClaimHistory(
        selectedInsured?.appId,
        undefined,
        historyPaginated.orderingField,
        historyPaginated.ascendingOrder,
        historyPaginated.page,
        historyPaginated.recordsPerPage
    );
    const claimHistoryItems = claimHistoryResponse?.data ?? [];
    const claimHistoryTotalCount = claimHistoryItems[0]?.totalCount ?? claimHistoryItems.length;

    const handleSelect = (result: SearchResult) => {
        setSelectedInsured(result);
        setHistoryPaginated({ page: 1, recordsPerPage: historyPaginated.recordsPerPage ?? 10 });
    };

    const handleAddClaim = () => {
        if (!selectedInsured) return;

        const tempClaimId = generateTempId();

        dispatch(setEditingItemId(null));

        dispatch(
            setPendingInsured({
                customerId: selectedInsured.id,
                customerName: selectedInsured.customerName,
                policyCode: selectedInsured.appId,
                cardTypeId: 2,
                cardDetail: selectedInsured.idCardNo,
                productName: selectedInsured.plan,
                productCategoryName: selectedInsured.insuredType,
                customerCode: selectedInsured.customerCode,
                productId: selectedInsured.productId,
                productCategoryCode: selectedInsured.productCategoryCode,
                memberNo: selectedInsured.memberNo,
                tempClaimId,
            } as any)
        );

        const stubClaim: LocalClaimEntry = {
            tempClaimId,
            applicationId: selectedInsured.appId,
            policyNo: undefined,
            certificateNo: undefined,
            customerId: selectedInsured.id,
            customerName: selectedInsured.customerName,
            incidentTypeId: undefined,
            incidentDate: undefined,
            accidentPlace: undefined,
            accidentDescription: undefined,
        };
        dispatch(setTmpClaimItem([stubClaim]));

        dispatch(resetClaimForm());

        navigate(-1);
        handleClose();
    };

    const handleClose = () => {
        formik.resetForm();
        setSubmittedSearch(null);
        setSelectedInsured(null);
        onClose();
    };

    // ── columns: ผลการค้นหา ──
    const searchColumns: MUIDataTableColumn[] = [
        {
            name: "customerName",
            label: "ผู้เอาประกัน",
            options: {
                ...cellAlignOptions({ align: "left" }),
                customBodyRenderLite: (i) => {
                    const result = searchResults[i];
                    return (
                        <Box display="flex" alignItems="center" gap={1.5} py={0.5}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                <PersonIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize={14}>
                                    {result.customerName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    เลขบัตรประชาชน {result.idCardNo}
                                </Typography>
                            </Box>
                        </Box>
                    );
                },
            },
        },
        {
            name: "insuredType",
            label: "ประเภท",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRenderLite: (i) => <Chip size="small" color="info" label={searchResults[i].insuredType} />,
            },
        },
        {
            name: "plan",
            label: "แผน",
            options: { ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "startCoverDate",
            label: "เริ่มคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (v) => (v ? formatDateString(v, "DD/MM/BBBB") : "-"),
            },
        },
        {
            name: "endCoverDate",
            label: "สิ้นสุดคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (v) => (v ? formatDateString(v, "DD/MM/BBBB") : "-"),
            },
        },
        {
            name: "appId",
            label: "ดำเนินการ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRenderLite: (i) => {
                    const result = searchResults[i];
                    const isSelected = selectedInsured?.appId === result.appId;
                    return (
                        <Button
                            size="small"
                            variant="contained"
                            color={isSelected ? "success" : "primary"}
                            startIcon={isSelected ? <CheckCircleIcon fontSize="small" /> : undefined}
                            onClick={() => handleSelect(result)}
                            sx={{ minWidth: 100 }}
                        >
                            {isSelected ? "เลือกแล้ว" : "เลือก"}
                        </Button>
                    );
                },
            },
        },
    ];

    // ── columns: ประวัติการเคลม ──
    const historyColumns: MUIDataTableColumn[] = [
        {
            name: "claimNo",
            label: "ClaimCase",
            options: { ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "lastestChiefComplaint",
            label: "อาการ/สาเหตุล่าสุด",
            options: {
                ...cellAlignOptions({ align: "left" }),
                customBodyRenderLite: (i) =>
                    claimHistoryItems[i].lastestChiefComplaint ?? claimHistoryItems[i].icD10Detail ?? "-",
            },
        },
        {
            name: "incidentDate",
            label: "วันที่เกิดเหตุ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (v) => (v ? formatDateString(v, "DD/MM/BBBB") : "-"),
            },
        },
        {
            name: "totalCaseAmount",
            label: "ยอดเบิก",
            options: {
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (v) => Number(v ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "paidAmount",
            label: "ยอดจ่าย",
            options: {
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (v) => Number(v ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
    ];

    return (
        <Dialog
            open={open}
            fullScreen={fullScreen}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflowY: "hidden" } }}
        >
            <DialogTitle>
                <Grid container alignItems="center" justifyContent="space-between" flexWrap="nowrap">
                    <Box display="flex" alignItems="flex-start" gap={1.5}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#DCEFFC" }}>
                            <PersonSearchIcon sx={{ fontSize: 24, color: "primary.main" }} />
                        </Avatar>
                        <Box>
                            <Typography fontWeight={700}>ค้นหาผู้เอาประกัน</Typography>
                            <Typography variant="body2" color="text.secondary">
                                ค้นหาและตรวจสอบสิทธิ์ก่อนเพิ่มผู้เอาประกันในรายการเคลม
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "common.white",
                            width: 30,
                            height: 30,
                            flexShrink: 0,
                            "&:hover": { bgcolor: "error.dark" },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Grid>
            </DialogTitle>
            <Divider />

            <DialogContent>
                {/* ── เงื่อนไขการค้นหา ── */}
                <Box sx={cardSx} mb={2}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ bgcolor: "#f3f7fc", px: 2, py: 1 }}>
                        <ManageSearchIcon fontSize="small" color="primary" />
                        <Typography fontWeight={700} fontSize={15}>
                            เงื่อนไขการค้นหา
                        </Typography>
                    </Box>
                    <Grid container spacing={2} p={2}>
                        <Grid item xs={12} sm={4} md={3}>
                            <FormikDropdown
                                label="ค้นหาจาก"
                                fullWidth
                                data={searchTypeData}
                                formik={formik}
                                valueFieldName="searchTypeId"
                                displayFieldName="searchTypeName"
                                name="searchBy"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={7}>
                            <FormikTextField
                                name="keyword"
                                label="คำค้นหา *"
                                placeholder="ระบุเลขบัตรประชาชน หรือชื่อ-สกุล"
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
                    </Grid>
                </Box>

                {/* ── ผลการค้นหา + ข้อมูลเพิ่มเติมของผู้ที่เลือก (การ์ดเดียวกัน) ── */}
                {hasSearched && (
                    <LinearLoading isLoading={isSearchLoading}>
                        <Box sx={cardSx} mb={2}>
                            <StandardDataTable
                                name="InsuredSearchTable"
                                title=""
                                data={searchResults}
                                isLoading={isSearchLoading}
                                columns={searchColumns}
                                color="primary"
                                columnHeaderAlign="center"
                                displayToolbar={false}
                                paginated={{
                                    totalAmountRecords: searchTotalCount,
                                    currentPage: searchPaginated.page,
                                    recordsPerPage: searchPaginated.recordsPerPage ?? 5,
                                }}
                                setPaginated={setSearchPaginated}
                                rowsPerPage={[10]}
                                options={{
                                    ...defaultOptionStandardDataTable,
                                    textLabels: { body: { noMatch: "ไม่พบข้อมูล" } },
                                }}
                            />
                        </Box>
                    </LinearLoading>
                )}

                {/* ── ข้อมูลความคุ้มครองของผู้เอาประกันที่เลือก ── */}
                {selectedInsured && (
                    <Box sx={cardSx} mb={2}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ bgcolor: "#eaf2fc", px: 2, py: 1.25 }}>
                            <CheckCircleIcon fontSize="small" color="primary" />
                            <Typography fontWeight={700} fontSize={15} color="primary.dark">
                                ข้อมูลความคุ้มครองของผู้เอาประกันที่เลือก
                            </Typography>
                        </Box>
                        <Grid container spacing={2} sx={{ px: 2, py: 2 }}>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="body2" color="text.secondary" mb={0.5}>
                                    สถานะความคุ้มครอง
                                </Typography>
                                <Typography
                                    fontWeight={700}
                                    color={
                                        selectedInsured.coverageStatus === "คุ้มครอง" ? "success.main" : "error.main"
                                    }
                                >
                                    {selectedInsured.coverageStatus}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="body2" color="text.secondary" mb={0.5}>
                                    ผลิตภัณฑ์
                                </Typography>
                                <Typography fontWeight={700} color="primary.dark">
                                    {selectedInsured.productLabel}
                                </Typography>
                            </Grid>
                            {selectedInsured.extraDetails?.map((detail, dIdx) => (
                                <Grid item xs={6} sm={3} key={dIdx}>
                                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                                        {detail.label}
                                    </Typography>
                                    <Typography fontWeight={700} color="primary.dark">
                                        {detail.value}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* ── ประวัติการเคลม ── */}
                {selectedInsured && (
                    <Box sx={cardSx} mb={2}>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ bgcolor: "#f3f7fc", px: 2, py: 1 }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                <HistoryIcon fontSize="small" color="primary" />
                                <Typography fontWeight={700} fontSize={15}>
                                    ประวัติการเคลม
                                </Typography>
                            </Box>
                            <Chip size="small" color="primary" label={`${claimHistoryTotalCount} รายการ`} />
                        </Box>

                        {!isClaimHistoryLoading && claimHistoryTotalCount === 0 ? (
                            <LinearLoading isLoading={isClaimHistoryLoading}>
                                <Box py={4} textAlign="center" color="text.secondary">
                                    <Inventory2OutlinedIcon sx={{ fontSize: 32, color: "#c7d3e0" }} />
                                    <Typography fontSize={14} color="text.secondary" mt={0.5}>
                                        ไม่พบประวัติการเคลมของผู้เอาประกันรายนี้
                                    </Typography>
                                </Box>
                            </LinearLoading>
                        ) : (
                            <LinearLoading isLoading={isClaimHistoryLoading}>
                                <StandardDataTable
                                    name="InsuredClaimHistoryTable"
                                    title=""
                                    data={claimHistoryItems}
                                    isLoading={isClaimHistoryLoading}
                                    columns={historyColumns}
                                    color="primary"
                                    columnHeaderAlign="center"
                                    displayToolbar={false}
                                    paginated={{
                                        totalAmountRecords: claimHistoryTotalCount,
                                        currentPage: historyPaginated.page,
                                        recordsPerPage: historyPaginated.recordsPerPage ?? 5,
                                    }}
                                    setPaginated={setHistoryPaginated}
                                    rowsPerPage={[10, 20, 50]}
                                    options={{
                                        ...defaultOptionStandardDataTable,
                                        textLabels: { body: { noMatch: "ไม่พบข้อมูล" } },
                                    }}
                                />
                            </LinearLoading>
                        )}
                    </Box>
                )}

                {/* ── ยืนยัน / แจ้งเคลม ── */}
                {selectedInsured && (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        gap={1.5}
                        sx={{ bgcolor: "#eaf8ee", border: "1px solid #bfe6c9", borderRadius: 2, px: 2, py: 1.5 }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography fontWeight={600} color="success.dark" fontSize={14}>
                                ตรวจสอบสิทธิ์และข้อมูลผู้เอาประกันแล้ว
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="success"
                            size="medium"
                            startIcon={<AddCircleIcon />}
                            onClick={handleAddClaim}
                        >
                            แจ้งเคลม
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AddInsuredModal;
