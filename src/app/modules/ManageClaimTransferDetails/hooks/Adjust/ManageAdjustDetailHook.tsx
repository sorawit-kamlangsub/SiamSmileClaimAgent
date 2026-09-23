import { FormikErrors, useFormik } from "formik";
import { swalConfirm, swalError, swalSuccess, swalWarning } from "../../../_common";
import { useEffect } from "react";
import { useGetAdjustReasonOptions, useGetClaimAdjustDetail, useSaveAdjustTransfer } from "../../adjustClaimAPI";
import { TransferItemsFormValues } from "../../components/Adjust/DetailTab/TransferItemTable";
import { TransferRecordFormValues } from "../../components/Adjust/DetailTab/TransferRecordForm";

type ClaimTransferAdditionalFormValues = TransferItemsFormValues & TransferRecordFormValues;

const emptyFormValues: ClaimTransferAdditionalFormValues = {
    items: [],
    reasonId: undefined,
    note: "",
};

const useManageAdjustDetailHook = (clNo: string) => {
    const { data: detailData, isLoading: isDetailLoading } = useGetClaimAdjustDetail(clNo);
    const { data: reasonOptionsData, isLoading: reasonOptionIsLoading } = useGetAdjustReasonOptions();

    const handleSaveSuccess = () => {
        swalSuccess("ทำรายการสำเร็จ", "บันทึกรายการสำเร็จ");
    };
    const handleSaveError = (err: string) => {
        swalError("แจ้งเตือน", err);
    };

    const { mutate: adjustMutate, isLoading: isAdjustLoading } = useSaveAdjustTransfer(
        handleSaveSuccess,
        handleSaveError
    );

    const formik = useFormik<ClaimTransferAdditionalFormValues>({
        initialValues: emptyFormValues,
        validate: (values) => {
            const errors: FormikErrors<ClaimTransferAdditionalFormValues> = {};

            if (!values.reasonId) {
                errors.reasonId = "กรุณาเลือกสาเหตุการโอนเพิ่ม";
            }

            return errors;
        },
        onSubmit: (values) => {
            // TODO: submit the additional-transfer request
            const itemsToSubmit = values.items.map((item) => ({
                caseNo: item.caseNo,
                additionalAmount: Number(item.additionalAmount ?? 0).toFixed(2),
            }));
            const payload = {
                caseId: clNo,
                claimNo: detailData?.data?.claimNo,
                caseNo: itemsToSubmit?.[0]?.caseNo,
                totalNetPaidAmount: Number(itemsToSubmit?.[0]?.additionalAmount ?? 0),
                toBankId: detailData?.data?.account?.bankId,
                toBankName: detailData?.data?.account?.bankName,
                toBankAccountNo: detailData?.data?.account?.accountNo,
                toBankAccountName: detailData?.data?.account?.accountName,
                phoneNumber: detailData?.data?.account?.phoneNumber,
                adjustmentReasonId: values.reasonId,
                remark: values.note,
            };

            const sumAfterAdditionalTransfer =
                Number(itemsToSubmit?.[0]?.additionalAmount ?? 0) + Number(detailData?.data?.totalNetPaidAmount ?? 0);

            if (detailData?.data?.additionalTransferLimit < sumAfterAdditionalTransfer) {
                swalWarning("แจ้งเตือน", "ยอดโอนเพิ่มรวมต้องไม่เกินจำนวนความคุ้มครองของเคส");
            } else if (Number(itemsToSubmit?.[0]?.additionalAmount) === 0) {
                swalWarning("แจ้งเตือน", "กรุณากรอกจำนวนเงินที่ต้องการโอนเพิ่ม");
            } else {
                if (payload) {
                    swalConfirm("ยืนยันทำรายการ", "", "ยืนยัน", "ยกเลิก").then((res) => {
                        if (res.isConfirmed) {
                            adjustMutate(payload);
                        }
                    });
                } else {
                    swalWarning("แจ้งเตือน", "ไม่พบข้อมูล");
                }
            }
        },
    });

    useEffect(() => {
        if (detailData?.data.caseDetails) {
            formik.resetForm({
                values: {
                    items: detailData.data.caseDetails,
                    reasonId: 0,
                    note: "",
                },
            });
        }
    }, [detailData]);

    return {
        formik,
        summary: detailData?.data,
        account: detailData?.data.account,
        isDetailLoading,
        reasonOptions: reasonOptionsData?.data,
        reasonOptionIsLoading,
        isAdjustLoading,
    };
};

export default useManageAdjustDetailHook;
