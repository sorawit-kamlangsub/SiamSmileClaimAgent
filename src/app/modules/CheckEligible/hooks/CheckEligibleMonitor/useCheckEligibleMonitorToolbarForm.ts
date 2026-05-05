import { FormikErrors, useFormik } from "formik";
import { useAppDispatch } from "../../../../../redux";
import { setSearchcheckeligibleMonitor } from "../../store/checkeligibleSlice";

export type checkeligibleMonitorSearchValuesType = {
    searchTypeId?: number | undefined;
    searchDetail?: string | undefined;
};

const useCheckEligibleMonitorToolbarForm = () => {
    const dispatch = useAppDispatch();

    const defaultValues: checkeligibleMonitorSearchValuesType = {
        searchTypeId: 1,
        searchDetail: "",
    };

    const formik = useFormik({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<checkeligibleMonitorSearchValuesType> = {};
            if (!values.searchTypeId) errors.searchTypeId = "โปรดระบุ";
            if (!values.searchDetail?.trim()) errors.searchDetail = "โปรดระบุ";
            return errors;
        },
        onSubmit: (values) => {
            const payload: checkeligibleMonitorSearchValuesType = {
                searchTypeId: values.searchTypeId,
                searchDetail: values.searchDetail,
            };
            dispatch(setSearchcheckeligibleMonitor(payload));
        },
    });

    return { formik };
};

export default useCheckEligibleMonitorToolbarForm;
