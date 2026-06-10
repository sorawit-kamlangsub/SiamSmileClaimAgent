import React from "react";
import { Box, Grid, IconButton, Link, Tooltip, Typography, Zoom } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import DescriptionIcon from "@mui/icons-material/Description";
import { CustomTypographyWithOutGrid } from "../../../../_common/components/CustomComponent/CustomTypographyWithOutGrid";

interface SummaryRow {
    appId: string;
    customerName: string;
    claimType: string;
    claimAmount: number;
}

interface Props {
    data: SummaryRow[];
    onEdit: () => void;
}

const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ClaimSummaryPHTable: React.FC<Props> = ({ data, onEdit }) => {
    // const totalClaimAmount = data.reduce((sum, row) => sum + Number(row.claimAmount), 0);

    return (
        <>
            <HeadingWithColor text="ข้อมูลเคลม" color="blue" icon={<DescriptionIcon sx={{ fontSize: 27 }} />} />
            {data.map((row, idx) => (
                <Grid key={idx} container spacing={2} px={2} pb={2} alignItems="center">
                    {/* Application ID */}
                    <Grid item xs={12} sm={3} md={3}>
                        <CustomTypographyWithOutGrid
                            label="Application ID"
                            value={
                                <Link href="#" underline="hover" fontWeight={700} fontSize={15} color="primary.main">
                                    {row.appId}
                                </Link>
                            }
                        />
                    </Grid>

                    {/* ชื่อผู้เอาประกัน */}
                    <Grid item xs={12} sm={3} md={3}>
                        <CustomTypographyWithOutGrid
                            label="ชื่อผู้เอาประกัน"
                            value={
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Typography fontWeight={700} fontSize={15} color="primary.main">
                                        {row.customerName}
                                    </Typography>
                                    <Tooltip
                                        title="แก้ไขรายละเอียด"
                                        arrow
                                        placement="top"
                                        TransitionComponent={Zoom}
                                        enterDelay={100}
                                        leaveDelay={50}
                                    >
                                        <IconButton
                                            size="medium"
                                            onClick={onEdit}
                                            sx={{
                                                bgcolor: "#fdf6e3",
                                                color: "#c8a415",
                                                p: 0.4,
                                                ml: 0.5,
                                                border: "1px solid #fff2c2",
                                            }}
                                        >
                                            <EditIcon sx={{ fontSize: 19 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                        />
                    </Grid>

                    {/* ลักษณะการเคลม */}
                    <Grid item xs={12} sm={3} md={3}>
                        <CustomTypographyWithOutGrid label="ลักษณะการเคลม" value={row.claimType} />
                    </Grid>

                    {/* ยอดเบิก */}
                    <Grid item xs={12} sm={3} md={3}>
                        <CustomTypographyWithOutGrid label="ยอดเบิก" value={fmt(row.claimAmount)} />
                    </Grid>
                </Grid>
            ))}

            {/* {data.length > 1 && (
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap={2}
                    px={2}
                    py={1}
                    sx={{ borderTop: "0.5px solid", borderColor: "divider" }}
                >
                    <Typography fontSize={14} fontWeight={700} color="primary.main">
                        จำนวนเงินรวม :
                    </Typography>
                    <Typography fontSize={14} fontWeight={700} color="primary.main">
                        {fmt(totalClaimAmount)}
                    </Typography>
                </Box>
            )} */}
        </>
    );
};

export default ClaimSummaryPHTable;
