import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClaimSimulateSummary from "../components/ClaimSimulateSummary";

const ClaimSimulateSummaryPage: React.FC = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    // คง query string (prefill จากหน้าแจ้งเคลม — DFUAT-083) ไว้ตอนกลับหน้าคำนวณ
    return <ClaimSimulateSummary onBack={() => navigate({ pathname: "..", search })} />;
};

export default ClaimSimulateSummaryPage;
