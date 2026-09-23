import {
    Alert,
    Box,
    Divider,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import {
    BillingReviewFormValues,
    TRAFFIC_CASUALTY_STATUS,
    TRAFFIC_CASUALTY_STATUS_OPTIONS,
    TRAFFIC_POROBO_EXCESS_OPTIONS,
    TRAFFIC_VEHICLE_TYPE,
    TRAFFIC_VEHICLE_TYPE_OPTIONS,
} from "../../../store/billingClaim.types";
import { PENDING_BE_TOOLTIP } from "../../../store/billingPendingFields";

/** สเปค CR-03 : label 19px/600, radio 20px, ระยะแนวตั้งระหว่างตัวเลือก 6px, แถวสูง 30px ชิดบน ไม่ใช้ pill */
const radioOptionSx = {
    height: "30px",
    m: 0,
    alignItems: "center",
    "& .MuiRadio-root": { p: "5px" },
    "& .MuiSvgIcon-root": { fontSize: "20px" },
    "& .MuiFormControlLabel-label": { fontSize: "19px", fontWeight: 600 },
};

type TrafficAccidentColumnProps = {
    title: string;
    children: React.ReactNode;
};

/** คอลัมน์เดียวของ Section — หัวข้อ + ตัวเลือกชิดด้านบน ไม่ยืดเต็มความสูง (Stack เป็น flex item จึงต้องกันเอง) */
const TrafficAccidentColumn = ({ title, children }: TrafficAccidentColumnProps) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "text.secondary", mb: "8px" }}>{title}</Typography>
        <RadioGroup sx={{ gap: "6px", width: "100%" }}>{children}</RadioGroup>
    </Box>
);

/**
 * Step 1 "ข้อมูลอุบัติเหตุจากการจราจร" — วางบิลเคลมโรงพยาบาล
 *
 * ตาม CR "Traffic Accident and Hospital Document Review" ข้อ 3.1-3.3 / CR-02 : flow วางบิลเคลม
 * โรงพยาบาล ทุก control เป็น read-only เสมอ (อ่านค่าจาก field FE-only บน `BillingReviewFormValues`
 * ที่ยังไม่มี DTO รองรับ — ดู PENDING_BE_FIELDS.trafficAccident, `toReviewDataDto` จึงไม่ map ฟิลด์
 * กลุ่มนี้ขึ้น BE) เก็บ logic ซ่อน/แสดงตามเงื่อนไขไว้แม้วันนี้ disabled เพื่อให้ section นี้ reuse ได้
 * ตรง ๆ ทันทีที่มีหน้าเคลมลูกค้า (ซึ่งสเปคให้แก้ไขได้ — CR-02)
 */
const BillingTrafficAccidentSection = () => {
    const { values } = useFormikContext<BillingReviewFormValues>();
    const isNarrow = useMediaQuery("(max-width:820px)");

    const vehicleType = values.trafficVehicleType;
    const casualtyStatus = values.trafficCasualtyStatus;
    const isPoroboExcess = values.trafficIsPoroboExcess;

    return (
        <CustomPaper sx={{ lineHeight: "normal" }}>
            <HeadingWithColor
                icon={<DirectionsCarIcon sx={{ fontSize: 27 }} />}
                text="ข้อมูลอุบัติเหตุจากการจราจร"
                color="blue"
                button={
                    <Tooltip title={PENDING_BE_TOOLTIP} arrow>
                        <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </Tooltip>
                }
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: -1, mb: 2 }}>
                ข้อมูลจากการบันทึกอุบัติเหตุจราจร ใช้ประกอบการพิจารณาวางบิลเคลมโรงพยาบาล
            </Typography>

            <Stack
                direction={isNarrow ? "column" : "row"}
                divider={<Divider orientation={isNarrow ? "horizontal" : "vertical"} flexItem />}
                spacing={isNarrow ? 2.5 : 3}
            >
                <TrafficAccidentColumn title="ประเภทยานพาหนะ">
                    {TRAFFIC_VEHICLE_TYPE_OPTIONS.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            disabled
                            value={option.value}
                            checked={vehicleType === option.value}
                            control={<Radio />}
                            label={option.label}
                            sx={radioOptionSx}
                        />
                    ))}
                    {vehicleType === TRAFFIC_VEHICLE_TYPE.other && (
                        <TextField
                            disabled
                            fullWidth
                            size="small"
                            label="โปรดระบุ"
                            value={values.trafficVehicleOther}
                            sx={{ mt: 0.5 }}
                        />
                    )}
                </TrafficAccidentColumn>

                <TrafficAccidentColumn title="ผู้ขับขี่ หรือ ผู้โดยสาร">
                    {TRAFFIC_CASUALTY_STATUS_OPTIONS.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            disabled
                            value={option.value}
                            checked={casualtyStatus === option.value}
                            control={<Radio />}
                            label={option.label}
                            sx={radioOptionSx}
                        />
                    ))}
                    {casualtyStatus === TRAFFIC_CASUALTY_STATUS.driver && (
                        <Alert severity="info" sx={{ mt: 0.5, py: 0 }}>
                            กรุณาตรวจสอบผลตรวจแอลกอฮอล์ประกอบการพิจารณาเคลม
                        </Alert>
                    )}
                </TrafficAccidentColumn>

                <TrafficAccidentColumn title="เป็นส่วนเกิน พ.ร.บ.">
                    {TRAFFIC_POROBO_EXCESS_OPTIONS.map((option) => (
                        <FormControlLabel
                            key={String(option.value)}
                            disabled
                            value={String(option.value)}
                            checked={isPoroboExcess === option.value}
                            control={<Radio />}
                            label={option.label}
                            sx={radioOptionSx}
                        />
                    ))}
                    {isPoroboExcess === false && (
                        <TextField
                            disabled
                            fullWidth
                            size="small"
                            label="โปรดระบุสาเหตุที่ไม่ใช้ พ.ร.บ."
                            value={values.trafficNoPoroboReason}
                            sx={{ mt: 0.5 }}
                        />
                    )}
                </TrafficAccidentColumn>
            </Stack>
        </CustomPaper>
    );
};

export default BillingTrafficAccidentSection;
