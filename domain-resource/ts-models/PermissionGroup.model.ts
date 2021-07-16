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
    BelongsToMany,
} from "sequelize-typescript";
import Employee from "./Employee.model";
import EmpPermissionGroup from "./EmpPermissionGroup.model";

@Table({
    tableName: "permission_group",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class PermissionGroup extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "permission_group_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @Column(DataType.STRING)
    description: string;

    @Column(DataType.INTEGER({ length: 1 }))
    status: string;

    @Column(DataType.STRING(50))
    tag: string;

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
    
    @BelongsToMany(() => Employee, () => EmpPermissionGroup)
    Employees: Array<Employee & { EmpPermissionGroup: EmpPermissionGroup }>;
}

export default PermissionGroup;
