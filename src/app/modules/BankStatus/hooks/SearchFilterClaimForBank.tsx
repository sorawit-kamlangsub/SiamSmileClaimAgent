import { useFormik } from "formik";

type FormikSearchDefaultValueType = {
    searchDetail: string | undefined;
};

const useSearchFilterClaimForBank = () => {
    const formik = useFormik<FormikSearchDefaultValueType>({
        initialValues: {
            searchDetail: "",
        },
        onSubmit: (values) => {},
    });
    return { formik };
};

export default useSearchFilterClaimForBank;
