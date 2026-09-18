import { useEffect } from "react";
import { Grid } from "@mui/material";
import { useAppDispatch } from "../../../../redux";
import { resetState } from "../store/claimConsiderSlice";
import useDeathDisabilityDetailHook from "../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityDetailHook";
import DeathDisabilityHeaderDetails from "../components/ConsiderDeathDisabilityDetails/DeathDisabilityHeaderDetails";

/** หน้าบันทึกข้อมูลเคลม - Death & Disability — route :id/:caseId (btoa) ดึงข้อมูลหัวหน้า (claim + customer detail) */
const ConsiderDeathDisabilityDetailPage = () => {
    const dispatch = useAppDispatch();
    const { detailData, detailDataLoading, customerDetailData, customerDetailLoading } = useDeathDisabilityDetailHook();

    // tab ประวัติการทำรายการ (ClaimTransationTab) dispatch แบบร่างลง claimConsider slice — ล้างตอนออกจากหน้า
    // เหมือน ConsiderDetailPage ไม่งั้นค้างข้ามไปหน้าพิจารณาเคลมลูกค้า
    useEffect(
        () => () => {
            dispatch(resetState());
        },
        [dispatch]
    );

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <DeathDisabilityHeaderDetails
                    detailData={detailData}
                    customerDetailData={customerDetailData}
                    detailDataLoading={detailDataLoading}
                    customerDetailLoading={customerDetailLoading}
                />
            </Grid>
        </Grid>
    );
};

export default ConsiderDeathDisabilityDetailPage;
