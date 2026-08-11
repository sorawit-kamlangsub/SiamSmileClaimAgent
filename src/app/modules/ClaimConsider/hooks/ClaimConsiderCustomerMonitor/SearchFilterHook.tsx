import dayjs, { Dayjs } from "dayjs";
import { FormikErrors, useFormik } from "formik";

export type SearchFilterType = {
    dateType: number | undefined;
    dateFrom: Dayjs | undefined | null;
    dateTo: Dayjs | undefined | null;
    product: number[] | undefined;
    searchFrom: number | undefined;
    searchDetail: string | undefined;
    statusId: number | undefined;
};

const useSearchFilterHook = () => {
    const currentDate = dayjs();
    const defaultValues: SearchFilterType = {
        dateType: 1,
        dateFrom: currentDate,
        dateTo: currentDate,
        product: [],
        searchFrom: undefined,
        searchDetail: "",
        statusId: 0,
    };
    const formik = useFormik<SearchFilterType>({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<SearchFilterType> = {};
            return errors;
        },
        onSubmit: (values) => {},
    });
    return { formik };
};

export default useSearchFilterHook;
