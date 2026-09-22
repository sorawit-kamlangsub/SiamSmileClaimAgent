import { useFormik } from "formik";

type FormikValueType = {
    statusId: number | undefined;
    searchDetail: string;
};
const SearchTransferByStatusHook = () => {
    const defaultValue: FormikValueType = {
        statusId: undefined,
        searchDetail: "",
    };
    const formik = useFormik<FormikValueType>({
        initialValues: defaultValue,
        onSubmit: (values) => {
            console.log(values);
        },
    });
    return { formik };
};

export default SearchTransferByStatusHook;
