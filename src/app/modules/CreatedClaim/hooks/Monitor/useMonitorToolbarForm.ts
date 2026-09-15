import { useFormik, FormikErrors } from "formik";
import { useAppDispatch } from "../../../../../redux";
import {
    checkeligibleMonitorSearchValuesType,
    resetMonitor,
    setSearchcheckeligibleMonitor,
} from "../../store/monitorSlice";

const SEARCH_TYPE_RULES: Record<number, (val: string) => boolean> = {
    1: (v) => /^[a-zA-Z0-9-]+$/.test(v), // ApplicationID
    2: (v) => /^\d{13}$/.test(v), // บัตรประชาชน
    3: () => true, // Passport / G-Code
    4: () => true, // ชื่อ-นามสกุล freetext
    5: (v) => /^\d{10}$/.test(v), // เลขประจำตัวผู้เอาประกัน
};

const SEARCH_TYPE_MESSAGES: Record<number, string> = {
    1: "กรอกได้เฉพาะตัวเลขและตัวอักษรภาษาอังกฤษ",
    2: "กรอกได้เฉพาะตัวเลข 13 หลัก",
    3: "",
    4: "",
    5: "กรอกได้เฉพาะตัวเลข 10 หลัก",
};

export const useMonitorToolbarForm = () => {
    const dispatch = useAppDispatch();

    const defaultValues: checkeligibleMonitorSearchValuesType = {
        searchTypeId: 2,
        searchDetail: "",
        dateHappen: undefined,
        schoolId: undefined,
        provinceId: undefined,
        isAdvancedSearch: false,
        isSearchMonitor: false,
    };

    const formik = useFormik({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<checkeligibleMonitorSearchValuesType> = {};
            const req = "โปรดระบุ";
            if (!values.searchTypeId) errors.searchTypeId = req;
            if (!values.searchDetail?.trim()) {
                errors.searchDetail = req;
            } else {
                const rule = SEARCH_TYPE_RULES[values.searchTypeId];
                if (rule && !rule(values.searchDetail)) {
                    errors.searchDetail = SEARCH_TYPE_MESSAGES[values.searchTypeId];
                }
            }
            if (values.isAdvancedSearch && values.provinceId && !values.schoolId) {
                errors.schoolId = req;
            }

            return errors;
        },
        onSubmit: (values) => {
            dispatch(
                setSearchcheckeligibleMonitor({
                    searchTypeId: values.searchTypeId,
                    searchDetail: values.searchDetail?.trim(),
                    dateHappen: values.dateHappen,
                    schoolId: values.schoolId,
                    provinceId: values.provinceId,
                    isAdvancedSearch: values.isAdvancedSearch,
                    isSearchMonitor: true,
                })
            );
        },
    });

    const handleClear = () => {
        formik.resetForm();
        dispatch(resetMonitor());
    };

    return { formik, handleClear };
};
