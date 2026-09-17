import { useFormik } from "formik";
import { HospitalPaySettingRow } from "../components/HospitalManagementDataTable";

type Props = {};

const useHospitalManagementDataTableHook = (props: Props) => {
    const formik = useFormik<{ rows: HospitalPaySettingRow[] }>({
        initialValues: { rows: initialRows },
        enableReinitialize: true,
        onSubmit: () => {},
    });

    const rows = formik.values.rows;
    return {};
};

export default useHospitalManagementDataTableHook;
