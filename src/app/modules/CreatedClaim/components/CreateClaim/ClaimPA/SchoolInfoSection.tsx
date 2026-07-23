import React from "react";
import { Box, Grid } from "@mui/material";
import { SchoolInfo } from "../../../store/claimPASlice";
import { CustomTypographyWithOutGrid } from "../../../../_common/components/CustomComponent/CustomTypographyWithOutGrid";

interface Props {
    data: SchoolInfo;
}

export const Field = ({ label, value }: { label: string; value: string }) => (
    <Grid item xs={12} sm={6} md={3}>
        <CustomTypographyWithOutGrid label={label} value={value || "-"} />
    </Grid>
);

const SchoolInfoSection: React.FC<Props> = ({ data }) => (
    <Box px={1} pb={1}>
        <Grid container spacing={1.5}>
            <Field label="Application ID" value={data.appId} />
            <Field label="สถานศึกษา" value={data.schoolName} />
            <Field label="ครูผู้ประสานงาน" value={data.teacherName} />
            <Field label="เบอร์ครูผู้ประสานงาน" value={data.teacherPhone} />
        </Grid>
    </Box>
);

export default SchoolInfoSection;
