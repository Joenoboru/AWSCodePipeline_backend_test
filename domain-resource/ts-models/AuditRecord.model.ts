import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    HasMany,
} from "sequelize-typescript";
import Form from "./Form.model";
import Route from "./Route.model";
import AuditRecordDetail from "./AuditRecordDetail.model";

@Table({
    tableName: "audit_record",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class AuditRecord extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "audit_record_id",
    })
    id: number;

    @AllowNull(false)
    @ForeignKey(() => Form)
    @Column({
        type: DataType.INTEGER,
        field: "form_id",
    })
    formId: number;

    @AllowNull(false)
    @ForeignKey(() => Route)
    @Column({
        type: DataType.INTEGER,
        field: "route_id",
    })
    routeId: number;

    @Column({ type: DataType.STRING, field: "form_tag" })
    formTag: string;

    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @Column(DataType.BOOLEAN)
    viewed: boolean;

    @Column({ type: DataType.INTEGER({ length: 1 }), field: "action_type" })
    actionType: number;

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
    auditData: any;

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

    @BelongsTo(() => Form)
    Form: Form;

    @BelongsTo(() => Route)
    Route: Route;

    @HasMany(() => AuditRecordDetail, "auditRecordId")
    lastAuditor: AuditRecordDetail[];

    @HasMany(() => AuditRecordDetail, "auditRecordId")
    arDetail: AuditRecordDetail[];
}

export default AuditRecord;
