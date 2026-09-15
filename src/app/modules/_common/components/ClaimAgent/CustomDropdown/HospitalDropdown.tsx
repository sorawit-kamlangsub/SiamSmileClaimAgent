import { useGetHospitalDetailAllFilter } from "../../../../../api/coreClaimMastersApi";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";
import FormikAutocompleteApi from "../../CustomFormik/FormikAutocompleteApi";

type HospitalDropdownProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName" | "filterSelectedOptions"
>;

const HospitalDropdown = ({ formik, ...props }: HospitalDropdownProps) => {
    return (
        <>
            <FormikAutocompleteApi
                fullWidth
                {...props}
                valueFieldName="organizeId"
                displayFieldName="organizeName"
                useQueryGet={useGetHospitalDetailAllFilter}
                label="สถานพยาบาล "
                formik={formik}
            />
        </>
    );
};

export default HospitalDropdown;
