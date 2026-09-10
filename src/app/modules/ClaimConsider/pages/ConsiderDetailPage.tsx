import { useEffect } from "react";
import { Grid } from "@mui/material";
import HeaderDetails from "../components/ConsiderDetails/HeaderDetails";
import useConsiderDetailHook from "../hooks/ClaimConsiderDetail/ConsiderDetailHook";
import { useAppDispatch } from "../../../../redux";
import { resetState } from "../store/claimConsiderSlice";

const ConsiderDetailPage = () => {
    const dispatch = useAppDispatch();
    const { detailData, detailDataLoading, customerDetailData, customerDetailLoading } = useConsiderDetailHook();

    // safety net: หน้านี้ unmount ทุกครั้งที่ออกไป monitor (คนละ route) — ต้องเคลียร์สไลซ์ทั้งก้อนที่นี่
    // ไม่งั้น filledItems/calculateResult/viewingDraft ฯลฯ จะค้างข้ามไปเคสถัดไปที่เปิดใหม่ (mount ใหม่ทั้งชุด
    // จึงไม่เข้า prevClaimIdRef guard ใน ConsiderDetailHook ที่ดักไว้แค่กรณีสลับ claimId แบบไม่ unmount)
    useEffect(
        () => () => {
            dispatch(resetState());
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
