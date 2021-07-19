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
import DepartPos from "./DepartPos.model";

@Table({
    tableName: "empworks",
    indexes: [
        {
            unique: true,
            fields: ["emp", "workpos"],
        },
    ],
})
class EmpWork extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column(DataType.INTEGER)
    emp: number;

    @AllowNull(false)
    @ForeignKey(() => DepartPos)
    @Column(DataType.INTEGER)
    workpos: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({length: 3}))
    ord: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({length: 2}))
    status: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => Employee)
    Employee: Employee;

    @BelongsTo(() => DepartPos)
    DepartPos: DepartPos;
}
export default EmpWork;
