import React from "react";
import { Chip } from "@mui/material";
import { TransferStatusId } from "../store/ExtraPayment.types";
import {
    backgroundColorMapTransferStatus,
    colorMapTransferStatus,
    labelMapTransferStatus,
} from "../hooks/TransferStatus";

interface TransferStatusChipProps {
    statusId: TransferStatusId;
}

export const TransferStatusChip: React.FC<TransferStatusChipProps> = ({ statusId }) => (
    <Chip
        label={`• ${labelMapTransferStatus[statusId]}`}
        size="small"
        sx={{
            backgroundColor: backgroundColorMapTransferStatus[statusId],
            color: colorMapTransferStatus[statusId],
            fontWeight: 700,
            borderRadius: "16px",
        }}
    />
);
