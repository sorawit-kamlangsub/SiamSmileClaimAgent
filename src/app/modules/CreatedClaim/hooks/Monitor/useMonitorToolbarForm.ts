import { useFormik, FormikErrors } from "formik";
import { useAppDispatch } from "../../../../../redux";
import { checkeligibleMonitorSearchValuesType, setSearchcheckeligibleMonitor } from "../../store/monitorSlice";

const SEARCH_TYPE_RULES: Record<number, (val: string) => boolean> = {
    1: (v) => /^\d{13}$/.test(v), // บัตรประชาชน
    2: (v) => /^\d{13}$/.test(v), // Passport
    3: () => true, // ชื่อ-นามสกุล freetext
    4: (v) => /^[a-zA-Z0-9]+$/.test(v), // ApplicationID
    5: (v) => /^[a-zA-Z0-9]+$/.test(v), // เลขที่อ้างอิง
};

const SEARCH_TYPE_MESSAGES: Record<number, string> = {
    1: "กรอกได้เฉพาะตัวเลข 13 หลัก",
    2: "กรอกได้เฉพาะตัวเลข 13 หลัก",
    3: "",
    4: "กรอกได้เฉพาะตัวเลขและตัวอักษรภาษาอังกฤษ",
    5: "กรอกได้เฉพาะตัวเลขและตัวอักษรภาษาอังกฤษ",
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
    };

    const formik = useFormik({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<checkeligibleMonitorSearchValuesType> = {};
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
        onSubmit: (values) => {
            dispatch(
                setSearchcheckeligibleMonitor({
                    searchTypeId: values.searchTypeId,
                    searchDetail: values.searchDetail.trim(),
                    dateHappen: values.dateHappen,
                    schoolId: values.schoolId,
                    provinceId: values.provinceId,
                    isAdvancedSearch: values.isAdvancedSearch,
                })
            );
        },
    });

    const handleClear = () => {
        formik.resetForm();
        dispatch(setSearchcheckeligibleMonitor(defaultValues));
    };

    return { formik, handleClear };
};
