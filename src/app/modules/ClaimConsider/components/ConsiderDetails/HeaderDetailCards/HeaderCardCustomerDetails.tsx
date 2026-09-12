import { Box, Grid, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShieldIcon from "@mui/icons-material/Shield";
import { backgroundColorMapAppStatus, colorMapPaymentAppStatus } from "../../../../../functionHelpers";

type InfoChipProps = {
    label: string;
    value: React.ReactNode;
};

const InfoChip = ({ label, value }: InfoChipProps) => (
    <Box
        sx={{
            backgroundColor: "rgba(255, 255, 255, 0.14)",
            borderRadius: "10px",
            padding: "8px 16px",
            height: "100%",
        }}
    >
        <Typography sx={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.8)" }}>{label}</Typography>
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF" }}>{value}</Typography>
    </Box>
);

export type PolicyHolderInfoBannerProps = {
    name: string;
    idCardNo: string;
    applicationId: string;
    onApplicationIdClick?: () => void;
    phoneNumber: string;
    appStatus: string;
    appStatusId?: number;
    policyAgeText: string;
    coverageStartDate: string;
    coverageEndDate?: string;
    productDetail: string | number;
};

const HeaderCardCustomerDetails = ({
    name = "",
    idCardNo = "",
    applicationId = "",
    onApplicationIdClick,
    phoneNumber = "",
    appStatus = "",
    appStatusId,
    policyAgeText = "",
    coverageStartDate = "",
    coverageEndDate = "",
    productDetail: planNo = "",
}: PolicyHolderInfoBannerProps) => {
    const appStatusBgColor = appStatusId ? backgroundColorMapAppStatus[appStatusId] : undefined;
    const appStatusTextColor = appStatusId ? colorMapPaymentAppStatus[appStatusId] : undefined;

    return (
        <>
            <Box
                sx={{
                    background: "linear-gradient(135deg, #0D3D6B 0%, #1E88C7 100%)",
                    borderRadius: "16px",
                    padding: { xs: "14px 16px", sm: "16px 20px" },
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: 1,
                }}
            >
                {/* nowrap เฉพาะ lg+ (~1200px) เท่านั้น — แถวเดียวต้องการพื้นที่รวม avatar+name+chips+badge
                    รวมกันเกิน 1100px จริงๆ ถ้าบังคับ nowrap ตั้งแต่ sm (600px) แบบเดิม ทุกบล็อกจะถูกบีบจนข้อความ
                    ตัดคำทีละตัวอักษร (ตามที่เจอตอนเปิด 734px) — จอที่แคบกว่า lg จึงให้ wrap ลงหลายแถวแทน */}
                <Grid container spacing={2} alignItems="center" sx={{ flexWrap: { xs: "wrap", lg: "nowrap" } }}>
                    {/* Avatar + name block */}
                    <Grid item sx={{ flexShrink: 0 }}>
                        <Box
                            sx={{
                                width: { xs: 64, sm: 84 },
                                height: { xs: 64, sm: 84 },
                                borderRadius: "14px",
                                borderColor: "#FFFFFF",
                                backgroundColor: "rgba(255, 255, 255, 0.28)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width: { xs: 40, sm: 52 },
                                    height: { xs: 40, sm: 52 },
                                    borderRadius: 12,
                                    backgroundColor: "rgba(255, 255, 255, 1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <PersonIcon sx={{ color: "#0D3D6B", fontSize: { xs: 32, sm: 42 } }} />
                            </Box>
                        </Box>
                    </Grid>

                    {/* xs={12}: เต็มแถวแยกบรรทัดจนกว่าจะถึง lg (ตรงกับจุดที่ container เปลี่ยนเป็น nowrap ด้านบน)
                        lg="auto": กว้างตามเนื้อหาเหมือนเดิมไม่แย่งพื้นที่ยืดกับกลุ่ม chips */}
                    <Grid item xs={12} lg="auto" sx={{ minWidth: { xs: 0, lg: 220 }, flexShrink: { xs: 1, lg: 0 } }}>
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "rgba(255, 255, 255, 0.14)",
                                borderRadius: "20px",
                                padding: "2px 12px",
                                marginBottom: "6px",
                            }}
                        >
                            <VerifiedIcon sx={{ color: "#7FD1F5", fontSize: 16 }} />
                            <Typography sx={{ fontSize: "0.75rem", color: "#FFFFFF" }}>ข้อมูลผู้เอาประกัน</Typography>
                        </Box>
                        <Typography
                            sx={{ fontSize: { xs: "1.05rem", sm: "1.3rem" }, fontWeight: 700, color: "#FFFFFF" }}
                        >
                            {name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "#FFFFFF", wordBreak: "break-word" }}>
                            เลขบัตรประชาชน : {idCardNo}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "#FFFFFF", wordBreak: "break-word" }}>
                            Application ID :{" "}
                            <Box
                                component="span"
                                onClick={onApplicationIdClick}
                                sx={{
                                    textDecoration: "underline",
                                    cursor: onApplicationIdClick ? "pointer" : "default",
                                    fontWeight: 700,
                                }}
                            >
                                {applicationId}
                            </Box>
                        </Typography>
                    </Grid>

                    {/* Info chips — เต็มแถวแยกบรรทัดเองจนถึง lg, จากนั้นกลับไปอยู่แถวเดียวกันแบบเดิม */}
                    <Grid item xs={12} lg>
                        <Grid container spacing={1.5}>
                            <Grid item xs={6} sm={4}>
                                <InfoChip label="เบอร์โทรศัพท์" value={phoneNumber} />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <InfoChip
                                    label="สถานะ App"
                                    value={
                                        <Box
                                            component="span"
                                            sx={{
                                                backgroundColor: appStatusBgColor ?? "#D9F7C4",
                                                color: appStatusTextColor ?? "#2E7D32",
                                                borderRadius: "10px",
                                                padding: "1px 12px",
                                                fontSize: "0.85rem",
                                                display: "inline-block",
                                            }}
                                        >
                                            {appStatus}
                                        </Box>
                                    }
                                />
                            </Grid>
                            {/* spacer เว้นช่องให้ครบ 3 คอลัมน์ — ไม่จำเป็นตอน 2 คอลัมน์บนมือถือจึงซ่อนไว้ */}
                            <Grid item sm={4} sx={{ display: { xs: "none", sm: "block" } }} />

                            <Grid item xs={6} sm={4}>
                                <InfoChip label="อายุกรมธรรม์" value={policyAgeText} />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <InfoChip label="วันที่เริ่มคุ้มครอง" value={coverageStartDate} />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <InfoChip label="วันที่สิ้นสุดความคุ้มครอง" value={coverageEndDate || "-"} />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Plan badge — เต็มความกว้างจนถึง lg แทนที่จะบีบเบียดอยู่ท้ายแถว */}
                    <Grid item xs={12} lg="auto" sx={{ flexShrink: 0 }}>
                        <Box
                            sx={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: "24px",
                                padding: "8px 20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                width: { xs: "100%", lg: "auto" },
                            }}
                        >
                            <ShieldIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                            <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>แผน : {planNo}</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default HeaderCardCustomerDetails;
