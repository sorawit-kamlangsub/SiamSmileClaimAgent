import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux";
import { setInsuredSearchOpen, setSelectedInsured, SelectedInsuredInfo } from "../store/claimSimulateSlice";
import { INSURED_SEARCH_TYPE_OPTIONS } from "../store/claimSimulateOptions";

import { PaginationSortableDto } from "../../_common";
import { FormikErrors, useFormik } from "formik";
import { useGetCustomerSearch } from "../../../api/coreClaimApi";

export interface InsuredSearchFormValues {
    searchTypeId: number;
    searchDetail: string;
}

// ── เกณฑ์ตรวจคำค้นหาตามประเภทที่เลือก (ปรับให้ตรงกับ SearchTypeDropDown ของจริง) ──
const SEARCH_TYPE_RULES: Record<number, (val: string) => boolean> = {
    1: (v) => /^\d{13}$/.test(v), // เลขบัตรประชาชน
    2: () => true, // ชื่อ-นามสกุล freetext
    3: (v) => /^[a-zA-Z0-9]+$/.test(v), // Application ID
};

const SEARCH_TYPE_MESSAGES: Record<number, string> = {
    1: "กรอกได้เฉพาะตัวเลข 13 หลัก",
    2: "",
    3: "กรอกได้เฉพาะตัวเลขและตัวอักษรภาษาอังกฤษ",
};
export const useInsuredSearchModal = () => {
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector((s) => s.claimsimulate.isInsuredSearchOpen);

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [pendingSelection, setPendingSelection] = useState<SelectedInsuredInfo | null>(null);
    const [paginated, setPaginated] = useState<PaginationSortableDto>({ page: 1, recordsPerPage: 10 });
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);

    const defaultValues: InsuredSearchFormValues = {
        searchTypeId: 1,
        searchDetail: "",
    };

    const formik = useFormik<InsuredSearchFormValues>({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<InsuredSearchFormValues> = {};
            if (!values.searchTypeId) errors.searchTypeId = "โปรดระบุ";
            if (!values.searchDetail?.trim()) {
                errors.searchDetail = "โปรดระบุ";
            } else {
                const rule = SEARCH_TYPE_RULES[values.searchTypeId];
                if (rule && !rule(values.searchDetail)) {
                    errors.searchDetail = SEARCH_TYPE_MESSAGES[values.searchTypeId];
                }
            }
            return errors;
        },
        onSubmit: () => {
            setSelectedRowIndex(null);
            setPendingSelection(null);
            setPaginated({ page: 1, recordsPerPage: 10 });
            setIsSearchTriggered(true);
        },
    });

    const { data, isLoading } = useGetCustomerSearch(
        isSearchTriggered,
        formik.values.searchTypeId,
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        formik.values.searchDetail,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );

    const handleClose = () => dispatch(setInsuredSearchOpen(false));

    const handleClear = () => {
        formik.resetForm();
        setSelectedRowIndex(null);
        setPendingSelection(null);
        setIsSearchTriggered(false);
    };

    const handleSelectRow = (rowIndex: number) => {
        const row = data?.data?.[rowIndex];
        if (!row) return;
        setSelectedRowIndex(rowIndex);
        setPendingSelection({
            appId: row.policyCode as string,
            customerName: row.customerName as string,
            plan: row.productName,
            startCoverDate: row.coverageFrom?.toString(),
            cancelDate: row.coverageTo?.toString(),
            company: row.productTypeName,
        });
    };

    const handleConfirmSelection = () => {
        if (!pendingSelection) return;
        dispatch(setSelectedInsured(pendingSelection));
        handleClose();
    };

    return {
        data,
        isOpen,
        formik,
        isLoading,
        isSearchTriggered,
        selectedRowIndex,
        pendingSelection,
        paginated,
        handleClose,
        handleClear,
        handleSelectRow,
        handleConfirmSelection,
        setPaginated,
        searchTypeOptions: INSURED_SEARCH_TYPE_OPTIONS,
    };
};

