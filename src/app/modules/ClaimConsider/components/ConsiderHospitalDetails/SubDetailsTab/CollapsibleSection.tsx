import { ReactNode, useState } from "react";
import { Box, Collapse, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";

type CollapsibleSectionProps = {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    /**
     * ให้เปิดอยู่ตั้งแต่แรกหรือไม่ (Spec : Default Expand)
     */
    defaultExpanded?: boolean;
};

/**
 * Section แบบ Expand/Collapse ที่ใช้หัวข้อสีเดียวกับ Section อื่นในหน้าพิจารณาเคลม
 */
const CollapsibleSection = ({ title, icon, children, defaultExpanded = true }: CollapsibleSectionProps) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <CustomPaper>
            <HeadingWithColor
                icon={icon}
                text={title}
                color="blue"
                sx={{ mb: expanded ? 2 : 0 }}
                button={
                    <IconButton size="small" onClick={() => setExpanded((prev) => !prev)} aria-label={title}>
                        <ExpandMoreIcon
                            sx={{
                                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                            }}
                        />
                    </IconButton>
                }
            />

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box px={2} pb={1}>
                    {children}
                </Box>
            </Collapse>
        </CustomPaper>
    );
};

export default CollapsibleSection;
