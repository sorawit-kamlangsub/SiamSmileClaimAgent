export interface TransferConfig {
    maxAmount: number;
}

export const transferConfig: Record<number, TransferConfig> = {
    3: {
        maxAmount: 200000,
    },
    4: {
        maxAmount: 100000,
    },
    5: {
        maxAmount: 100000,
    },
};

export const getTransferConfig = (causeOfIncidentId?: number): TransferConfig => {
    return (
        transferConfig[causeOfIncidentId ?? 0] ?? {
            maxAmount: 0,
        }
    );
};
