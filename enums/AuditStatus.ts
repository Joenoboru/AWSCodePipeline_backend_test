enum MainStatus {
    DRAFT = 0,
    ONGOING = 1,
    DONE = 2,
    REJECT = 3,
    VOID = 4,
}
enum DetailStatus {
    PENDING = 0,
    PASS = 1,
    REJECT = 2,
    RETURN = 3,
    SKIP = 4,
}
const AuditRecordStatus = {
    MainStatus,
    DetailStatus,
};

enum AuditType {
    /**
     * BY DEPT
     */
    BYDEPTANDGRADE = 0,
    /**
     * BY EMP ID
     */
    BYEMP = 1,
}
export { AuditRecordStatus, AuditType };

