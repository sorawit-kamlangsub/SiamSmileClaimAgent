import { useMemo } from "react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import duration from "dayjs/plugin/duration";

dayjs.extend(buddhistEra);
dayjs.extend(duration);

export type InsuredInfo = {
    applicationId: string;
    policyStartDate: string; // ISO date string
    titleName: string;
    firstName: string;
    lastName: string;
    idCardNo?: string;
    passport?: string;
    birthDate: string; // ISO date string
    mobilePhone?: string;
    province?: string;
    occupation?: string;
};

export type PersonalExclusionNote = {
    id: number;
    message: string;
};

// Utility: คำนวณอายุ (ปี เดือน วัน)
export const calculateAge = (birthDate: string): string => {
    const birth = dayjs(birthDate);
    const now = dayjs();
    const years = now.diff(birth, "year");
    const months = now.diff(birth.add(years, "year"), "month");
    const days = now.diff(birth.add(years, "year").add(months, "month"), "day");
    return `${years} ปี ${months} เดือน ${days} วัน`;
};

// Utility: คำนวณอายุกรมธรรม์ (ปี เดือน วัน)
export const calculatePolicyAge = (startDate: string): string => {
    const start = dayjs(startDate);
    const now = dayjs();
    const years = now.diff(start, "year");
    const months = now.diff(start.add(years, "year"), "month");
    const days = now.diff(start.add(years, "year").add(months, "month"), "day");
    return `${years} ปี ${months} เดือน ${days} วัน`;
};

// Utility: แปลงวันที่เป็น DD/MM/YYYY พ.ศ.
export const formatThaiDate = (date: string): string => {
    return dayjs(date).format("DD/MM/") + (dayjs(date).year() + 543);
};

const useCheckEligibleDetail = (insured?: InsuredInfo) => {
    const policyAge = useMemo(
        () => (insured?.policyStartDate ? calculatePolicyAge(insured.policyStartDate) : "-"),
        [insured?.policyStartDate]
    );

    const currentAge = useMemo(
        () => (insured?.birthDate ? calculateAge(insured.birthDate) : "-"),
        [insured?.birthDate]
    );

    const birthDateThai = useMemo(
        () => (insured?.birthDate ? formatThaiDate(insured.birthDate) : "-"),
        [insured?.birthDate]
    );

    const fullName = useMemo(
        () => (insured ? `${insured.titleName}${insured.firstName} ${insured.lastName}` : "-"),
        [insured]
    );

    return {
        policyAge,
        currentAge,
        birthDateThai,
        fullName,
    };
};

export default useCheckEligibleDetail;
