import { FocusError, FocusErrorProps } from "focus-formik-error";
import React from "react";

type FormikFocusErrorProps = {
    useFocusError: boolean;
    children?: React.ReactNode;
} & FocusErrorProps;

export const FormikFocusError: React.FC<FormikFocusErrorProps> = ({
    useFocusError = true,
    formik,
    children,
    focusDelay,
}) => {
    return (
        <>
            {useFocusError && children ? (
                <>
                    <FocusError formik={formik} focusDelay={focusDelay} />
                    {children}
                </>
            ) : (
                <>{children}</>
            )}
        </>
    );
};
