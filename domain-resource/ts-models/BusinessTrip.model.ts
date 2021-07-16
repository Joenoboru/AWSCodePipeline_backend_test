import {
    Table,
    PrimaryKey,
    AutoIncrement,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import Employee from "./Employee.model";
import Project from "./Project.model";
import BankAccount from "./BankAccount.model";

@Table({
    tableName: "business_trip",
    createdAt: "created_at",
    updatedAt: "updated_at",
})
class BusinessTrip extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "business_trip_id",
    })
    id: number;

    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "employee_id",
    })
    employeeId: number;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    title: string;

    @AllowNull(false)
    @Column({
        type: DataType.DATE,
        field: "start_time",
    })
    startTime: string;

    @AllowNull(false)
    @Column({
        type: DataType.DATE,
        field: "end_time",
    })
    endTime: string;

    @Column(DataType.TEXT)
    reason: string;

    @ForeignKey(() => Project)
    @Column({
        type: DataType.INTEGER,
        field: "project_id",
    })
    projectId: number;

    @Column({
        type: DataType.JSON,
        field: "attach_files",
        get: function () {
            const dataValue = this.getDataValue("attachFiles");
            if (typeof dataValue === "object") {
                return dataValue;
            }
            if (typeof dataValue === "string") {
                return JSON.parse(dataValue);
            }
            return null;
        },
        set: function (value) {
            if (typeof value === "object") {
                this.setDataValue("attachFiles", JSON.stringify(value));
            }
            if (typeof value === "string") {
                this.setDataValue("attachFiles", value);
            }
        },
    })
    attachFiles: string;

    @AllowNull(false)
    @ForeignKey(() => BankAccount)
    @Column({
        type: DataType.INTEGER,
        field: "out_account",
    })
    outAccount: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    status: number;

    @CreatedAt
    @Column({
        field: "created_at",
    })
    createdAt: Date;

    @UpdatedAt
    @Column({
        field: "updated_at",
    })
    updatedAt: Date;

    @BelongsTo(() => Employee)
    Employee: Employee;

    @BelongsTo(() => BankAccount)
    BankAccount: BankAccount;
}

export default BusinessTrip;
