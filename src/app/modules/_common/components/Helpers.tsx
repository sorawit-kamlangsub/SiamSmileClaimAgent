import dayjs from "dayjs";
import { FieldMetaProps } from "formik";

const handleValidationDateOrTime = (
    formikGetFieldMeta: FieldMetaProps<dayjs.Dayjs | null>,
    textIsValid: string = "กรอกข้อมูลให้ครบถ้วน"
): { error: boolean; helperText: boolean | string } => {
    const { touched, error, value } = formikGetFieldMeta;
    const isValid = dayjs(value).isValid();
    return {
        error: (touched && !!error) || (!isValid && touched),
        helperText: (touched && error) || (!isValid && touched && textIsValid),
    };
};

export { handleValidationDateOrTime };
