import { useNavigate } from "react-router-dom";
import DaysCalculate from "../../components/ClaimLine/DaysCalculate";

const DaysCalculatePage = () => {
    const navigate = useNavigate();
    return <DaysCalculate onBack={() => navigate(-1)} />;
};

export default DaysCalculatePage;
