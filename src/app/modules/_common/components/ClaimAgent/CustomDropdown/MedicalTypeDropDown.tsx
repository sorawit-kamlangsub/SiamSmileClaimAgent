// import { useGetMedicaltype } from "../../../../../api/coreClaimMastersApi";
// import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

// type MedicalTypeDropDownProps = Omit<
//     FormikDropdownProps,
//     "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
// > & {
//     filterIds?: number[];
// };

// const MedicalTypeDropDown = ({ formik, filterIds, ...props }: MedicalTypeDropDownProps) => {
//     const { data, isLoading } = useGetMedicaltype(2);

//     let filteredData = filterIds
//         ? data?.data?.filter((item: any) => filterIds.includes(item.medicalTypeId))
//         : data?.data ?? [];

//     if (filterIds) {
//         filteredData = filteredData?.sort(
//             (a: any, b: any) => filterIds.indexOf(a.medicalTypeId) - filterIds.indexOf(b.medicalTypeId)
//         );
//     }

//     return (
//         <FormikDropdown
//             data={filteredData}
//             label="ประเภทการรักษา"
//             fullWidth
//             {...props}
//             formik={formik}
//             valueFieldName="medicalTypeId"
//             displayFieldName="medicalTypeName"
//             isLoading={isLoading}
//         />
//     );
// };

// export default MedicalTypeDropDown;
