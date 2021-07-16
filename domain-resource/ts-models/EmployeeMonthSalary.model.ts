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

@Table({
    tableName: "employee_month_salary",
    createdAt: "create_at",
    updatedAt: "update_at",
    indexes: [
        {
            unique: true,
            fields: ["employee", "item"],
        },
    ],
})
class EmployeeMonthSalary extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "employee_id",
    })
    employeeId: number;

    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "year_month",
    })
    yearMonth: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "total_amount_emp",
    })
    totalAmountEmp: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "total_amount_company",
    })
    totalAmountCompany: number;

    @AllowNull(false)
    @Column(DataType.JSON)
    detail: string;

    @AllowNull(false)
    @Column(DataType.JSON)
    logic: string;

    @Column({
        type: DataType.FLOAT,
        field: "total_hours",
    })
    totalHours: number;

    @Column({
        type: DataType.FLOAT,
        field: "origin_total_extra_hours",
    })
    originTotalExtraHours: number;

    @Column({
        type: DataType.FLOAT,
        field: "total_extra_hours",
    })
    totalExtraHours: number;

    @Column({
        type: DataType.FLOAT,
        field: "total_absence_hours",
    })
    totalAbsenceHours: number;

    @Column({
        type: DataType.FLOAT,
        field: "total_leave_hours",
    })
    totalLeaveHours: number;

    @Column({
        type: DataType.JSON,
        field: "employee_work_datas",
    })
    employeeWorkDatas: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    insurance: number;

    @Column({
        type: DataType.JSON,
        field: "insurance_detail",
    })
    insuranceDetail: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "tax_paid_amount",
    })
    taxPaidAmount: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "must_pay",
    })
    mustPay: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "must_deduct",
    })
    mustDeduct: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "hours_amount",
    })
    hoursAmount: number;

    @Column(DataType.INTEGER)
    status: number;

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
}

export default EmployeeMonthSalary;
