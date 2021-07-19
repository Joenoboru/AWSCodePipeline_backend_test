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
import LeaveType from "./LeaveType.model";

@Table({
    tableName: "leave_reqs",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class LeaveReq extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "leave_req_id",
    })
    id: number;

    @AllowNull(false)
    @Column({
        type: DataType.TIME,
        field: "start_time",
    })
    startTime: Date | string;

    @AllowNull(false)
    @Column({
        type: DataType.TIME,
        field: "end_time",
    })
    endTime: Date | string;

    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "employee",
    })
    employeeId: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    needhours: number;

    @AllowNull(false)
    @ForeignKey(() => LeaveType)
    @Column(DataType.INTEGER)
    type: number;

    @Column(DataType.TEXT)
    reason: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 2 }))
    status: number;

    @Column(DataType.TEXT)
    rmk: string;

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

    @BelongsTo(() => Employee)
    Employee: Employee;

    @BelongsTo(() => LeaveType)
    LeaveType: LeaveType;
}

export default LeaveReq;
