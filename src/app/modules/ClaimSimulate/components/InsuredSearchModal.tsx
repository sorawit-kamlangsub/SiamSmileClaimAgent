import React, { useEffect } from "react";

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
    Link,
    Typography,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { MUIDataTableColumn } from "mui-datatables";
import { FormikTextField, StandardDataTable } from "../../_common";
import SearchTypeDropDown from "../../_common/components/ClaimAgent/CustomDropdown/SearchTypeDropDown";
import { cellAlignOptions, defaultOptionStandardDataTable, formatDateString } from "../../../functionHelpers";
import { useInsuredSearchModal } from "../hooks/useInsuredSearchModal";
import LinearLoading from "../../_common/components/CustomComponent/LinearLoading";

const InsuredSearchModal: React.FC = () => {
    const {
        isOpen,
        formik,
        isLoading,
        pendingSelection,
        selectedRowIndex,
        isSearchTriggered,
        data,
        paginated,
        handleClose,
        handleClear,
        handleSelectRow,
        handleConfirmSelection,
        setPaginated,
    } = useInsuredSearchModal();

    useEffect(() => {
        return () => {
            handleClear();
        };
    }, []);

    const columns: MUIDataTableColumn[] = [
        {
            name: "",
            label: "",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (_value, tableMeta) => (
                    <Button
                        variant="contained"
                        size="small"
                        sx={{ backgroundColor: "#02579B", minWidth: 60 }}
                        onClick={() => handleSelectRow(tableMeta.rowIndex)}
                    >
                        เลือก
                    </Button>
                ),
            },
        },
        {
            name: "policyCode",
            label: "AppID",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const value = data?.data?.[tableMeta.rowIndex]?.policyCode;
                    return (
                        <Link
                            href={`/checkeligible/detail/${btoa(value?.toString() || "")}`}
                            target="_blank"
                            underline="hover"
                        >
                            {value}
                        </Link>
                    );
                },
            },
        },
        {
            name: "customerName",
            label: "ชื่อผู้เอาประกัน",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "productTypeName",
            label: "ผลิตภัณฑ์",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "productName",
            label: "แผน",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "coverageFrom",
            label: "วันที่เริ่มคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => formatDateString(value?.toString(), "DD/MM/BBBB"),
            },
        },
        {
            name: "coverageTo",
            label: "วันที่สิ้นสุดความคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? formatDateString(value?.toString(), "DD/MM/BBBB") : "-"),
            },
        },
    ];

    const tableOptions = {
        ...defaultOptionStandardDataTable,
        setRowProps: (_row: any, dataIndex: number) => ({
            style: { backgroundColor: dataIndex === selectedRowIndex ? "#d7f1ff" : undefined },
        }),
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            {/* ── Header ── */}
            <DialogTitle sx={{ pb: 1.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 38, height: 38, bgcolor: "#e8f0fb" }}>
                            <PeopleAltOutlinedIcon sx={{ fontSize: 23, color: "primary.main" }} />
                        </Avatar>
                        <Typography fontWeight={700} fontSize={18}>
                            ค้นหาผู้เอาประกัน
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "white",
                            width: 26,
                            height: 26,
                            "&:hover": { bgcolor: "error.dark" },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>
                <Divider sx={{ mt: 2, mb: 0 }} />
            </DialogTitle>

            <DialogContent>
                {/* ── ฟอร์มค้นหา (formik) ── */}
                <Box
                    mb={2}
                    sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        p: 2.5,
                        bgcolor: "background.paper",
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4} md={3}>
                            <SearchTypeDropDown formik={formik} name="searchTypeId" required />
                        </Grid>
                        <Grid item xs={12} sm={5} md={5}>
                            <FormikTextField formik={formik} name="searchDetail" label="คำค้นหา" fullWidth required />
                        </Grid>
                        <Grid item xs={6} sm={1.5} md={2} mt={{ lg: 0.6 }}>
                            <Button
                                // type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon />}
                                onClick={() => formik.submitForm()}
                                fullWidth
                                sx={{ height: 39, fontWeight: 700 }}
                            >
                                ค้นหา
                            </Button>
                        </Grid>
                        <Grid item xs={6} sm={1.5} md={2} mt={{ lg: 0.6 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<ClearIcon sx={{ fontWeight: 700 }} />}
                                onClick={handleClear}
                                fullWidth
                                sx={{ height: 39, fontWeight: 700 }}
                            >
                                ล้างค่า
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* ── ผลการค้นหา ── */}
                {!isSearchTriggered ? (
                    <Box
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            py: 4,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="body2" color="text.disabled">
                            กรุณากรอกคำค้นหาแล้วกดค้นหา
                        </Typography>
                    </Box>
                ) : (
                    <LinearLoading isLoading={isLoading}>
                        <StandardDataTable
                            name="InsuredSearchTable"
                            title=""
                            data={data?.data || []}
                            isLoading={isLoading}
                            columns={columns}
                            color="primary"
                            columnHeaderAlign="center"
                            setPaginated={setPaginated}
                            paginated={paginated}
                            displayToolbar={false}
                            options={tableOptions}
                        />
                    </LinearLoading>
                )}

                {/* ── ยืนยันการเลือก ── */}
                <Box display="flex" justifyContent="flex-end" mt={2.5}>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!pendingSelection}
                        onClick={handleConfirmSelection}
                        sx={{ borderRadius: 1.5, fontWeight: 600, px: 3, height: 39 }}
                    >
                        ยืนยันการเลือก
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default InsuredSearchModal;
