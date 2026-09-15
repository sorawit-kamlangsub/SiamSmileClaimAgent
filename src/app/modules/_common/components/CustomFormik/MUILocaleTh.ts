import { PickersLocaleText } from "@mui/x-date-pickers";

// This object is not Partial<PickersLocaleText> because it is the default values

export const MUILocaleTh: PickersLocaleText<any> = {
    // Calendar navigation
    previousMonth: "เดือนก่อนหน้า",
    nextMonth: "เดือนถัดไป",

    // View navigation
    openPreviousView: "เปิดมุมมองก่อนหน้า",
    openNextView: "เปิดมุมมองถัดไป",
    calendarViewSwitchingButtonAriaLabel: (view) =>
        view === "year" ? "เปิดมุมมองปี สลับมุมมองปฏิทิน" : "เปิดมุมมองปฏิทิน สลับมุมมองปี",

    // DateRange placeholders
    start: "เริ่มต้น",
    end: "สิ้นสุด",

    // Action bar
    cancelButtonLabel: "ยกเลิก",
    clearButtonLabel: "ล้าง",
    okButtonLabel: "ตกลง",
    todayButtonLabel: "วันนี้",
    fieldClearLabel: "ล้าง",

    // Toolbar titles
    datePickerToolbarTitle: "เลือกวันที่",
    dateTimePickerToolbarTitle: "เลือกวันที่และเวลา",
    timePickerToolbarTitle: "เลือกเวลา",
    dateRangePickerToolbarTitle: "เลือกช่วงวันที่",

    // Clock labels
    clockLabelText: (view, time, adapter) =>
        `เลือก ${view}. ${time === null ? "ไม่ได้เลือกเวลา" : `เวลาที่เลือกคือ ${adapter.format(time, "fullTime")}`}`,
    hoursClockNumberText: (hours) => `${hours} นาฬิกา`,
    minutesClockNumberText: (minutes) => `${minutes} นาที`,
    secondsClockNumberText: (seconds) => `${seconds} วินาที`,

    // Digital clock labels
    selectViewText: (view) => `เลือก ${view}`,

    // Calendar labels
    calendarWeekNumberHeaderLabel: "สัปดาห์ที่",
    calendarWeekNumberHeaderText: "#",
    calendarWeekNumberAriaLabelText: (weekNumber) => `สัปดาห์ที่ ${weekNumber}`,
    calendarWeekNumberText: (weekNumber) => `${weekNumber}`,

    // Open picker labels
    openDatePickerDialogue: (value, utils) =>
        value !== null && utils.isValid(value)
            ? `เลือกวันที่ วันที่เลือกคือ ${utils.format(value, "fullDate")}`
            : "เลือกวันที่",
    openTimePickerDialogue: (value, utils) =>
        value !== null && utils.isValid(value)
            ? `เลือกเวลา เวลาที่เลือกคือ ${utils.format(value, "fullTime")}`
            : "เลือกเวลา",

    // Table labels
    timeTableLabel: "เลือกเวลา",
    dateTableLabel: "เลือกวันที่",

    // Field section placeholders
    fieldYearPlaceholder: (params) => "Y".repeat(params.digitAmount),
    fieldMonthPlaceholder: (params) => (params.contentType === "letter" ? "MMMM" : "MM"),
    fieldDayPlaceholder: () => "DD",
    fieldWeekDayPlaceholder: (params) => (params.contentType === "letter" ? "EEEE" : "EE"),
    fieldHoursPlaceholder: () => "hh",
    fieldMinutesPlaceholder: () => "mm",
    fieldSecondsPlaceholder: () => "ss",
    fieldMeridiemPlaceholder: () => "aa",
};
