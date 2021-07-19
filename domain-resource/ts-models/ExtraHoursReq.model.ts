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

@Table({
    tableName: "extrahoursreqs",
})
class ExtraHoursReq extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.DATEONLY)
    date: Date | string;

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
    @Column(DataType.INTEGER({ length: 1 }))
    type: number;

    @Column(DataType.FLOAT)
    hours: number;

    @Column(DataType.TEXT)
    reason: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    comp: number;

    @Column(DataType.TEXT)
    rmk: string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 2 }))
    status: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => Employee)
    Employee: Employee;
}

export default ExtraHoursReq;
