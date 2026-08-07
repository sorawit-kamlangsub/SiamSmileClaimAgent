import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type SearchTypeDropDownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
> & {
    filterIds?: number[];
};

const searchTypeData = [
    { searchTypeId: 1, searchTypeName: "ApplicationID" },
    { searchTypeId: 2, searchTypeName: "เลขบัตรประชาชน" },
    { searchTypeId: 3, searchTypeName: "Passport / G-Code" },
    { searchTypeId: 4, searchTypeName: "ชื่อ-นามสกุล(ผู้เอาประกัน)" },
    { searchTypeId: 5, searchTypeName: "เลขประจำตัวผู้เอาประกัน" },
];
const SearchTypeDropDown = ({ formik, filterIds, ...props }: SearchTypeDropDownProps) => {
    let filteredData = filterIds
        ? searchTypeData?.filter((item: any) => filterIds.includes(item.searchTypeId))
        : searchTypeData ?? [];

    if (filterIds) {
        filteredData = filteredData?.sort(
            (a: any, b: any) => filterIds.indexOf(a.searchTypeId) - filterIds.indexOf(b.searchTypeId)
        );
    }

    return (
        <FormikDropdown
            data={filteredData}
            label="ค้นหาจาก"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="searchTypeId"
            displayFieldName="searchTypeName"
            isLoading={false}
        />
    );
};

export default SearchTypeDropDown;
