import { useFormik } from "formik";

type FormikSearchDefaultValueType = {
    searchDetail: string | undefined;
};

const useSearchFilterHook = () => {
    const formik = useFormik<FormikSearchDefaultValueType>({
        initialValues: {
            searchDetail: "",
        },
        onSubmit: (_values) => {},
    });
    return { formik };
};

export default useSearchFilterHook;
