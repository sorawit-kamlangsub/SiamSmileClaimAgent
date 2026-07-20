export const validateThaiCitizenID = (id: string): boolean => {
    const citizenId = id.replace(/-/g, "").trim();

    // ต้องเป็นตัวเลข 13 หลัก
    if (!/^\d{13}$/.test(citizenId)) {
        return false;
    }

    // business rule: ไม่รับเลขที่ขึ้นต้นด้วย 0 หรือ 9
    if (/[09]/.test(citizenId.charAt(0))) {
        return false;
    }

    const sum = citizenId
        .slice(0, 12)
        .split("")
        .reduce((total, digit, index) => total + Number(digit) * (13 - index), 0);

    const expectedCheckDigit = (11 - (sum % 11)) % 10;
    const actualCheckDigit = Number(citizenId.charAt(12));

    return expectedCheckDigit === actualCheckDigit;
};

export const validatePhoneNumber = (phoneNo: string): boolean => {
    // remove -
    phoneNo = phoneNo.replace("-", "").trim();

    const pattern = new RegExp(/^0\d{9}$/);

    if (!pattern.test(phoneNo)) {
        //if found charactor will return false
        return false;
    }

    return true; //มี 10 หลักและขึ้นต้นด้วย 0
};

export const validateBankAccountNo = (accountNo: string): boolean => {
    return /^\d{10,15}$/.test(accountNo);
};
