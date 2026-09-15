import { useFormik } from "formik";

export type ClaimSearchFilterValues = {
    searchBy: string | number;
    searchText: string;
    branch: string | number;
    statusId: string | number;
    transferDateFrom: string;
    transferDateTo: string;
};

const defaultValues: ClaimSearchFilterValues = {
    searchBy: "",
    searchText: "",
    branch: "",
    statusId: "",
    transferDateFrom: "",
    transferDateTo: "",
};
const ClaimSearchFilterFormHook = () => {
    const formik = useFormik<ClaimSearchFilterValues>({
        initialValues: defaultValues,
        onSubmit: (_values) => {},
    });
    return { formik };
};

export default ClaimSearchFilterFormHook;
