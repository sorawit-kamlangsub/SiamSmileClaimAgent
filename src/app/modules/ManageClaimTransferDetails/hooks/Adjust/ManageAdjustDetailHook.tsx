import { FormikErrors, useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { swalConfirm, swalError, swalSuccess, swalWarning } from "../../../_common";
import { useEffect } from "react";
import {
    useGetAdditionalTransferDetails,
    useGetAdjustmentReasons,
    useSaveAdditionalTransfer,
} from "../../../../api/coreClaimApi";
import { CaseDetailDto, SaveAdditionalTransferRequest } from "../../../../api/coreClaimApi.client";
import { TransferItemRow, TransferItemsFormValues } from "../../components/Adjust/DetailTab/TransferItemTable";
import { TransferRecordFormValues } from "../../components/Adjust/DetailTab/TransferRecordForm";

type ClaimTransferAdditionalFormValues = TransferItemsFormValues & TransferRecordFormValues;

const emptyFormValues: ClaimTransferAdditionalFormValues = {
    items: [],
    reasonId: undefined,
    note: "",
};

const useManageAdjustDetailHook = (clNo: string) => {
    const navigate = useNavigate();
    const { data: detailData, isLoading: isDetailLoading } = useGetAdditionalTransferDetails(clNo);
    const { data: reasonOptionsData, isLoading: reasonOptionIsLoading } = useGetAdjustmentReasons();

    const handleSaveSuccess = () => {
        swalSuccess("ทำรายการสำเร็จ", "บันทึกรายการสำเร็จ").then(() => {
            navigate("/manage/adjust-transfer");
        });
    };
    const handleSaveError = (err: string) => {
        swalError("แจ้งเตือน", err);
    };

    const { mutate: adjustMutate, isLoading: isAdjustLoading } = useSaveAdditionalTransfer(
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
            const detail = detailData?.data;
            const payload: SaveAdditionalTransferRequest = {
                caseId: clNo,
                claimNo: detail?.claimNo,
                caseNo: itemsToSubmit?.[0]?.caseNo,
                totalNetPaidAmount: Number(itemsToSubmit?.[0]?.additionalAmount ?? 0),
                toBankId: detail?.account?.bankId ?? 0,
                toBankName: detail?.account?.bankName ?? "",
                toBankAccountNo: detail?.account?.accountNo ?? "",
                toBankAccountName: detail?.account?.accountName ?? "",
                phoneNumber: detail?.account?.phoneNumber ?? "",
                adjustmentReasonId: values.reasonId,
                remark: values.note,
            };

            const sumAfterAdditionalTransfer =
                Number(itemsToSubmit?.[0]?.additionalAmount ?? 0) + Number(detail?.totalNetPaidAmount ?? 0);

            if ((detail?.additionalTransferLimit ?? 0) < sumAfterAdditionalTransfer) {
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
        const caseDetails = detailData?.data?.caseDetails;
        if (caseDetails) {
            formik.resetForm({
                values: {
                    items: caseDetails.map(
                        (caseDetail: CaseDetailDto): TransferItemRow => ({
                            caseId: caseDetail.caseNo ?? "",
                            customerName: caseDetail.customerName ?? "",
                            coverageTypeNameTH: caseDetail.coverageTypeNameTH ?? "",
                            caseNo: caseDetail.caseNo ?? "",
                            totalNetPaidAmount: caseDetail.totalNetPaidAmount ?? 0,
                            additionalAmount: 0,
                        })
                    ),
                    reasonId: 0,
                    note: "",
                },
            });
        }
    }, [detailData]);

    return {
        formik,
        summary: detailData?.data,
        account: detailData?.data?.account,
        isDetailLoading,
        reasonOptions: reasonOptionsData?.data,
        reasonOptionIsLoading,
        isAdjustLoading,
    };
};

export default useManageAdjustDetailHook;
