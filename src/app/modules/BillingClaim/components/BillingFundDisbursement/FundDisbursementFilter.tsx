import { Button, Grid, Icon, Paper, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FormikProps } from "formik";
import { FormikTextField } from "../../../_common";
import BranchAutocomplete from "../../../_common/components/ClaimAgent/CustomDropdown/ฺBranchAutocomplete";
import FormikAutocompleteApi from "../../../_common/components/CustomFormik/FormikAutocompleteApi";
import { getUserFilter } from "../../../../api/coreClaimMastersApi";
import { productMultipleSelectData } from "../../../ClaimConsider/components/_common/Constant/ConstantValues";
import StatusFilterToggle from "../../../ClaimConsider/components/_common/StatusFilterToggle";
import {
    FundDisbursementFilterValues,
    FUND_CLAIM_TYPE_OPTIONS,
    FUND_SEARCH_BY_OPTIONS,
} from "../../store/fundDisbursement.types";

type FundDisbursementFilterProps = {
    formik: FormikProps<FundDisbursementFilterValues>;
    onSearch: () => void;
    onClear: () => void;
};

type RequiredToggleFieldProps = {
    formik: FormikProps<FundDisbursementFilterValues>;
    name: "claimType" | "productId";
    label: string;
    options: { value: string | number; label: string }[];
};

/** ตัวเลือกแบบปุ่มใหญ่เต็มแถว เลือกได้ 1 ค่า บังคับเลือก — ใช้กับ "ประเภทการเคลม" / "ผลิตภัณฑ์" */
const RequiredToggleField = ({ formik, name, label, options }: RequiredToggleFieldProps) => (
    <>
        <Typography sx={{ fontWeight: 600, mb: 0.75 }}>
            {label}
            <Typography component="span" color="error">
                {" "}
                *
            </Typography>
        </Typography>
        <ToggleButtonGroup
            exclusive
            fullWidth
            color="primary"
            value={formik.values[name]}
            onChange={(_event, value) => {
                if (value !== null) formik.setFieldValue(name, value);
            }}
            sx={{ "& .MuiToggleButton-root": { py: 1.25, fontWeight: 600, textTransform: "none" } }}
        >
            {options.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                    {option.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    </>
);

/**
 * ตัวกรองหน้า "ตั้งเบิกกองทุน" — ประเภทการเคลม/ผลิตภัณฑ์ (บังคับเลือก, ปุ่มใหญ่) ก่อน แล้วสาขา/ผู้ทำรายการ
 * (dropdown ปกติ) แล้วค้นหาจาก (segmented, reuse `StatusFilterToggle`) + คำค้นหา
 *
 * สาขา reuse `BranchAutocomplete` ตรง ๆ, ผู้ทำรายการ reuse master hook `getUserFilter` ผ่าน
 * `FormikAutocompleteApi` ตรง ๆ (ไม่ผ่าน wrapper `UserAutocompleteApi` เพราะ wrapper fix label เป็น
 * "ผู้ให้บริการ" ไว้ ในขณะที่หน้านี้ต้องการ "ผู้ทำรายการ")
 */
const FundDisbursementFilter = ({ formik, onSearch, onClear }: FundDisbursementFilterProps) => {
    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <RequiredToggleField
                        formik={formik}
                        name="claimType"
                        label="ประเภทการเคลม"
                        options={FUND_CLAIM_TYPE_OPTIONS}
                    />
                </Grid>
                {/* <Grid item xs={12} sm={6}>
                    <RequiredToggleField
                        formik={formik}
                        name="productId"
                        label="ผลิตภัณฑ์"
                        options={productMultipleSelectData}
                    />
                </Grid> */}

                <Grid item xs={12} sm={6}>
                    <BranchAutocomplete formik={formik} name="branchId" withAllOption allOptionLabel="ทั้งหมด" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormikAutocompleteApi
                        formik={formik}
                        name="userId"
                        label="ผู้ทำรายการ"
                        useQueryGet={getUserFilter}
                        valueFieldName="userId"
                        displayFieldName="displayName"
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12}>
                    <StatusFilterToggle
                        formik={formik}
                        name="searchBy"
                        label="ค้นหาจาก"
                        options={FUND_SEARCH_BY_OPTIONS}
                    />
                </Grid>

                <Grid item xs={12} sm={8} md={9}>
                    <FormikTextField
                        formik={formik}
                        name="searchDetail"
                        label="คำค้นหา"
                        placeholder="เช่น CL690700001"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSearch();
                        }}
                    />
                </Grid>
                <Grid item xs={6} sm={2} md={1.5} sx={{ display: "flex", alignItems: "center", px: 1 }}>
                    <Button variant="contained" fullWidth onClick={onSearch}>
                        <Icon>search</Icon>
                        &nbsp; ค้นหา
                    </Button>
                </Grid>
                <Grid item xs={6} sm={2} md={1.5} sx={{ display: "flex", alignItems: "center", px: 1 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={onClear}
                        sx={{ borderColor: "#BF360C", color: "#870000", ":hover": { borderColor: "#BF360C" } }}
                    >
                        ล้างค่า
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default FundDisbursementFilter;
