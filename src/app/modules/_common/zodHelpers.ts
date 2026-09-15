import dayjs, { Dayjs } from "dayjs";
import { z } from "zod";
import { validatePhoneNumber, validateThaiCitizenID } from ".";

//#region Private Methods
const validate = <NativeType, SchemaType extends z.ZodType<NativeType> = z.ZodType<NativeType>>(schema: SchemaType) =>
    schema;
//#endregion

//#region Interfaces
//#region Private Interfaces
/**
 * ฟังก์ชัน helper
 */
interface ZodTypes {
    /**
     * Function ทั่วไป สำหรับจัดการ zod
     */
    helpers: {
        /**
         * ฟังก์ชันแปลงวันที่จากรูปแบบ string ของ C# เป็น Day.js object
         * @param schema - z.Object ของ zod
         * @param initialValues - กำหนดค่าเริ่มต้นสำหรับนำไปใช้งานใน Formik
         * @param isValidate - ต้องการ Validate type (Optional) Default: true
         * @returns object ประกอบด้วย:
         *   * schema: z.Object ของ zod
         *   * defaultValue: ข้อมูลสำหรับนำไปใช้งานใน initialValues ของ Formik หรืออื่น ๆ
         */
        zodInitLazy: <T extends z.ZodType>(
            schema: T,
            initialValues: Partial<z.infer<T>>,
            isValidate: boolean
        ) => {
            schema: T;
            defaultValue: z.infer<T>;
        };
    };
    dayjs: (errorMessage?: string) => z.ZodType<Dayjs>;
    string: {
        isThaiCitizenID: ({ errorMessage }?: { errorMessage?: string }) => z.ZodEffects<z.ZodString, string, string>;
        isPhoneNumber: ({ errorMessage }?: { errorMessage?: string }) => z.ZodEffects<z.ZodString, string, string>;
    };
    number: {
        coerce: ({ errorMessage }?: { errorMessage: string }) => z.ZodNumber;
        supportDropdown: ({
            numberErrorMessage,
            requiredMessage,
        }?: {
            numberErrorMessage?: string;
            requiredMessage?: string;
        }) => any;
    };
    boolean: {
        required: ({ errorMessage, isValue }?: { errorMessage?: string; isValue?: boolean }) => z.ZodLiteral<boolean>;
    };
    addIssue: {
        custom: (ctx: z.RefinementCtx, message: string, path?: string[], fatal?: boolean) => void;
    };
}
//#endregion
//#endregion

//#region Core functions
/**
 * Process
 */
export const zodTypes: ZodTypes = {
    helpers: {
        zodInitLazy: <T extends z.ZodType>(
            schema: T,
            initialValues: Partial<z.infer<T>>,
            isValidate: boolean = true
        ): {
            schema: T;
            defaultValue: z.infer<T>;
        } => {
            if (isValidate) schema = validate(schema);
            const defaultValue: z.infer<typeof schema> = { ...initialValues };

            return {
                schema: schema,
                defaultValue: defaultValue,
            };
        },
    },
    dayjs: (errorMessage: string = "รูปแบบวันที่ไม่ถูกต้อง"): z.ZodType<Dayjs> =>
        z
            .custom<Dayjs>((value: any) => {
                return value ? dayjs(value).local().isValid() : false;
            }, errorMessage)
            .transform((value: any) => {
                return dayjs(value).local();
            }),

    string: {
        isThaiCitizenID: ({ errorMessage = "กรุณาระบุข้อมูลให้ถูกต้อง" }: { errorMessage?: string } = {}) =>
            z.coerce
                .string()
                .trim()
                .refine((value: string) => validateThaiCitizenID(value), { message: errorMessage }),

        isPhoneNumber: ({ errorMessage = "กรุณาระบุข้อมูลให้ถูกต้อง" }: { errorMessage?: string } = {}) =>
            z.coerce
                .string()
                .trim()
                .refine((value: string) => validatePhoneNumber(value), { message: errorMessage }),
    },

    number: {
        coerce: ({ errorMessage = "กรุณาระบุข้อมูลให้ถูกต้อง" }: { errorMessage?: string } = {}): z.ZodNumber =>
            z.coerce.number({ invalid_type_error: errorMessage }),

        supportDropdown: ({
            numberErrorMessage = "กรุณาระบุข้อมูลให้ถูกต้อง",
            requiredMessage = "กรุณาเลือกข้อมูลอย่างน้อย 1 รายการ",
        }: { numberErrorMessage?: string; requiredMessage?: string } = {}): any => {
            return z.coerce
                .number({ invalid_type_error: numberErrorMessage })
                .min(1, requiredMessage)
                .nullable()
                .transform((value) => value ?? undefined);
        },
    },

    boolean: {
        required: ({
            errorMessage = "กรุณาเลือกข้อมูล",
            isValue = true,
        }: { errorMessage?: string; isValue?: boolean } = {}): z.ZodLiteral<boolean> =>
            z.literal<boolean>(isValue, {
                errorMap: () => ({ message: errorMessage }),
            }),
    },
    addIssue: {
        custom: (ctx: z.RefinementCtx, message: string, path?: string[], fatal?: boolean) => {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: message,
                path: path,
                fatal: fatal,
            });
        },
    },
};
//#endregion
