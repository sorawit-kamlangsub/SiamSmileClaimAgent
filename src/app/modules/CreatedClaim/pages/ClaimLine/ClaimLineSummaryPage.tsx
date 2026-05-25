import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import DaysCalculate from "../../components/ClaimLine/DaysCalculate";

type Props = {};

const ClaimLineSummaryPage = ({}: Props) => {
    return (
        <CustomPaper sx={{ mt: 1 }}>
            <DaysCalculate />
        </CustomPaper>
    );
};

export default ClaimLineSummaryPage;
