import { useNavigate } from "react-router-dom";
import TreatmentCalculate from "../../components/ClaimSimulate/TreatmentCalculate";

const DaysCalculatePage = () => {
    const navigate = useNavigate();
    return <TreatmentCalculate onBack={() => navigate(-1)} />;
};

export default DaysCalculatePage;
