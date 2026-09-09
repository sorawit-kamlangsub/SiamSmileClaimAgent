import { useEffect } from "react";
import { Grid } from "@mui/material";
import HeaderDetails from "../components/ConsiderDetails/HeaderDetails";
import useConsiderDetailHook from "../hooks/ClaimConsiderDetail/ConsiderDetailHook";
import { useAppDispatch } from "../../../../redux";
import { clearViewingDraft } from "../store/claimConsiderSlice";

const ConsiderDetailPage = () => {
    const dispatch = useAppDispatch();
    const { detailData, detailDataLoading, customerDetailData, customerDetailLoading } = useConsiderDetailHook();

    // safety net เผื่อออกไปหน้าอื่นที่ใช้สไลซ์นี้ร่วมกัน (เช่น หน้าเคลม รพ.) โดยไม่ผ่าน leaveToMonitor()/
    // resetState() ปกติ — กันไม่ให้แถบ "กำลังดูข้อมูลจากแบบร่าง" ค้างข้ามหน้า
    useEffect(
        () => () => {
            dispatch(clearViewingDraft());
        },
        [dispatch]
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <HeaderDetails
                        detailData={detailData}
                        customerDetailData={customerDetailData}
                        customerDetailLoading={customerDetailLoading}
                        detailDataLoading={detailDataLoading}
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default ConsiderDetailPage;
