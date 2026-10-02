import { useEffect } from "react";
import { useAppDispatch } from "../../../../redux";
import { clearDocumentScan } from "../store/claimPHSlice";

/**
 * ล้าง documentScanList / documentDetailById ของ claimPH ตอนออกจากหน้า
 * DocumentScanTable ทุกตัวเขียนลง list เดียวกัน — หน้าพิจารณาเคลม/วางบิลต้องล้างทิ้งตอนออก
 * ไม่งั้นเอกสารของเคสที่เปิดดูจะติดไปกับการสร้างเคลม PH (useCreateClaimPH ส่ง list นี้ไป API)
 * ล้างตอน unmount เท่านั้น — effect ของ DocumentScanTable (ลูก) รันก่อนหน้าแม่ ล้างตอน mount จะลบของที่เพิ่งใส่
 */
const useClearDocumentScanOnUnmount = () => {
    const dispatch = useAppDispatch();
    useEffect(
        () => () => {
            dispatch(clearDocumentScan());
        },
        [dispatch]
    );
};

export default useClearDocumentScanOnUnmount;
