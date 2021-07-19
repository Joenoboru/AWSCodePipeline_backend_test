import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    Default,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import Route from "./Route.model";
import Employee from "./Employee.model";
import AuditRecord from "./AuditRecord.model";

@Table({
    tableName: "audit_record_detail",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class AuditRecordDetail extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => AuditRecord)
    @Column({
        type: DataType.INTEGER,
        field: "audit_record_id",
    })
    auditRecordId: number;

    @PrimaryKey
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: "seq_no" })
    seqNo: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER({ length: 1 }), field: "stage_no" })
    stageNo: number;

    @ForeignKey(() => Route)
    @Column({
        type: DataType.INTEGER,
        field: "route_id",
    })
    routeId: number;

    @ForeignKey(() => Employee)
    @Column({ type: DataType.INTEGER, field: "auditor_id" })
    auditorId: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @Column(DataType.STRING(2048))
    remark: string;

    @Column({
        type: DataType.TEXT,
        field: "audit_data",
        get: function () {
            const dataValue = this.getDataValue("auditData");
            if (typeof dataValue === "object") {
                return dataValue;
            }
            if (typeof dataValue === "string") {
                return JSON.parse(dataValue);
            }
            return null;
        },
        set: function (value) {
            this.setDataValue("auditData", JSON.stringify(value));
        },
    })
    auditData: string;

    @ForeignKey(() => Employee)
    @Column({ type: DataType.INTEGER, field: "deputy_id" })
    deputyId: number;

    @Column({ type: DataType.INTEGER, field: "create_user" })
    createUser: number;

    @Column({ type: DataType.INTEGER, field: "update_user" })
    updateUser: number;

    @CreatedAt
    @Column({
        field: "create_at",
    })
    createdAt: Date;

    @UpdatedAt
    @Column({
        field: "update_at",
    })
    updatedAt: Date;

    @BelongsTo(() => AuditRecord)
    AuditRecord: AuditRecord;

    @BelongsTo(() => Employee, "deputyId")
    Deputy: Employee;

    @BelongsTo(() => Employee, "auditorId")
    Auditor: Employee;
}

export default AuditRecordDetail;
