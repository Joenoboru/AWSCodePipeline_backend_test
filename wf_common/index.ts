import errors from "./errorDef.json";
import BankaccountStateEnum from "./BankaccountStateEnum";
// type ErrorDesc = {
//     code: string;
//     desc: string;
//     key: string;
// };

function getErrorDescByCode(code: string): string {
    const useErrors: { [index: string]: any } = errors;
    if (!code) {
        return "";
    }
    if (code === "") {
        return "";
    }
    const errorType: any = useErrors[code];
    if (errorType) {
        return `(${errorType.desc})`;
    }
    return code;
}
enum ErrorDef {
    dbConnError = "101",
    userNotLogin = "102",
    noAuth = "103",
    formInvalid = "201",
    DataNotFound = "202",
    ErrorTran = "203",
    FILE_NOT_FOUND = "204",
    IntervieweeTransError1 = "501",
    FormRouteNotSet = "901",
    AuditFail = "902",
    FormNotFound = "903",
    CantDeputy = "904",
    ACTION_TYPE_INVALID = "905",
    BankaccountStateSettleDatePKError = "1001",
    FILE_INVALID = "205",
    ACCOUNTITEM_CODE_INVALID = "1002",
    USER_NOT_FOUND = "1101",
    USER_PASSWORD_ERROR = "1102",
    BANKACCOUNT_NOT_EXIST = "1201",
    PROHIBIT_ACTION = "9998",
    NOT_SUPPORT = "9999",
}

export { ErrorDef, getErrorDescByCode, BankaccountStateEnum };
