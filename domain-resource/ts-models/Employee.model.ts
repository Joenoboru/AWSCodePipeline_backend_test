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
    Default,
    Unique,
    BelongsTo,
    ForeignKey,
    BelongsToMany,
    HasMany,
} from "sequelize-typescript";
import WorkLevel from "./WorkLevel.model";
import DepartPos from "./DepartPos.model";
import EmpWork from "./EmpWork.model";
import PermissionGroup from "./PermissionGroup.model";
import EmpPermissionGroup from "./EmpPermissionGroup.model";
import Attendance from "./Attendance.model";
import DeputyData from "./DeputyData.model";
import SalaryDef from "./SalaryDef.model";
import EmployeeMonthSalary from "./EmployeeMonthSalary.model";
import ExtraHoursReq from "./ExtraHoursReq.model";
import LeaveReq from "./LeaveReq.model";
import Ope from "./Ope.model";
import YearLeaveHour from "./YearLeaveHour.model";

@Table({
    tableName: "employees",
})
class Employee extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    name: string;

    @Column(DataType.STRING(50))
    engname: string;

    @Unique
    @Column(DataType.STRING(10))
    emp_num: string;

    @Column(DataType.DATEONLY)
    hire_date: Date;

    @Column(DataType.DATEONLY)
    prob_start: Date;

    @Column(DataType.DATEONLY)
    prob_end: Date;

    @Column(DataType.DATEONLY)
    leave_date: Date;

    @Column(DataType.STRING(10))
    work_title: string;

    @Column(DataType.INTEGER({ length: 1 }))
    sex: number;

    @Column(DataType.DATEONLY)
    birthday: Date;

    @Column(DataType.STRING(20))
    personID: string;

    @Column(DataType.STRING(20))
    bank_account: string;

    @Column(DataType.STRING(2))
    nationality: string;

    @Column(DataType.STRING(256))
    reg_addr: string;

    @Column(DataType.STRING(256))
    con_addr: string;

    @Column(DataType.STRING(12))
    tel: string;

    @Column(DataType.STRING(12))
    mobile: string;

    @Column(DataType.STRING(50))
    email: string;

    @Column(DataType.STRING(50))
    private_email: string;

    @Column(DataType.STRING(50))
    finaledu: string;

    @Column(DataType.STRING(50))
    gradschool: string;

    @Column(DataType.STRING(50))
    major: string;

    @Column(DataType.STRING(50))
    emer_name: string;

    @Column(DataType.STRING(50))
    emer_relat: string;

    @Column(DataType.STRING(12))
    emer_tel: string;

    @Column(DataType.TEXT)
    rmk: string;

    @Column(DataType.INTEGER({ length: 2 }))
    dependents: number;

    @AllowNull(false)
    @Default(1)
    @Column(DataType.INTEGER({ length: 2 }))
    status: number;

    @AllowNull(false)
    @Default(1)
    @ForeignKey(() => WorkLevel)
    @Column({ type: DataType.INTEGER({ length: 2 }), field: "work_level" })
    workLevel: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsToMany(() => DepartPos, () => EmpWork)
    DepartPos: Array<DepartPos & { EmpWork: EmpWork }>;

    @BelongsToMany(() => PermissionGroup, () => EmpPermissionGroup)
    PermissionGroups: Array<PermissionGroup & { EmpPermissionGroup: EmpPermissionGroup }>;

    @BelongsTo(() => WorkLevel)
    WorkLevel: WorkLevel;

    @HasMany(() => Attendance)
    Attendances: Attendance[];

    @HasMany(() => DeputyData, "empId")
    Deputies: DeputyData[];

    @HasMany(() => DeputyData, "deputyId")
    Principals: DeputyData[];

    @HasMany(() => SalaryDef)
    SalaryDefs: SalaryDef[];

    @HasMany(() => EmployeeMonthSalary)
    EmployeeMonthSalaries: EmployeeMonthSalary[];

    @HasMany(() => ExtraHoursReq)
    ExtraHoursReqs: ExtraHoursReq[];

    @HasMany(() => LeaveReq)
    LeaveReqs: LeaveReq[];

    @HasMany(() => Ope)
    Opes: Ope[];

    @HasMany(() => YearLeaveHour)
    YearLeaveHours: YearLeaveHour[];
}
export default Employee;
