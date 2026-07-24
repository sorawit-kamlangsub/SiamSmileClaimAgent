import React from "react";
import { Chip } from "@mui/material";
import { TransferStatusId } from "../store/ExtraPayment.types";
import { labelMapTransferStatus } from "../hooks/TransferStatus";
import { backgroundColorMapPaymentStatus, colorMapPaymentStatus } from "../../../functionHelpers";

interface TransferStatusChipProps {
    statusId: TransferStatusId;
}

export const TransferStatusChip: React.FC<TransferStatusChipProps> = ({ statusId }) => (
    <Chip
        label={`• ${labelMapTransferStatus[statusId]}`}
        size="small"
        sx={{
            backgroundColor: backgroundColorMapPaymentStatus[statusId],
            color: colorMapPaymentStatus[statusId],
            fontWeight: 700,
            borderRadius: "16px",
        }}
    />
);
