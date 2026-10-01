import { Box, Divider, Stack, Typography, useMediaQuery } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useFormikContext } from "formik";

import CollapsibleSection from "./CollapsibleSection";
import { FormikRadioGroup, FormikTextField } from "../../../../_common";
import { useGetTrafficAccidentPersonRole, useGetTrafficVehicleType } from "../../../../../api/coreClaimMastersApi";
import { HospitalConsiderValues } from "../../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";

const compulsoryInsuranceExcessOptions = [
    { id: true, name: "ใช่" },
    { id: false, name: "ไม่ใช่" },
];

/**
 * master ประเภทยานพาหนะยังไม่มี flag บอกว่าแถวไหนคือ "อื่นๆ" — ใช้ชื่อตัวเลือกแทน
 * (ตัวเลือกนี้ต้องให้กรอก "โปรดระบุ" เพิ่ม → caseMedicalTreatment.otherVehicleType)
 */
export const isOtherVehicleTypeName = (name: string | undefined) => !!name?.includes("อื่น");

type TrafficAccidentColumnProps = {
    title: string;
    children: React.ReactNode;
};

/** คอลัมน์เดียวของ Section — หัวข้อ + ตัวเลือกชิดด้านบน (layout เดียวกับ BillingTrafficAccidentSection) */
const TrafficAccidentColumn = ({ title, children }: TrafficAccidentColumnProps) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "text.secondary", mb: "8px" }}>{title}</Typography>
        {children}
    </Box>
);

/**
 * RC-005 5.6 Section "ข้อมูลอุบัติเหตุจากการจราจร" — ส่งเป็น case.caseMedicalTreatment
 * ชุดช่องเดียวกับหน้าวางบิล (BillingTrafficAccidentSection) แต่แก้ไขได้ และตัวเลือกมาจาก master
 * แสดงเฉพาะเมื่อ "เหตุของการเคลม" เป็นอุบัติเหตุ (parent เป็นคนคุม) — ไม่บังคับกรอก
 */
const TrafficAccidentSection = () => {
    const formik = useFormikContext<HospitalConsiderValues>();
    const isNarrow = useMediaQuery("(max-width:820px)");

    const { data: vehicleTypeData } = useGetTrafficVehicleType();
    const { data: personRoleData } = useGetTrafficAccidentPersonRole();
    const vehicleTypes = vehicleTypeData?.data ?? [];

    const selectedVehicleType = vehicleTypes.find(
        (item) => item.trafficVehicleTypeId === formik.values.trafficVehicleTypeId
    );

    return (
        <CollapsibleSection title="ข้อมูลอุบัติเหตุจากการจราจร" icon={<DirectionsCarIcon sx={{ fontSize: 27 }} />}>
            <Stack
                direction={isNarrow ? "column" : "row"}
                divider={<Divider orientation={isNarrow ? "horizontal" : "vertical"} flexItem />}
                spacing={isNarrow ? 2.5 : 3}
            >
                <TrafficAccidentColumn title="ประเภทยานพาหนะ">
                    <FormikRadioGroup
                        name="trafficVehicleTypeId"
                        data={vehicleTypes}
                        valueFieldName="trafficVehicleTypeId"
                        displayFieldName="trafficVehicleTypeName"
                        formik={formik}
                    />
                    {isOtherVehicleTypeName(selectedVehicleType?.trafficVehicleTypeName) && (
                        <FormikTextField
                            name="trafficOtherVehicleType"
                            label="โปรดระบุ"
                            formik={formik}
                            size="small"
                            fullWidth
                            sx={{ mt: 0.5 }}
                        />
                    )}
                </TrafficAccidentColumn>

                <TrafficAccidentColumn title="ผู้ขับขี่ หรือ ผู้โดยสาร">
                    <FormikRadioGroup
                        name="trafficAccidentPersonRoleId"
                        data={personRoleData?.data ?? []}
                        valueFieldName="trafficAccidentPersonRoleId"
                        displayFieldName="trafficAccidentPersonRoleName"
                        formik={formik}
                    />
                </TrafficAccidentColumn>

                <TrafficAccidentColumn title="เป็นส่วนเกิน พ.ร.บ.">
                    <FormikRadioGroup
                        name="trafficHasCompulsoryInsuranceExcess"
                        data={compulsoryInsuranceExcessOptions}
                        formik={formik}
                    />
                    {formik.values.trafficHasCompulsoryInsuranceExcess === false && (
                        <FormikTextField
                            name="trafficCompulsoryInsuranceNotUsedReason"
                            label="โปรดระบุสาเหตุที่ไม่ใช้ พ.ร.บ."
                            formik={formik}
                            size="small"
                            fullWidth
                            sx={{ mt: 0.5 }}
                        />
                    )}
                </TrafficAccidentColumn>
            </Stack>
        </CollapsibleSection>
    );
};

export default TrafficAccidentSection;
