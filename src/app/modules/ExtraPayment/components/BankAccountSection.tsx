import React from "react";
import { Stack } from "@mui/material";
import { BankAccountCard } from "./BankAccountCard";
import { BankAccount } from "../store/ExtraPayment.types";

interface BankAccountSectionProps {
    bankAccounts: BankAccount[];
    selectedBankAccountId: number | null;
    onSelectBank: (id: number) => void;
}

export const BankAccountSection: React.FC<BankAccountSectionProps> = ({
    bankAccounts,
    selectedBankAccountId,
    onSelectBank,
}) => (
    <Stack spacing={1.5}>
        {bankAccounts.map((bank) => (
            <BankAccountCard
                key={bank.id}
                bank={bank}
                selected={bank.id === selectedBankAccountId}
                onSelect={() => onSelectBank(bank.id)}
            />
        ))}
    </Stack>
);

