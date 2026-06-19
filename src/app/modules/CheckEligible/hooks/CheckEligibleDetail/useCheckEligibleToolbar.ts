import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { setSearchCheckeLigibleDetails } from "../../store/checkeligibleSlice";
import { FormikErrors, useFormik } from "formik";
export type ToolbarFormValues = {
    claimType: number | undefined;
    incidentDate: Dayjs | undefined;
    isContinuous: boolean | undefined;
};

const useCheckEligibleToolbar = () => {
    const dispatch = useDispatch();

    const defaultValues: ToolbarFormValues = {
        claimType: undefined,
        incidentDate: dayjs(),
        isContinuous: false,
    };

    const formik = useFormik({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<ToolbarFormValues> = {};
            if (!values.claimType) errors.claimType = "โปรดระบุ";
            if (!values.incidentDate) errors.incidentDate = "โปรดระบุ";
            return errors;
        },
        onSubmit: (values) => {
            const payload: ToolbarFormValues = {
                claimType: values.claimType,
                incidentDate: values.incidentDate,
                isContinuous: values.isContinuous,
            };
            dispatch(setSearchCheckeLigibleDetails(payload));
        },
    });

    return { formik };
};
export default useCheckEligibleToolbar;
