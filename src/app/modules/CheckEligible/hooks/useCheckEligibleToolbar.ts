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
                // หมายเหตุ: FormikErrors<T> คาดหวัง error ของ field object เป็น nested object ไม่ใช่ string
                // ใช้ `as any` cast ตรงนี้เพื่อความง่าย เพราะ SearchToolbar เช็ค error นี้แบบตรง ๆ (ไม่ได้ render ผ่าน FormikDropdown)
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
