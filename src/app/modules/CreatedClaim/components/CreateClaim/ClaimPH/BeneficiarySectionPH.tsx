import React from "react";
import { FormikProps, getIn } from "formik";
import { Box, Button, Chip, Grid, Paper, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import {
    addBeneficiary,
    BeneficiaryForm,
    claimPHSelector,
    removeBeneficiary,
    updateBeneficiary,
} from "../../../store/claimPHSlice";
import TitlePersonDropdown from "../../../../_common/components/ClaimAgent/CustomDropdown/TitlePersonDropdown";
import BankAutocomplete from "../../../../_common/components/ClaimAgent/CustomDropdown/BankAutocomplete";
import { FormikTextNumber } from "../../../../_common";
import RelationTypeDropdown from "../../../../_common/components/ClaimAgent/CustomDropdown/RelationTypeDropdown";

export type BeneficiaryFormikValues = {
    beneficiaries: BeneficiaryForm[];
};

interface BeneficiarySectionPHProps {
    formik: FormikProps<BeneficiaryFormikValues>;
}

interface BeneficiaryCardProps {
    item: BeneficiaryForm;
    index: number;
    formik: FormikProps<BeneficiaryFormikValues>;
    onChange: (index: number, changes: Partial<BeneficiaryForm>) => void;
    onDelete: (index: number) => void;
    canDelete: boolean;
}

export const BeneficiaryCard: React.FC<BeneficiaryCardProps> = ({
    item,
    index,
    formik,
    onChange,
    onDelete,
    canDelete,
}) => {
    const fieldName = (field: keyof BeneficiaryForm) => `beneficiaries.${index}.${field}`;

    const getError = (field: keyof BeneficiaryForm) => {
        const name = fieldName(field);
        const touched = getIn(formik.touched, name);
        const error = getIn(formik.errors, name);

        return {
            error: Boolean(touched && error),
            helperText: touched && error ? error : undefined,
        };
    };

    const setText = (field: keyof BeneficiaryForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(index, { [field]: event.target.value });
    };

    return (
        <CustomPaper>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Typography fontWeight={700} fontSize={15} color="primary.main">
                        ผู้รับผลประโยชน์ ลำดับที่ {index + 1}
                    </Typography>

                    {item.source === "system" && (
                        <Chip
                            label="ข้อมูลจากระบบ"
                            size="small"
                            sx={{
                                bgcolor: "#e0f2f1",
                                color: "teal",
                                fontWeight: 600,
                                fontSize: 12,
                            }}
                        />
                    )}
                </Box>

                {canDelete && (
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => onDelete(index)}
                        disabled={index === 0}
                    >
                        ลบ
                    </Button>
                )}
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <RelationTypeDropdown formik={formik} name={`beneficiaries.${index}.relationTypeId`} required />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        name={fieldName("citizenId")}
                        label="รหัสบัตรประชาชน"
                        size="small"
                        fullWidth
                        required
                        value={item.citizenId ?? ""}
                        onChange={setText("citizenId")}
                        onBlur={formik.handleBlur}
                        inputProps={{ maxLength: 13 }}
                        {...getError("citizenId")}
                    />
                </Grid>

                <Grid item xs={6} sm={3}>
                    <TitlePersonDropdown formik={formik} name={`beneficiaries.${index}.titleId`} required />
                </Grid>

                <Grid item xs={6} sm={3}>
                    <TextField
                        name={fieldName("firstName")}
                        label="ชื่อ"
                        size="small"
                        fullWidth
                        required
                        value={item.firstName ?? ""}
                        onChange={setText("firstName")}
                        onBlur={formik.handleBlur}
                        {...getError("firstName")}
                    />
                </Grid>

                <Grid item xs={6} sm={3}>
                    <TextField
                        name={fieldName("lastName")}
                        label="นามสกุล"
                        size="small"
                        fullWidth
                        required
                        value={item.lastName ?? ""}
                        onChange={setText("lastName")}
                        onBlur={formik.handleBlur}
                        {...getError("lastName")}
                    />
                </Grid>

                <Grid item xs={6} sm={3}>
                    <TextField
                        name={fieldName("phoneNumber")}
                        label="เบอร์โทรศัพท์"
                        size="small"
                        fullWidth
                        required
                        value={item.phoneNumber ?? ""}
                        onChange={setText("phoneNumber")}
                        onBlur={formik.handleBlur}
                        inputProps={{ maxLength: 10 }}
                        {...getError("phoneNumber")}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <BankAutocomplete
                        name={`beneficiaries.${index}.bankId`}
                        formik={formik}
                        fullWidth
                        size="small"
                        required
                        sx={{ mt: 0 }}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <TextField
                        name={fieldName("bankAccountNo")}
                        label="เลขที่บัญชี"
                        size="small"
                        fullWidth
                        required
                        value={item.bankAccountNo ?? ""}
                        onChange={setText("bankAccountNo")}
                        onBlur={formik.handleBlur}
                        {...getError("bankAccountNo")}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <TextField
                        name={fieldName("bankAccountName")}
                        label="ชื่อบัญชี"
                        size="small"
                        fullWidth
                        required
                        value={item.bankAccountName ?? ""}
                        onChange={setText("bankAccountName")}
                        onBlur={formik.handleBlur}
                        {...getError("bankAccountName")}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <FormikTextNumber
                        name={fieldName("amount")}
                        label="จำนวนเงิน"
                        formik={formik}
                        decimalScale={2}
                        allowNegative={false}
                        thousandSeparator
                        suffix=" บาท"
                        required
                    />
                </Grid>
            </Grid>
        </CustomPaper>
    );
};

const BeneficiarySectionPH: React.FC<BeneficiarySectionPHProps> = ({ formik }) => {
    const dispatch = useAppDispatch();
    const { beneficiaries, form } = useAppSelector(claimPHSelector);

    const beneficiary = formik.values.beneficiaries;
    const totalAmount = beneficiary.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    const claimAmount = Number(form.transferAmount ?? 0);
    const isAmountMismatch = totalAmount !== claimAmount;
    const handleChange = (index: number, changes: Partial<BeneficiaryForm>) => {
        // Redux update
        dispatch(updateBeneficiary({ index, changes }));

        // Formik sync เพื่อ validate
        Object.entries(changes).forEach(([field, value]) => {
            formik.setFieldValue(`beneficiaries.${index}.${field}`, value);
        });
    };

    const handleAdd = () => {
        const newBeneficiary: BeneficiaryForm = {
            beneficiaryOrder: beneficiaries.length + 1,
            relationTypeId: undefined,
            titleId: undefined,
            firstName: "",
            lastName: "",
            phoneNumber: "",
            citizenId: "",
            bankId: undefined,
            bankAccountNo: "",
            bankAccountName: "",
            amount: 0,
            percentShare: 0,
            source: "manual",
        };

        // Redux add
        dispatch(addBeneficiary(newBeneficiary));

        // Formik sync
        formik.setFieldValue("beneficiaries", [...formik.values.beneficiaries, newBeneficiary]);
    };

    const handleDelete = (index: number) => {
        // Redux delete
        dispatch(removeBeneficiary(index));

        // Formik sync
        formik.setFieldValue(
            "beneficiaries",
            formik.values.beneficiaries
                .filter((_, itemIndex) => itemIndex !== index)
                .map((item, itemIndex) => ({
                    ...item,
                    beneficiaryOrder: itemIndex + 1,
                }))
        );
    };

    return (
        <Box>
            {beneficiaries.map((item, index) => (
                <BeneficiaryCard
                    key={item.id ?? `beneficiary-${index}`}
                    item={item}
                    index={index}
                    formik={formik}
                    onChange={handleChange}
                    onDelete={handleDelete}
                    canDelete={beneficiaries.length > 1}
                />
            ))}

            <Paper
                variant="outlined"
                sx={{
                    px: 3,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 2,
                    bgcolor: "#f0f7ff",
                }}
            >
                <Typography fontWeight={700} fontSize={15} color={isAmountMismatch ? "error.main" : "text.primary"}>
                    จำนวนเงินโอนรวม:{" "}
                    <Box component="span" color={isAmountMismatch ? "error.main" : "text.primary"}>
                        {totalAmount.toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}{" "}
                        บาท
                    </Box>
                </Typography>

                <Button variant="outlined" color="primary" startIcon={<PersonAddAlt1Icon />} onClick={handleAdd}>
                    เพิ่มผู้รับผลประโยชน์
                </Button>
            </Paper>
        </Box>
    );
};

export default BeneficiarySectionPH;
