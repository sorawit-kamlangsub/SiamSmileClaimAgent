import React from "react";
import { useNavigate } from "react-router-dom";
import ClaimSimulate from "../components/ClaimSimulate";

const ClaimSimulatePage: React.FC = () => {
    const navigate = useNavigate();

    return <ClaimSimulate onNext={() => navigate("summary")} />;
};

export default ClaimSimulatePage;
