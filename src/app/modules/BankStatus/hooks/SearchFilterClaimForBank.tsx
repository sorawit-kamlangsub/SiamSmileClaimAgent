import { useFormik } from "formik";
import { useAppDispatch } from "../../../../redux";
import { setSearchBankStatusBySearchDetail } from "../store/bankStatusCheckSlice";

type FormikSearchDefaultValueType = {
    searchDetail: string | undefined;
};

const useSearchFilterClaimForBank = () => {
    const dispatch = useAppDispatch();
    const formik = useFormik<FormikSearchDefaultValueType>({
        initialValues: {
            searchDetail: "",
        },
        onSubmit: (values) => {
            const payload = {
                searchDetail: values.searchDetail ?? "",
            };
            dispatch(setSearchBankStatusBySearchDetail(payload));
        },
    });
    return { formik };
};

export default useSearchFilterClaimForBank;
