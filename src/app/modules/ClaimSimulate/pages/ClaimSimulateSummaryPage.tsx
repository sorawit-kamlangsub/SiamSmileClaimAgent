import React from "react";
import { useNavigate } from "react-router-dom";
import ClaimSimulateSummary from "../components/ClaimSimulateSummary";

const ClaimSimulateSummaryPage: React.FC = () => {
    const navigate = useNavigate();
    return <ClaimSimulateSummary onBack={() => navigate("..")} />;
};

export default ClaimSimulateSummaryPage;