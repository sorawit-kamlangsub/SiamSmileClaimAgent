// ─── เพิ่มใน useCheckEligibleDetail.ts ───────────────────────────────────────

import { useMemo } from "react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import duration from "dayjs/plugin/duration";

dayjs.extend(buddhistEra);
dayjs.extend(duration);

// ── Types (เดิม) ──────────────────────────────────────────────────────────────

export type InsuredInfo = {
  applicationId: string;
  policyStartDate: string;
  titleName: string;
  firstName: string;
  lastName: string;
  idCardNo?: string;
  passport?: string;
  birthDate: string;
  mobilePhone?: string;
  province?: string;
  occupation?: string;
};

export type PersonalExclusionNote = {
  id: number;
  message: string;
};

// ── Types (ใหม่ – InsuredInfoCard PA) ────────────────────────────────────────

export type InsuredType = "นักเรียน" | "บุคลากร";

export type PAInsuredInfo = {
  applicationId: string;
  academicYear: string | number;
  schoolName: string;
  subDistrict: string;
  district: string;
  province: string;
  status: string;
  branch: string;
  contactTitle: string;
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  referenceId: string;
  insuredTitle: string;
  insuredFirstName: string;
  insuredLastName: string;
  nationalId?: string | null;
  passport?: string | null;
  educationLevel?: string | null;
  insuredType: InsuredType;
};

// ── Utilities (เดิม) ──────────────────────────────────────────────────────────

export const calculateAge = (birthDate: string): string => {
  const birth = dayjs(birthDate);
  const now = dayjs();
  const years = now.diff(birth, "year");
  const months = now.diff(birth.add(years, "year"), "month");
  const days = now.diff(birth.add(years, "year").add(months, "month"), "day");
  return `${years} ปี ${months} เดือน ${days} วัน`;
};

export const calculatePolicyAge = (startDate: string): string => {
  const start = dayjs(startDate);
  const now = dayjs();
  const years = now.diff(start, "year");
  const months = now.diff(start.add(years, "year"), "month");
  const days = now.diff(start.add(years, "year").add(months, "month"), "day");
  return `${years} ปี ${months} เดือน ${days} วัน`;
};

export const formatThaiDate = (date: string): string =>
  dayjs(date).format("DD/MM/") + (dayjs(date).year() + 543);

// ── Utilities (ใหม่) ──────────────────────────────────────────────────────────

/** คืน "-" เมื่อค่าเป็น null / undefined / "" */
const dash = (val?: string | number | null): string =>
  val !== null && val !== undefined && val !== "" ? String(val) : "-";

/** รวม title + first + last เป็นชื่อเต็ม */
const buildFullName = (...parts: (string | undefined | null)[]): string =>
  parts.filter(Boolean).join(" ") || "-";

/** ตรวจสถานะ active */
const ACTIVE_KEYWORDS = ["เพิ่ม", "active"];
const resolveIsActive = (status: string): boolean =>
  ACTIVE_KEYWORDS.some((kw) => status.toLowerCase().includes(kw.toLowerCase()));

// ── Hook (เดิม) ───────────────────────────────────────────────────────────────

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

  return { policyAge, currentAge, birthDateThai, fullName };
};

export default useCheckEligibleDetail;

// ── Hook (ใหม่ – InsuredInfoCard PA) ─────────────────────────────────────────

export const usePAInsuredInfo = (data?: PAInsuredInfo) => {
  const contactFullName = useMemo(
    () => buildFullName(data?.contactTitle, data?.contactFirstName, data?.contactLastName),
    [data?.contactTitle, data?.contactFirstName, data?.contactLastName]
  );

  const insuredFullName = useMemo(
    () => buildFullName(data?.insuredTitle, data?.insuredFirstName, data?.insuredLastName),
    [data?.insuredTitle, data?.insuredFirstName, data?.insuredLastName]
  );

  const isActiveStatus = useMemo(
    () => (data?.status ? resolveIsActive(data.status) : false),
    [data?.status]
  );

  return {
    applicationId:   dash(data?.applicationId),
    academicYear:    dash(data?.academicYear),
    schoolName:      dash(data?.schoolName),
    subDistrict:     dash(data?.subDistrict),
    district:        dash(data?.district),
    province:        dash(data?.province),
    status:          dash(data?.status),
    branch:          dash(data?.branch),
    contactFullName,
    contactPhone:    dash(data?.contactPhone),
    referenceId:     dash(data?.referenceId),
    insuredFullName,
    nationalId:      dash(data?.nationalId),
    passport:        dash(data?.passport),
    educationLevel:  dash(data?.educationLevel),
    insuredType:     data?.insuredType ?? null,
    isActiveStatus,
  };
};