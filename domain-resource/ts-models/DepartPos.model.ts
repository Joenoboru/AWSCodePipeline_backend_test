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
    HasMany,
    BelongsTo,
    BelongsToMany,
} from "sequelize-typescript";
import Department from "./Department.model";
import WorkPosition from "./WorkPosition.model";
import Employee from "./Employee.model";
3;
import EmpWork from "./EmpWork.model";

@Table({
    tableName: "departpos",
    indexes: [
        {
            unique: true,
            fields: ["depart", "workpos"],
        },
    ],
})
class DepartPos extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @ForeignKey(() => Department)
    @Column(DataType.INTEGER)
    depart: number;

    @AllowNull(false)
    @ForeignKey(() => WorkPosition)
    @Column(DataType.INTEGER)
    workpos: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => WorkPosition)
    WorkPosition: WorkPosition;

    @BelongsTo(() => Department)
    Department: Department;

    @BelongsToMany(() => Employee, () => EmpWork)
    Employees: Array<Employee & { EmpWork: EmpWork }>;

    @HasMany(() => EmpWork)
    EmpWorks: EmpWork[];
}
export default DepartPos;
