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
import SalaryItem from "./SalaryItem.model";
import Employee from "./Employee.model";

@Table({
    tableName: "salary_defs",
    createdAt: "create_at",
    updatedAt: "update_at",
    indexes: [
        {
            unique: true,
            fields: ["employee", "item"],
        },
    ],
})
class SalaryDef extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "salary_def_id",
    })
    id: number;

    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column(DataType.INTEGER)
    employee: number;

    @AllowNull(false)
    @ForeignKey(() => SalaryItem)
    @Column(DataType.INTEGER)
    item: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    amount: number;

    @Column(DataType.STRING(50))
    rmk: string;

    @Column({ type: DataType.INTEGER, field: "create_user" })
    createUser: number;

    @Column({ type: DataType.INTEGER, field: "update_user" })
    updateUser: number;

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

    @BelongsTo(() => SalaryItem)
    SalaryItem: SalaryItem;

    @BelongsTo(() => Employee)
    Employee: Employee;
}

export default SalaryDef;
