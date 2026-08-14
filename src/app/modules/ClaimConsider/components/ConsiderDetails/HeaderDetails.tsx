import { Grid, Paper, Tab, Tabs } from "@mui/material";
import HeaderCardCustomerDetails from "./HeaderDetailCards/HeaderCardCustomerDetails";
import { useNavigate } from "react-router-dom";
import ClaimDetail from "./HeaderDetailCards/ClaimDetail";
import { useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import { TabContext, TabPanel } from "@mui/lab";
import ClaimDetailsTab from "./TabDetails/ClaimDetailsTab";

const HeaderDetails = () => {
    const [tabValue, setTabValue] = useState("1");

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

    const navigate = useNavigate();
    return (
        <>
            <Grid container spacing={2}>
                <TabContext value={tabValue}>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
                        <HeaderCardCustomerDetails
                            name="นางสาวนวพร ก้องเกียรติสกุล"
                            idCardNo="902596216345X"
                            applicationId="0001409"
                            onApplicationIdClick={() => {}} //navigate(`/application/0001409`)}
                            phoneNumber="081-233-4444"
                            appStatus="ปกติ"
                            policyAgeText="10 ปี 2 เดือน 9 วัน"
                            coverageStartDate="01/01/2559"
                            coverageEndDate={undefined}
                            productDetail={662}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
                        <ClaimDetail />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <Paper elevation={2} sx={{ p: 1, borderRadius: 4 }}>
                            <Tabs value={tabValue} onChange={handleChangeTab} aria-label="icon position tabs">
                                <Tab
                                    icon={<DescriptionIcon />}
                                    iconPosition="start"
                                    label="ข้อมูลการเคลม"
                                    value={"1"}
                                />
                                <Tab
                                    icon={<DescriptionIcon />}
                                    iconPosition="start"
                                    label="ประวัติการทำรายการ"
                                    value={"2"}
                                />
                                <Tab icon={<DescriptionIcon />} iconPosition="start" label="ความคุ้มครอง" value={"3"} />
                                <Tab
                                    icon={<DescriptionIcon />}
                                    iconPosition="start"
                                    label="ประวัติการเคลม"
                                    value={"4"}
                                />
                                <Tab icon={<DescriptionIcon />} iconPosition="start" label="การชำระเงิน" value={"5"} />
                                <Tab
                                    icon={<DescriptionIcon />}
                                    iconPosition="start"
                                    label="บันทึกข้อความ"
                                    value={"6"}
                                />
                            </Tabs>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <Paper elevation={1} sx={{ borderRadius: 2 }}>
                            <TabPanel value="1">
                                <ClaimDetailsTab />
                            </TabPanel>
                        </Paper>
                    </Grid>
                </TabContext>
            </Grid>
        </>
    );
};

export default HeaderDetails;
