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
    HasMany,
} from "sequelize-typescript";

import Employee from "./Employee.model";
import YearLeaveHourRecord from "./YearLeaveHourRecord.model";
import YearLeaveHourExtraRecord from "./YearLeaveHourExtraRecord.model";

@Table({
    tableName: "year_leave_hour",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class YearLeaveHour extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "employee_vacation_hour_id",
    })
    id: number;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "employee_id",
    })
    employeeId: number;

    @Column({
        type: DataType.DATEONLY,
        field: "start_date",
    })
    startDate: Date | string;

    @Column({
        type: DataType.DATEONLY,
        field: "end_date",
    })
    endDate: Date | string;

    @Column(DataType.JSON)
    hours: any;

    @Column({ type: DataType.INTEGER, field: "create_user" })
    createdUser: number;

    @Column({ type: DataType.INTEGER, field: "update_user" })
    updatedUser: number;

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

    @HasMany(() => YearLeaveHourRecord)
    YearLeaveHourRecords: YearLeaveHourRecord[];

    @HasMany(() => YearLeaveHourExtraRecord)
    YearLeaveHourExtraRecords: YearLeaveHourExtraRecord[];
}

export default YearLeaveHour;
