// import { useSaveClaimEditDraft } from "../../../../api/coreClaimApi";
// import { SaveClaimEditDraftDtoRequest } from "../../../../api/coreClaimApi.client";
// import { swalError, swalSuccess } from "../../../_common";
// import useConsiderDetailHook from "./ConsiderDetailHook";

// const useClaimDetailActionHook = () => {
//     const { formik, detailData, customerDetailData } = useConsiderDetailHook();
//     const saveClaimEditDraft = useSaveClaimEditDraft(
//         () => {
//             swalSuccess("สำเร็จ", "บันทึกแบบร่างเรียบร้อยแล้ว");
//         },
//         (error) => {
//             swalError("ไม่สำเร็จ", error);
//         }
//     );
//     const mapSaveDraftPayload = (): SaveClaimEditDraftDtoRequest => {
//         const values = formik.values;

//         return {
//             ClaimId: detailData?.data?.claimId,
//             CaseId: detailData?.data?.caseNo,
//             ClaimTransactionType: 2,
//             IncidentTypeId: values.incidentTypeId ?? 0,
//             IncidentDate: values.incidentDate,
//             IncidentTime: values.incidentTime
// ,
//             Case: {
//                 CoverageTypeId: values.coverageTypeId,
//                 OccurrenceDate: values.incidentDate,
//                 OccurrenceTime: values.incidentTime,
//                 AdmissionDate: values.admissionDate,
//                 AdmissionTime: values.admissionTime,
//                 DischargeDate: values.dischargeDate,
//                 DischargeTime: values.dischargeTime,

//                 HospitalId: values.hospitalId,
//                 ChiefComplaintId: values.chiefComplaintId,
//                 MedicalTypeId: values.medicalTypeId,

//                 ICD10_1stId: values.diagnoses?.[0]?.icd10Id,
//                 ICD10_2ndId: values.diagnoses?.[1]?.icd10Id,
//                 ICD10_3rdId: values.diagnoses?.[2]?.icd10Id,

//                 ...
//             }
//         };
//     };

//     const handleSaveDraft = async () => {
//         const payload = mapSaveDraftPayload();

//         await saveClaimEditDraft.mutateAsync(payload);
//     };
//     return {handleSaveDraft};
// };

// export default useClaimDetailActionHook;
