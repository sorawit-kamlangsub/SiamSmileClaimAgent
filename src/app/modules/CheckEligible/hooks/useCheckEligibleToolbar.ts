import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { setSearchCheckeLigibleDetails } from "../store/checkeligibleSlice";
import { FormikErrors, useFormik } from "formik";
import { ContinuousClaimSelection } from "../components/ContinuousClaimDialog";

export type ToolbarFormValues = {
    claimType: number | undefined;
    incidentDate: Dayjs | undefined;
    isContinuous: boolean | undefined;
    claimCause: number | undefined;
    coverageType: number | undefined;
    medicalType: number | undefined;
    causeOfIncident: number | undefined;
    continuousClaim: ContinuousClaimSelection | undefined;
};

const useCheckEligibleToolbar = () => {
    const dispatch = useDispatch();

    const defaultValues: ToolbarFormValues = {
        claimType: undefined,
        incidentDate: dayjs(),
        isContinuous: false,
        claimCause: undefined,
        coverageType: undefined,
        medicalType: undefined,
        causeOfIncident: undefined,
        continuousClaim: undefined,
    };

    const formik = useFormik({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<ToolbarFormValues> = {};
            if (!values.incidentDate) errors.incidentDate = "โปรดระบุ";
            if (!values.claimCause) errors.claimCause = "โปรดระบุ";
            if (!values.coverageType) errors.coverageType = "โปรดระบุ";
            if (values.isContinuous && !values.continuousClaim) {
                errors.continuousClaim = "โปรดเลือกเคลมต่อเนื่อง" as any;
            }
            return errors;
        },
        onSubmit: (values) => {
            const payload: ToolbarFormValues = {
                ...values,
                claimType: values.coverageType,
            };
            dispatch(setSearchCheckeLigibleDetails(payload));
        },
    });

    return { formik };
};
export default useCheckEligibleToolbar;
