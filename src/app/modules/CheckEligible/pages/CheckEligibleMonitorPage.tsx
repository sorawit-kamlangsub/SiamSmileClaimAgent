import CheckEligibleMonitorTable from "../components/CheckEligibleMonitor/CheckEligibleMonitorTable";
import CheckEligibleMonitorToolbar from "../components/CheckEligibleMonitor/CheckEligibleMonitorToolbar";

type Props = {};

const CheckEligibleMonitorPage = ({}: Props) => {
    return (
        <div>
            <CheckEligibleMonitorToolbar />
            <CheckEligibleMonitorTable />
        </div>
    );
};

export default CheckEligibleMonitorPage;
