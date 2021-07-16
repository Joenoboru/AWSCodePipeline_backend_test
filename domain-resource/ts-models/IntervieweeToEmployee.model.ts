import { Table, PrimaryKey, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import Interviewee from "./Interviewee.model";
import Employee from "./Employee.model";

@Table({
    tableName: "interviewee_to_employee",
    timestamps: false,
})
class IntervieweeToEmployee extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Interviewee)
    @Column({
        type: DataType.INTEGER,
        field: "interviewee_id",
    })
    intervieweeId: number;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "employee_id",
    })
    employeeId: number;

    @BelongsTo(() => Employee)
    Employee: Employee;

    @BelongsTo(() => Interviewee)
    Interviewee: Interviewee;
}

export default IntervieweeToEmployee;
