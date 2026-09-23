import { useEffect } from "react";
import { Grid } from "@mui/material";
import { useAppDispatch } from "../../../../redux";
import { resetState } from "../store/claimConsiderSlice";
import useClearDocumentScanOnUnmount from "../../CreatedClaim/hooks/ClearDocumentScanHook";
import { useRemoveDocumentTypeCache } from "../../../api/coreClaimApi";
import { documentTypeId } from "../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import { TRANSFER_ACCOUNT_DOCUMENT_TYPE } from "../hooks/ClaimConsiderDeathDisabilityDetail/ChangeTransferAccountHook";
import useDeathDisabilityDetailHook from "../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityDetailHook";
import DeathDisabilityHeaderDetails from "../components/ConsiderDeathDisabilityDetails/DeathDisabilityHeaderDetails";

/** หน้าบันทึกข้อมูลเคลม - Death & Disability — route :id/:caseId (btoa) ดึงข้อมูลหัวหน้า (claim + customer detail) */
const ConsiderDeathDisabilityDetailPage = () => {
    const dispatch = useAppDispatch();
    useClearDocumentScanOnUnmount();
    const { detailData, detailDataLoading, customerDetailData, customerDetailLoading } = useDeathDisabilityDetailHook();

    // tab ประวัติการทำรายการ (ClaimTransationTab) dispatch แบบร่างลง claimConsider slice — ล้างตอนออกจากหน้า
    // เหมือน ConsiderDetailPage ไม่งั้นค้างข้ามไปหน้าพิจารณาเคลมลูกค้า
    useEffect(
        () => () => {
            dispatch(resetState());
        },
        [dispatch]
    );

    // ตารางสแกนเอกสารประกอบการเปลี่ยนบัญชีแชร์ cache master ใน dialog/section — ล้างตอนออกจากหน้า
    // ไม่งั้นเคสถัดไปจะได้ documentCode เดิมของเคสนี้
    const removeDocumentTypeCache = useRemoveDocumentTypeCache();
    useEffect(
        () => () => {
            removeDocumentTypeCache(documentTypeId[TRANSFER_ACCOUNT_DOCUMENT_TYPE]);
        },
        []
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
