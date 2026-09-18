import { Typography } from "@mui/material";


type HistorySettingByHospitalIdProps = {
    hospitalSettingId: string;
};

const HistorySettingByHospitalId = ({ hospitalSettingId }: HistorySettingByHospitalIdProps) => {
    return (
        <>
            <Typography>{hospitalSettingId}</Typography>
        </>
    );
};

export default HistorySettingByHospitalId;
