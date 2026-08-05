import React, { ReactNode } from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { formatDateString } from "../../../../functionHelpers";
import { useMonitorClaimHistory } from "../../hooks/Monitor/useMonitorClaimHistory";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { CustomTypographyWithOutGrid } from "../../../_common/components/CustomComponent/CustomTypographyWithOutGrid";
import ClaimHistoryTable from "./ClaimHistoryTable";
import { Box, Button, Grid, Link } from "@mui/material";
import PolicyIcon from "@mui/icons-material/Policy";
import { useNavigate } from "react-router-dom";
import { GetClaimHistoryDtoResponse } from "../../../../api/coreClaimApi.client";

const Field = ({ label, value, color }: { label: string; value: ReactNode | undefined; color?: string }) => (
    <Grid item xs={12} sm={6} md={4}>
        <CustomTypographyWithOutGrid label={label} value={value} color={color} />
    </Grid>
);

const ClaimHistoryPH: React.FC = () => {
    const { selectedPolicy, handleContinuousClaim, handleNewClaim } = useMonitorClaimHistory();
    const navigate = useNavigate();
    if (!selectedPolicy) return null;

    return (
        <>
            <CustomPaper>
                <HeadingWithColor text="รายละเอียดผู้เอาประกัน" color="blue" />
                <Grid container spacing={2} alignItems="center" ml={1.5}>
                    <Field
                        label="ApplicationID"
                        value={
                            <Link
                                href={`/checkeligible/detail/${btoa(selectedPolicy?.customerId?.toString() || "")}`}
                                target="_blank"
                                fontWeight={700}
                                fontSize={16}
                            >
                                {selectedPolicy.appId}
                            </Link>
                        }
                    />
                    <Field label="ชื่อผู้เอาประกัน" value={selectedPolicy.customerName} />
                    <Field label="เลขบัตรประชาชน" value={selectedPolicy.cardNo} />
                    <Field label="ผลิตภัณฑ์" value={selectedPolicy.productName} />
                    <Field
                        label="วันที่เริ่มคุ้มครอง"
                        value={formatDateString(selectedPolicy.startCoverDate, "DD/MM/BBBB")}
                    />
                    <Field
                        label="วันที่สิ้นสุดความคุ้มครอง"
                        value={
                            selectedPolicy.endCoverDate
                                ? formatDateString(selectedPolicy.endCoverDate, "DD/MM/BBBB")
                                : undefined
                        }
                    />
                    <Field label="สถานศึกษา" value={selectedPolicy.schoolName} />
                    <Field label="จังหวัด" value={selectedPolicy.provinceName} />
                    <Field label="ที่อยู่" value={selectedPolicy.address} />
                    <Field label="เบอร์โทรศัพท์" value={selectedPolicy.mobilePhoneNumber} />
                    <Field
                        label="สถานะ App"
                        value={selectedPolicy.appStatus}
                        color={
                            selectedPolicy.appStatusId === 2 //ปกติ
                                ? "#2E7D32"
                                : selectedPolicy.appStatusId === 4 || selectedPolicy.appStatusId === 5 //ยกเลิก,ยกเลิกก่อน DCR
                                ? "#D32F2F"
                                : "#F0E434"
                        }
                    />
                </Grid>
            </CustomPaper>
            <CustomPaper>
                <ClaimHistoryTable
                    tableId="ClaimHistoryPHTable"
                    onContinuousClaim={(item: GetClaimHistoryDtoResponse) => handleContinuousClaim(item)}
                />
                <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<PolicyIcon />}
                        onClick={() =>
                            navigate(`/checkeligible/detail/${btoa(selectedPolicy.customerId?.toString() as string)}`)
                        }
                        sx={{ height: "33px" }}
                    >
                        ตรวจสอบสิทธิ์
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleNewClaim(selectedPolicy.productTypeId || 6, selectedPolicy.customerId)}
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
