import React, { useState } from "react";
import { Box, Paper, Tab, Tabs } from "@mui/material";
import TransactionHistoryTable from "./TransactionHistoryTable";
import TransferTransactionHistoryTable from "./TransferTransactionHistoryTable";
import RefundTransactionHistoryTable from "./RefundTransactionHistoryTable";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`extra-payment-tabpanel-${index}`} {...other}>
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `extra-payment-tab-${index}`,
        "aria-controls": `extra-payment-tabpanel-${index}`,
    };
}

interface ExtraPaymentTabsProps {
    detailPanel: React.ReactNode;
}

// TODO: ต่อ TransactionHistoryTable / TransferTransactionHistoryTable จริงเมื่อพร้อม — ตอนนี้เป็น placeholder
export const ExtraPaymentTabs: React.FC<ExtraPaymentTabsProps> = ({ detailPanel }) => {
    const [value, setValue] = useState(0);

    const tabs = [
        { label: "ข้อมูลรายละเอียด", panel: detailPanel },
        { label: "ประวัติการทำรายการ", panel: <TransactionHistoryTable /> },
        {
            label: "ประวัติการโอนเงิน",
            panel: (
                <>
                    <TransferTransactionHistoryTable />
                    <Box mt={4}>
                        <RefundTransactionHistoryTable />
                    </Box>
                </>
            ),
        },
    ];

    return (
        <Box>
            <Paper variant="outlined">
                <Tabs value={value} onChange={(_, v) => setValue(v)} variant="scrollable">
                    {tabs.map((tab, idx) => (
                        <Tab key={tab.label} label={tab.label} {...a11yProps(idx)} />
                    ))}
                </Tabs>
            </Paper>
            {tabs.map((tab, idx) => (
                <CustomTabPanel key={tab.label} value={value} index={idx}>
                    <Box mt={2}>{tab.panel}</Box>
                </CustomTabPanel>
            ))}
        </Box>
    );
};
