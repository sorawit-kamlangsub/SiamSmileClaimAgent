export const validateThaiCitizenID = (id: string): boolean => {
    // remove -
    id = id.replace("-", "").trim();
    if (id.length !== 13 || id.charAt(0).match(/[09]/)) return false;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(id.charAt(i)) * (13 - i);
    }

    if ((11 - (sum % 11)) % 10 !== parseInt(id.charAt(12))) {
        return false;
    }

    return true;
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
