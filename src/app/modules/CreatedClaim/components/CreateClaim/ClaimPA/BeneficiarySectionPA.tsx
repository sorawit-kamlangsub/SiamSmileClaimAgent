import React from "react";
import { FormikProps } from "formik";
import { Box, Button, Paper, Typography } from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { BeneficiaryCard, BeneficiaryFormikValues } from "../ClaimPH/BeneficiarySectionPH";
import { BeneficiaryForm } from "../../../store/claimPHSlice";
import { addBeneficiary, claimPASelector, removeBeneficiary, updateBeneficiary } from "../../../store/claimPASlice";

interface BeneficiarySectionPAProps {
    formik: FormikProps<BeneficiaryFormikValues>;
}

const BeneficiarySectionPA: React.FC<BeneficiarySectionPAProps> = ({ formik }) => {
    const dispatch = useAppDispatch();
    const { beneficiaries, form } = useAppSelector(claimPASelector);

    const beneficiary = formik.values.beneficiaries;
    const totalAmount = beneficiary.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    const claimAmount = Number(form.transferAmount ?? 0);
    const isAmountMismatch = totalAmount !== claimAmount;
    const DIGIT_ONLY_FIELDS = new Set<keyof BeneficiaryForm>(["citizenId", "phoneNumber", "bankAccountNo"]);

    const sanitizeChanges = (changes: Partial<BeneficiaryForm>): Partial<BeneficiaryForm> => {
        const sanitized: Partial<BeneficiaryForm> = { ...changes };
        Object.keys(sanitized).forEach((key) => {
            const field = key as keyof BeneficiaryForm;
            const value = sanitized[field];
            if (DIGIT_ONLY_FIELDS.has(field) && typeof value === "string") {
                (sanitized as any)[field] = value.replace(/[^\d]/g, "");
            }
        });
        return sanitized;
    };

    const handleChange = (index: number, rawChanges: Partial<BeneficiaryForm>) => {
        const changes = sanitizeChanges(rawChanges);

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

export default BeneficiarySectionPA;
