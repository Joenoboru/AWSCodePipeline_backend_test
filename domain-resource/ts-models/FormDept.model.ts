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
import Form from "./Form.model";
import Department from "./Department.model";

@Table({
    tableName: "form_dept",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class FormDept extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Form)
    @Column({
        type: DataType.INTEGER,
        field: "form_id",
    })
    formId: number;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Department)
    @Column({
        type: DataType.INTEGER,
        field: "dept_id",
    })
    deptId: number;

    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

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

    @BelongsTo(() => Form)
    Form: Form;

    @BelongsTo(() => Department)
    Department: Department;
}

export default FormDept;
