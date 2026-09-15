import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux";
import { setInsuredSearchOpen, setSelectedInsured } from "../store/claimSimulateSlice";

import { PaginationSortableDto } from "../../_common";
import { FormikErrors, useFormik } from "formik";
import { useGetCustomerSearch } from "../../../api/coreClaimApi";
import { GetCustomerSearchDtoResponse } from "../../../api/coreClaimApi.client";

export interface InsuredSearchFormValues {
    searchTypeId: number;
    searchDetail: string;
}

const SEARCH_TYPE_RULES: Record<number, (val: string) => boolean> = {
    1: (v) => /^[a-zA-Z0-9]+$/.test(v), // Application ID
    2: (v) => /^\d{13}$/.test(v), // เลขบัตรประชาชน
    3: (v) => /^[a-zA-Z0-9]$/.test(v), // Passport
    4: () => true, // ชื่อ-นามสกุล freetext
    5: () => true, // เลขที่อ้างอิง(นักเรียน) freetext
};

const SEARCH_TYPE_MESSAGES: Record<number, string> = {
    1: "กรอกได้เฉพาะตัวเลขและตัวอักษรภาษาอังกฤษ",
    2: "กรอกได้เฉพาะตัวเลข 13 หลัก",
    3: "กรอกได้เฉพาะตัวเลขและตัวอักษรภาษาอังกฤษ",
    4: "",
    5: "",
};
export const useInsuredSearchModal = () => {
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector((s) => s.claimsimulate.isInsuredSearchOpen);

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [pendingSelection, setPendingSelection] = useState<GetCustomerSearchDtoResponse | null>(null);
    const [paginated, setPaginated] = useState<PaginationSortableDto>({ page: 1, recordsPerPage: 5 });
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);

    const [searchParams, setSearchParams] = useState<{
        searchTypeId: number;
        searchDetail: string;
    } | null>(null);

    const defaultValues: InsuredSearchFormValues = {
        searchTypeId: 1,
        searchDetail: "",
    };

    const formik = useFormik<InsuredSearchFormValues>({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<InsuredSearchFormValues> = {};

            if (!values.searchTypeId) {
                errors.searchTypeId = "โปรดระบุ";
            }

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

        onSubmit: (values) => {
            setSelectedRowIndex(null);
            setPendingSelection(null);

            setPaginated({
                page: 1,
                recordsPerPage: 5,
            });

            setSearchParams({
                searchTypeId: values.searchTypeId,
                searchDetail: values.searchDetail.trim(),
            });

            setIsSearchTriggered(true);
        },
    });

    const { data, isLoading } = useGetCustomerSearch(
        isSearchTriggered,
        searchParams?.searchTypeId,
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        searchParams?.searchDetail,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );

    const handleClose = () => {
        dispatch(setInsuredSearchOpen(false));
        formik.resetForm();

        setSelectedRowIndex(null);
        setPendingSelection(null);

        setSearchParams(null);
        setIsSearchTriggered(false);
    };

    const handleClear = () => {
        formik.resetForm();

        setSelectedRowIndex(null);
        setPendingSelection(null);

        setSearchParams(null);
        setIsSearchTriggered(false);
    };

    const handleSelectRow = (rowIndex: number) => {
        const row = data?.data?.[rowIndex];
        if (!row) return;
        setSelectedRowIndex(rowIndex);
        setPendingSelection({
            ...row,
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
    };
};
