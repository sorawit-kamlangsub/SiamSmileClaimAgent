import React, { useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useFormik } from "formik";
import { MUIDataTableColumn } from "mui-datatables";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { ClaimLineInsured, setSearchResults, setSelectedInsured } from "../../store/claimLineSlice";
import { mockInsuredSearchResults } from "../../store/mockClaimLine";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../../functionHelpers";
import { StandardDataTable } from "../../../_common";
import { FormikDropdown, FormikTextField } from "../../../_common";

const SEARCH_BY_OPTIONS = [
    { value: "appId", label: "Application ID" },
    { value: "nationalId", label: "เลขบัตรประชาชน" },
    { value: "name", label: "ชื่อ-นามสกุล" },
];

interface Props {
    onSelected: () => void;
}

const ClaimLineSearch: React.FC<Props> = ({ onSelected }) => {
    const dispatch = useAppDispatch();
    const { searchResults } = useAppSelector((s) => s.claimline);
    const [hasSearched, setHasSearched] = useState(false);

    const formik = useFormik({
        initialValues: { searchBy: "appId", keyword: "" },
        validate: (v) => {
            const e: any = {};
            if (!v.searchBy) e.searchBy = "โปรดระบุ";
            if (!v.keyword.trim()) e.keyword = "โปรดระบุ";
            return e;
        },
        onSubmit: (values) => {
            // TODO: เรียก API จริงโดยส่ง values.searchBy + values.keyword
            dispatch(setSearchResults(mockInsuredSearchResults));
            setHasSearched(true);
        },
    });

    const handleSelect = (item: ClaimLineInsured) => {
        dispatch(setSelectedInsured(item));
        onSelected();
    };

    const columns: MUIDataTableColumn[] = [
        {
            name: "appId",
            label: "App ID",
            options: { ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "prefix",
            label: "คำนำหน้า",
            options: { ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "firstName",
            label: "ชื่อ",
            options: { ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "lastName",
            label: "นามสกุล",
            options: { ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "nationalId",
            label: "เลขบัตรประชาชน",
            options: { ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "plan",
            label: "แผน",
            options: { ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "status",
            label: "สถานะ",
            options: { ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "startCoverDate",
            label: "เริ่มคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (v) => (v ? formatDateString(v, "DD/MM/BBBB") + " 00:00:00" : "-"),
            },
        },
        {
            name: "cancelDate",
            label: "วันที่ยกเลิก",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (v) => (v ? formatDateString(v, "DD/MM/BBBB") : "-"),
            },
        },
        {
            name: "company",
            label: "บริษัทประกัน",
            options: { ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "",
            label: "action",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRenderLite: (i) => {
                    const item = searchResults[i];
                    return (
                        <Button variant="contained" size="small" color="primary" onClick={() => handleSelect(item)}>
                            คำนวณ
                        </Button>
                    );
                },
            },
        },
    ];

    return (
        <Box component="form" onSubmit={formik.handleSubmit}>
            {/* ── Search Bar ── */}
            <Grid container spacing={2} alignItems="flex-start" mb={2}>
                <Grid item xs={12} sm={4} md={3}>
                    <FormikDropdown
                        name="searchBy"
                        label="ค้นหาจาก"
                        formik={formik}
                        data={SEARCH_BY_OPTIONS}
                        firstItemText="-- เลือก --"
                        displayFieldName="label"
                        valueFieldName="value"
                        fullWidth
                        size="small"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={7}>
                    <FormikTextField
                        name="keyword"
                        label="กรอกได้เฉพาะตัวเลข และตัวอักษร"
                        formik={formik}
                        size="small"
                        fullWidth
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === "Enter") formik.handleSubmit();
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={2} md={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SearchIcon />}
                        fullWidth
                        size="large"
                        disabled={formik.isSubmitting}
                    >
                        ค้นหา
                    </Button>
                </Grid>
            </Grid>

            {/* ── ตารางผลลัพธ์ ── */}
            {hasSearched && (
                <StandardDataTable
                    name="ClaimLineSearchTable"
                    title=""
                    data={searchResults}
                    isLoading={false}
                    columns={columns}
                    color="primary"
                    columnHeaderAlign="center"
                    displayToolbar={false}
                    options={{
                        ...defaultOptionStandardDataTable,
                        textLabels: { body: { noMatch: "ไม่พบข้อมูล" } },
                    }}
                    sx={smallSizeFooter}
                />
            )}
        </Box>
    );
};

export default ClaimLineSearch;
