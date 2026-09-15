import { Tabs, Tab, Box } from "@mui/material";

export interface ClaimDetailTabsProps {
    activeTab: number;
    onChange: (tabIndex: number) => void;
}

const tabLabels = ["ข้อมูลรายละเอียด", "ประวัติการทำรายการ", "ประวัติการโอนเงิน"];

const ClaimDetailTabs = ({ activeTab, onChange }: ClaimDetailTabsProps) => {
    return (
        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "10px 10px 0 0" }}>
            <Tabs
                value={activeTab}
                onChange={(_e, value) => onChange(value)}
                sx={{
                    minHeight: "44px",
                    "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#78909C",
                        minHeight: "44px",
                    },
                    "& .Mui-selected": {
                        color: "#0D4C8C !important",
                    },
                    "& .MuiTabs-indicator": {
                        backgroundColor: "#0D4C8C",
                        height: "3px",
                    },
                }}
            >
                {tabLabels.map((label) => (
                    <Tab key={label} label={label} />
                ))}
            </Tabs>
        </Box>
    );
};

export default ClaimDetailTabs;
