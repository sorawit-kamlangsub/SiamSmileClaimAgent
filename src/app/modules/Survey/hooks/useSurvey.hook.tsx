import { FormikErrors, useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useGetPaymentDetails,
    useGetPayTransferTransactionId,
    useGetSurveyId,
    useGetSurveyQuestion,
    useSaveSurvey,
    useUpdateSurveyId,
} from "../surveyAPI";
import { swalError, swalSuccess } from "../../_common";

type SurveyFormikDefaultType = {
    surveyRating: number | undefined;
    surveyAnswersId: number | undefined;
    surveySuggestions?: number[] | undefined;
    remarks?: string | undefined;
};

const useSurveyHook = () => {
    const navigate = useNavigate();
    const [surveyCreated, setSurveyCreated] = useState<any | undefined>(undefined);
    const { id } = useParams();

    const hasFetchedRef = useRef(false);

    const handleSuccess = (res: any) => {
        const base64Encode = res?.data?.surveyId ? btoa(res?.data?.surveyId) : undefined;
        const reformSurveyPayload = {
            smStransactionId: id,
            surveyId: res?.data?.surveyId ?? undefined,
            surveyToken: base64Encode,
        };

        if (id) {
            updateSurveyIdMutate({
                smStransactionId: id,
                surveyId: res?.data?.surveyId,
            });
        }

        setSurveyCreated(reformSurveyPayload);
    };

    const handleSentSurveySuccess = () => {
        swalSuccess("ทำรายการสำเร็จ", "").then((res) => {
            if (res.isConfirmed) {
                navigate(`/survey/summary/${id}`);
            }
        });
    };

    const handleUpdateSuccess = () => {
        return;
    };

    const handleError = (err: string) => {
        swalError("เกิดข้อผิดพลาด", err);
    };

    const { mutate: getSurveyMutate, isLoading: getSurveyIsLoading } = useGetSurveyId(handleSuccess, handleError);
    const { mutate: saveSurveyMutate, isLoading: saveSurveyIsLoading } = useSaveSurvey(
        handleSentSurveySuccess,
        handleError
    );
    const { mutate: updateSurveyIdMutate, isLoading: updateSurveyIdIsLoading } = useUpdateSurveyId(
        handleUpdateSuccess,
        handleError
    );
    const { data, isLoading } = useGetPayTransferTransactionId({ payTransferTransactionId: id });
    const { data: surveyQuestionData, isLoading: surveyQuestionIsLoading } = useGetSurveyQuestion(
        surveyCreated?.surveyToken
    );
    const { data: paymentDetailsData, isLoading: paymentDetailsIsLoading } = useGetPaymentDetails(id);

    const getAnswer = surveyQuestionData?.data?.questions?.map((item: any) => {
        return item;
    });

    useEffect(() => {
        if (surveyQuestionIsLoading) {
            return;
        }
        if (surveyQuestionData?.data?.isSubmitted) {
            navigate(`/survey/summary/${id}`);
        }
    }, [surveyQuestionData?.data]);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (data?.data?.surveyId) {
            const base64Encode = data?.data?.surveyId ? btoa(data?.data?.surveyId) : undefined;
            const reformSurveyPayload = {
                smStransactionId: id,
                surveyId: data?.data?.surveyId ?? undefined,
                surveyToken: base64Encode,
            };
            setSurveyCreated(reformSurveyPayload);
        } else if (!hasFetchedRef.current) {
            if (getSurveyIsLoading) {
                return;
            }

            hasFetchedRef.current = true;

            if (!surveyCreated?.surveyId) {
                getSurveyMutate();
            }
        }
    }, [data, isLoading]);

    const defaultValues: SurveyFormikDefaultType = {
        surveyRating: undefined,
        surveyAnswersId: undefined,
        surveySuggestions: undefined,
        remarks: undefined,
    };

    //NOTE - Check Id 17 for keep remark
    const isMoreSuggestionQuestion = getAnswer?.[1]?.answers?.find((item: any) => item.answerId === 17);

    const formik = useFormik<SurveyFormikDefaultType>({
        initialValues: defaultValues,
        enableReinitialize: true,

        validate: (values) => {
            const errors: FormikErrors<SurveyFormikDefaultType> = {};

            const isCheckMoreSuggestion = values?.surveySuggestions?.find((item) => {
                return item === isMoreSuggestionQuestion?.surveyAnswerId;
            });
            if (isCheckMoreSuggestion) {
                if (!values.remarks) {
                    errors.remarks = "กรุณากรอกข้อมุล";
                }
            }
            return errors;
        },

        onSubmit: (values) => {
            const surveyRatingQuestionId = getAnswer?.[0]?.surveyQuestionId;
            const surveySuggestionsQuestionId = getAnswer?.[1]?.surveyQuestionId;
            const remarksQuestionId = getAnswer?.[2]?.surveyQuestionId;

            const hasSelectedMoreOption = values?.surveySuggestions?.find((item) => {
                return item === isMoreSuggestionQuestion?.surveyAnswerId;
            });

            const payloadJson = {
                answers: [
                    {
                        surveyQuestionId: surveyRatingQuestionId,
                        surveyAnswerIds: [values?.surveyAnswersId],
                    },
                    {
                        surveyQuestionId: surveySuggestionsQuestionId,
                        surveyAnswerIds: values?.surveySuggestions,
                        answerMore: hasSelectedMoreOption ? values.remarks ?? "-" : "-",
                    },
                    {
                        surveyQuestionId: remarksQuestionId,
                        surveyAnswerIds: [],
                        answerMore: hasSelectedMoreOption ? "-" : values.remarks ?? "-",
                    },
                ],
            };

            const payload = {
                surveyId: surveyCreated?.surveyId,
                answersRequest: payloadJson,
            };
            saveSurveyMutate(payload);
        },
    });

    return {
        formik,
        getAnswer,
        paymentDetailsData,
        surveyQuestionIsLoading,
        saveSurveyIsLoading,
        updateSurveyIdIsLoading,
        paymentDetailsIsLoading,
    };
};

export default useSurveyHook;
