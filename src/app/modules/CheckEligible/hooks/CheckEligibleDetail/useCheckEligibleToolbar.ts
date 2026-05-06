import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { ClaimType, setSearchCheckeLigibleDetails } from "../../store/checkeligibleSlice";
import { FormikErrors, useFormik } from "formik";
export type ToolbarFormValues = {
    claimType: ClaimType;
    incidentDate: Dayjs | undefined | null;
    isContinuous: boolean;
};

const useCheckEligibleToolbar = () => {
    const dispatch = useDispatch();

    const defaultValues: ToolbarFormValues = {
        claimType: "",
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
