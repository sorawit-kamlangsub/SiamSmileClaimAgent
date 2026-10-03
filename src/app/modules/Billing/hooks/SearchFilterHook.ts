import dayjs, { Dayjs } from "dayjs";
import { useFormik } from "formik";

export type SearchFilterFormikType = {
    fromDate: Dayjs;
    toDate: Dayjs;
    insuranceId: number | undefined;
    billingStatusId: number | undefined;
    branchId: number | undefined;
    searchByType: number | undefined;
    searchDetail: string;
};

const searchByTypeDropDownDataMock = [
    {
        id: 1,
        label: "สภานพยาบาล",
    },
    {
        id: 2,
        label: "รอบที่วางบิล(BGN)",
    },
    {
        id: 3,
        label: "รหัสรายการ(CPBG)",
    },
];

const currentDate = dayjs();

const defaultValue: SearchFilterFormikType = {
    fromDate: currentDate,
    toDate: currentDate,
    insuranceId: undefined,
    billingStatusId: undefined,
    branchId: undefined,
    searchByType: undefined,
    searchDetail: "",
};

const useSearchFilterHook = () => {
    const formik = useFormik<SearchFilterFormikType>({
        initialValues: defaultValue,
        onSubmit: (values) => {
            console.log(values);
        },
    });
    return { formik, searchByTypeDropDownDataMock };
};

export default useSearchFilterHook;
