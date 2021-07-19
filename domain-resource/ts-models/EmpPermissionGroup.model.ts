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
import PermissionGroup from "./PermissionGroup.model";

@Table({
    tableName: "emp_permission_group",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class EmpPermissionGroup extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "emp_id",
    })
    empId: number;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => PermissionGroup)
    @Column({
        type: DataType.INTEGER,
        field: "permission_group_id",
    })
    permissionGroupId: number;

    @AllowNull(false)
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

    @BelongsTo(() => Employee)
    Employee: Employee;

    @BelongsTo(() => PermissionGroup)
    PermissionGroup: PermissionGroup;
}
export default EmpPermissionGroup;
