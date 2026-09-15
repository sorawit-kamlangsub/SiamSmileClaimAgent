import ConsiderHospitalDetailPage from "./ConsiderHospitalDetailPage";

/**
 * หน้าดูรายละเอียดเคลมโรงพยาบาล (ดูอย่างเดียว)
 *
 * เปิดจากปุ่มรูปดวงตาในหน้า Monitor แสดงข้อมูลชุดเดียวกับหน้าพิจารณาเคลมทุกส่วน
 * ต่างกันแค่แก้ไขอะไรไม่ได้ และเหลือปุ่มกลับปุ่มเดียว
 */
const ConsiderHospitalDocumentPage = () => <ConsiderHospitalDetailPage readOnly />;

export default ConsiderHospitalDocumentPage;
