import { useGetPatienttype } from "../../../../../api/coreClaimMastersApi";
import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type PatienttypeDropDownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
> & {
    filterIds?: number[];
};

const PatienttypeDropDown = ({ formik, filterIds, ...props }: PatienttypeDropDownProps) => {
    const { data, isLoading } = useGetPatienttype();

    let filteredData = filterIds
        ? data?.data?.filter((item: any) => filterIds.includes(item.patientTypeId))
        : data?.data ?? [];

    if (filterIds) {
        filteredData = filteredData?.sort(
            (a: any, b: any) => filterIds.indexOf(a.patientTypeId) - filterIds.indexOf(b.patientTypeId)
        );
    }

    return (
        <FormikDropdown
            data={filteredData}
            label="ลักษณะการเคลม"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="patientTypeId"
            displayFieldName="patientTypeName"
            isLoading={isLoading}
        />
    );
};

export default PatienttypeDropDown;
