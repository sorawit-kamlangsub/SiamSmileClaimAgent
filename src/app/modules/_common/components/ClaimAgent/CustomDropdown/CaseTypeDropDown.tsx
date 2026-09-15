// import { useGetCaseType } from "../../../../../api/claimAgentMaster";
// import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

// type CaseTypeDropDownProps = Omit<
//     FormikDropdownProps,
//     "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
// > & {
//     filterIds?: number[];
// };

// const CaseTypeDropDown = ({ formik, filterIds, ...props }: CaseTypeDropDownProps) => {
//     const { data, isLoading } = useGetCaseType();

//     let filteredData = filterIds
//         ? data?.data?.filter((item: any) => filterIds.includes(item.caseTypeId))
//         : data?.data ?? [];

//     if (filterIds) {
//         filteredData = filteredData?.sort(
//             (a: any, b: any) => filterIds.indexOf(a.caseTypeId) - filterIds.indexOf(b.caseTypeId)
//         );
//     }

//     return (
//         <FormikDropdown
//             data={filteredData}
//             label="ลักษณะการเคลม"
//             fullWidth
//             {...props}
//             formik={formik}
//             valueFieldName="caseTypeId"
//             displayFieldName="caseTypeName"
//             isLoading={isLoading}
//         />
//     );
// };

// export default CaseTypeDropDown;
