import React from "react";
import { Grid, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { FormikProps } from "formik";

export interface StatusFilterOption {
    value: string | number;
    label: string;
}

export interface StatusFilterToggleProps<Values> {
    formik: FormikProps<Values>;
    name: keyof Values & string;
    label: string;
    options: StatusFilterOption[];
    onAfterChange?: (value: string | number) => void;
    disabled?: boolean;
}

/**
 * Pill-style single-select status filter, synced to a Formik field.
 *
 * <StatusFilterToggle
 *   formik={formik}
 *   name="statusId"
 *   label="สถานะรายการ"
 *   options={[
 *     { value: 0, label: "ทั้งหมด" },
 *     { value: 1, label: "รอพิจารณา" },
 *     { value: 2, label: "รอเอกสาร" },
 *     { value: 3, label: "รอแก้ไข" },
 *     { value: 4, label: "ปฏิเสธ" },
 *     { value: 5, label: "ยกเลิก" },
 *     { value: 6, label: "อยู่ระหว่างดำเนินการ" },
 *     { value: 7, label: "รอตรวจสอบการแก้ไข" },
 *   ]}
 *   onAfterChange={(value) => refetch({ statusId: value })}
 * />
 */

function StatusFilterToggle<Values>({
    formik,
    name,
    label,
    options,
    onAfterChange,
    disabled,
}: StatusFilterToggleProps<Values>) {
    const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | number | null) => {
        if (newValue === null) {
            return;
        }
        formik.setFieldValue(name, newValue);
        onAfterChange?.(newValue);
    };

    const currentValue = formik.values[name] as unknown as string | number;

    return (
        <Grid
            container
            alignItems="center"
            wrap="nowrap"
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "8px",
                padding: "8px 12px",
                overflowX: "auto",
                backgroundColor: "#FBFDFF",
                py: 2,
            }}
        >
            <Grid
                item
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginRight: "16px",
                    flexShrink: 0,
                }}
            >
                <FilterAltIcon sx={{ fontSize: "18px", color: "#002F6C" }} />
                <Typography sx={{ fontWeight: 600, color: "#002F6C", whiteSpace: "nowrap" }}>{label}</Typography>
            </Grid>

            <ToggleButtonGroup
                exclusive
                value={currentValue}
                onChange={handleChange}
                disabled={disabled}
                sx={{ gap: "8px", flexWrap: "nowrap" }}
            >
                {options.map((option) => (
                    <ToggleButton
                        key={option.value}
                        value={option.value}
                        sx={{
                            textTransform: "none",
                            borderRadius: "20px !important",
                            border: "1px solid #E0E0E0 !important",
                            padding: "6px 18px",
                            fontSize: "0.9rem",
                            color: "#424242",
                            whiteSpace: "nowrap",
                            "&.Mui-selected": {
                                backgroundColor: "#1976D2",
                                color: "#FFFFFF",
                                borderColor: "#1976D2 !important",
                            },
                            "&.Mui-selected:hover": {
                                backgroundColor: "#1565C0",
                            },
                        }}
                    >
                        {option.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Grid>
    );
}

export default StatusFilterToggle;
