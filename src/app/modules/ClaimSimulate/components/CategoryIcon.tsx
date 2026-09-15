import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import BloodtypeOutlinedIcon from "@mui/icons-material/BloodtypeOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import ScreenshotMonitorOutlinedIcon from "@mui/icons-material/ScreenshotMonitorOutlined";
import SettingsInputAntennaOutlinedIcon from "@mui/icons-material/SettingsInputAntennaOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import ContentCutOutlinedIcon from "@mui/icons-material/ContentCutOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import DirectionsWalkOutlinedIcon from "@mui/icons-material/DirectionsWalkOutlined";
import AccessibilityNewOutlinedIcon from "@mui/icons-material/AccessibilityNewOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import HearingOutlinedIcon from "@mui/icons-material/HearingOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import AccessibleOutlinedIcon from "@mui/icons-material/AccessibleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import BackHandOutlinedIcon from "@mui/icons-material/BackHandOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AirOutlinedIcon from "@mui/icons-material/AirOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import AirportShuttleOutlinedIcon from "@mui/icons-material/AirportShuttleOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import OfflineBoltOutlinedIcon from "@mui/icons-material/OfflineBoltOutlined";
import BlurOnOutlinedIcon from "@mui/icons-material/BlurOnOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import AirlineSeatFlatOutlinedIcon from "@mui/icons-material/AirlineSeatFlatOutlined";

export const CATEGORY_ICON_MAP: Record<number, React.ReactNode> = {
    1: <MedicationOutlinedIcon sx={{ fontSize: 18 }} />, // ยาและสารอาหารทางหลอดเลือด
    2: <MedicalServicesOutlinedIcon sx={{ fontSize: 18 }} />, // เวชภัณฑ์และอุปกรณ์ช่วยเหลือผู้ป่วย
    3: <BloodtypeOutlinedIcon sx={{ fontSize: 18 }} />, // โลหิตและผลิตภัณฑ์จากเลือด
    4: <ScienceOutlinedIcon sx={{ fontSize: 18 }} />, // ห้องปฏิบัติการ (LAB)
    5: <BiotechOutlinedIcon sx={{ fontSize: 18 }} />, // พยาธิวิทยา
    6: <ScreenshotMonitorOutlinedIcon sx={{ fontSize: 18 }} />, // Imaging / X-Ray
    7: <SettingsInputAntennaOutlinedIcon sx={{ fontSize: 18 }} />, // รังสีร่วมรักษา
    8: <OfflineBoltOutlinedIcon sx={{ fontSize: 18 }} />, // รังสีรักษา
    9: <BlurOnOutlinedIcon sx={{ fontSize: 18 }} />, // เวชศาสตร์นิวเคลียร์
    10: <FactCheckOutlinedIcon sx={{ fontSize: 18 }} />, // ตรวจวินิจฉัยพิเศษ
    11: <BuildOutlinedIcon sx={{ fontSize: 18 }} />, // เครื่องมือแพทย์
    12: <ContentCutOutlinedIcon sx={{ fontSize: 18 }} />, // ห้องผ่าตัดและห้องหัตถการ
    13: <MedicalServicesOutlinedIcon sx={{ fontSize: 18 }} />, // ทันตกรรม
    14: <VolunteerActivismOutlinedIcon sx={{ fontSize: 18 }} />, // การพยาบาล
    15: <LocalPharmacyOutlinedIcon sx={{ fontSize: 18 }} />, // เภสัชกรรม
    16: <DirectionsWalkOutlinedIcon sx={{ fontSize: 18 }} />, // กายภาพบำบัด
    17: <AccessibilityNewOutlinedIcon sx={{ fontSize: 18 }} />, // กิจกรรมบำบัด
    18: <PsychologyOutlinedIcon sx={{ fontSize: 18 }} />, // จิตวิทยาคลินิก
    19: <HearingOutlinedIcon sx={{ fontSize: 18 }} />, // การแก้ไขการพูด/การได้ยิน
    20: <MonitorHeartOutlinedIcon sx={{ fontSize: 18 }} />, // ค่าบริการเทคโนโลยีหัวใจและทรวงอก
    21: <AccessibleOutlinedIcon sx={{ fontSize: 18 }} />, // อวัยวะเทียมและกายอุปกรณ์
    22: <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />, // ทัศนมาตรศาสตร์
    23: <SpaOutlinedIcon sx={{ fontSize: 18 }} />, // แพทย์แผนไทย
    24: <SpaOutlinedIcon sx={{ fontSize: 18 }} />, // แพทย์แผนจีน
    25: <BackHandOutlinedIcon sx={{ fontSize: 18 }} />, // ไคโรแพรคติก
    26: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />, // ชุดบริการเหมาจ่าย
    27: <LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />, // ค่าบริการโรงพยาบาล
    28: <PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />, // ค่าแพทย์ตรวจรักษา
    29: <ContentCutOutlinedIcon sx={{ fontSize: 18 }} />, // ค่าแพทย์ผ่าตัดและหัตถการ
    30: <AirOutlinedIcon sx={{ fontSize: 18 }} />, // ค่าวิสัญญีแพทย์
    31: <MedicalServicesOutlinedIcon sx={{ fontSize: 18 }} />, // ค่าทันตแพทย์
    32: <BadgeOutlinedIcon sx={{ fontSize: 18 }} />, // ค่าวิชาชีพอื่น
    33: <HotelOutlinedIcon sx={{ fontSize: 18 }} />, // ห้องพักผู้ป่วย
    34: <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />, // ห้องสังเกตอาการ
    35: <RestaurantOutlinedIcon sx={{ fontSize: 18 }} />, // อาหารผู้ป่วย
    36: <LunchDiningOutlinedIcon sx={{ fontSize: 18 }} />, // ค่าอาหารอื่นๆ
    37: <RestaurantOutlinedIcon sx={{ fontSize: 18 }} />, // ผลิตภัณฑ์เสริมอาหาร
    38: <AirportShuttleOutlinedIcon sx={{ fontSize: 18 }} />, // พาหนะผู้ป่วย
    39: <AirlineSeatFlatOutlinedIcon sx={{ fontSize: 18 }} />, // เก็บรักษาศพ
    40: <HealthAndSafetyOutlinedIcon sx={{ fontSize: 18 }} />, // บริการทั่วไปของสถานพยาบาล
    41: <CategoryOutlinedIcon sx={{ fontSize: 18 }} />, // ผลิตภัณฑ์อื่นๆ
    42: <AccessibleOutlinedIcon sx={{ fontSize: 18 }} />, // Disability
    43: <AirlineSeatFlatOutlinedIcon sx={{ fontSize: 18 }} />, // Death
};
