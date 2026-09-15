import React from "react";
import { Box, Chip, Skeleton, Typography } from "@mui/material";
import { FormikProps } from "formik";

export type ChipOption = {
    id: number;
    name: string;
};

type Props = {
    formik: FormikProps<any>;
    idFieldName: string;
    nameFieldName: string;
    options: ChipOption[];
    isLoading?: boolean;
};
const ChipSelector: React.FC<Props> = ({ formik, idFieldName, nameFieldName, options, isLoading }) => {
    const selectedId = formik.values[idFieldName];
    const touched = formik.touched[idFieldName];
    const error = formik.errors[idFieldName];
    const hasError = !!touched && !!error;

    const handleSelect = (item: ChipOption) => {
        formik.setValues(
            {
                ...formik.values,
                [idFieldName]: item.id,
                [nameFieldName]: item.name,
            },
            true
        );
    };

    return (
        <Box data-field-name={idFieldName}>
            {/* Chips */}
            <Box display="flex" gap={1} flexWrap="wrap">
                {isLoading ? (
                    <>
                        <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 10 }} />
                        <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 10 }} />
                        <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: 10 }} />
                    </>
                ) : (
                    options.map((item) => {
                        const isSelected = selectedId === item.id;
                        return (
                            <Chip
                                key={item.id}
                                label={item.name}
                                onClick={() => handleSelect(item)}
                                variant={isSelected ? "filled" : "outlined"}
                                sx={{
                                    fontWeight: isSelected ? 700 : 400,
                                    backgroundColor: isSelected ? "#02579B" : "transparent",
                                    color: isSelected ? "white" : "text.primary",
                                    border: hasError ? "1px solid" : undefined,
                                    borderColor: isSelected ? "#02579B" : hasError ? "error.main" : "divider",
                                    fontSize: 14,
                                    px: 1,
                                    "&:hover": {
                                        backgroundColor: isSelected ? "#024a85" : "#f5f5f5",
                                    },
                                }}
                            />
                        );
                    })
                )}
                {}
            </Box>

            {hasError && (
                <Typography color="error" variant="caption" sx={{ display: "block", mt: 0.5, ml: 1.5 }}>
                    {String(error)}
                </Typography>
            )}
        </Box>
    );
};

export default ChipSelector;
