import React from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { formatDateString } from "../../../../functionHelpers";
import { useMonitorClaimHistory } from "../../hooks/Monitor/useMonitorClaimHistory";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { CustomTypographyWithOutGrid } from "../../../_common/components/CustomComponent/CustomTypographyWithOutGrid";
import ClaimHistoryTable from "./ClaimHistoryTable";
import { Box, Button, Grid, Link } from "@mui/material";

const ClaimHistoryPH: React.FC = () => {
    const { selectedPolicy, handleContinuousClaim, handleNewClaim } = useMonitorClaimHistory();

    if (!selectedPolicy) return null;

    return (
        <>
            <CustomPaper>
                <HeadingWithColor text="ข้อมูลกรมธรรม์" color="blue" />
                <Grid container spacing={2} alignItems="center" ml={1.5}>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid
                            label="ApplicationID"
                            value={
                                <Link
                                    href={`/checkeligible/detail/${btoa(selectedPolicy.appId)}/${btoa(
                                        selectedPolicy.appId
                                    )}`}
                                    target="_blank"
                                    fontWeight={700}
                                    fontSize={16}
                                >
                                    {selectedPolicy.appId}
                                </Link>
                            }
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid label="ชื่อผู้เอาประกัน" value={selectedPolicy.customerName} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid label="เลขบัตรประชาชน" value={selectedPolicy.nationalId} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid label="ผลิตภัณฑ์" value={selectedPolicy.productName} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid
                            label="วันที่เริ่มคุ้มครอง"
                            value={formatDateString(selectedPolicy.startCoverDate, "DD/MM/BBBB")}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid
                            label="วันที่สิ้นสุดความคุ้มครอง"
                            value={
                                selectedPolicy.endCoverDate
                                    ? formatDateString(selectedPolicy.endCoverDate, "DD/MM/BBBB")
                                    : undefined
                            }
                        />
                    </Grid>
                </Grid>
            </CustomPaper>
            <CustomPaper>
                <ClaimHistoryTable tableId="ClaimHistoryPHTable" onContinuousClaim={handleContinuousClaim} />
                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleNewClaim(2)}
                        sx={{ height: "33px" }}
                    >
                        แจ้งเคลมใหม่
                    </Button>
                </Box>
            </CustomPaper>
        </>
    );
};

export default ClaimHistoryPH;
