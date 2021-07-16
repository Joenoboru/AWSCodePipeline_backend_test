import {
    Table,
    PrimaryKey,
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
import YearLeaveHour from "./YearLeaveHour.model";

@Table({
    tableName: "year_leave_hour_record",
    createdAt: "created_at",
    updatedAt: "updated_at",
})
class YearLeaveHourRecord extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => YearLeaveHour)
    @Column({
        type: DataType.INTEGER,
        field: "year_leave_hour_id",
    })
    id: number;

    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.STRING)
    type: string;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "employee_id",
    })
    employeeId: number;
   
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

    @BelongsTo(() => YearLeaveHour)
    YearLeaveHour: YearLeaveHour;
}

export default YearLeaveHourRecord;
