import React from "react";
import { Box, Card, CardActionArea, Grid, Typography, Skeleton } from "@mui/material";
import { FormikProps } from "formik";

export type ClaimTypeOption = {
    id: number;
    name: string;
    icon: React.ReactElement;
};

type Props = {
    formik: FormikProps<any>;
    options: ClaimTypeOption[];
    idFieldName: string;
    nameFieldName: string;
    isLoading?: boolean;
};

const ClaimTypeSelector: React.FC<Props> = ({ formik, options, idFieldName, nameFieldName, isLoading }) => {
    const selectedId = formik.values[idFieldName];
    const touched = formik.touched[idFieldName];
    const error = formik.errors[idFieldName];

    const hasError = !!touched && !!error;
    const handleSelect = (item: ClaimTypeOption) => {
        formik.setFieldValue(idFieldName, item.id, false);
        formik.setFieldValue(nameFieldName, item.name, false);
        formik.setFieldError(idFieldName, undefined);
    };

    return (
        <Box data-field-name={idFieldName}>
            {isLoading ? (
                <Grid container spacing={2}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Skeleton variant="rounded" height={80} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={2} alignItems="stretch">
                    {options.map((item) => {
                        const isSelected = selectedId === item.id;
                        return (
                            <Grid item xs={12} sm={6} md={3} key={item.id} sx={{ display: "flex" }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        border: hasError ? "1px solid" : undefined,
                                        borderColor: isSelected ? "#02579B" : hasError ? "error.main" : "divider",
                                        background: isSelected
                                            ? "linear-gradient(90deg, #ffffff 0%, #f8fbff 35%, #eef7ff 100%)"
                                            : "transparent",
                                        borderRadius: 2,
                                        transition: "all 0.2s",
                                        width: "100%",
                                    }}
                                >
                                    <CardActionArea onClick={() => handleSelect(item)} sx={{ p: 1.5, height: "100%" }}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 1.5,
                                                    backgroundColor: "#E3F0FB",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {item.icon}
                                            </Box>
                                            <Typography fontWeight={600} fontSize={14}>
                                                {item.name}
                                            </Typography>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
            {/* Cards */}

            {hasError && (
                <Typography color="error" variant="caption" sx={{ display: "block", mt: 0.5, ml: 1.5 }}>
                    {String(error)}
                </Typography>
            )}
        </Box>
    );
};

export default ClaimTypeSelector;
