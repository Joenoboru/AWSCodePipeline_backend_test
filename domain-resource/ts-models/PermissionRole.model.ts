import {
    Table,
    PrimaryKey,
    AutoIncrement,
    Column,
    Model,
    DataType,
    Default,
    AllowNull,
    CreatedAt,
    UpdatedAt,
    HasMany,
} from "sequelize-typescript";
import PermissionRoleAuthorize from "./PermissionRoleAuthorize.model";

@Table({
    tableName: "permission_role"
})
class PermissionRole extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @Column(DataType.STRING)
    description: string;

    @AllowNull(false)
    @Default(1)
    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @Column(DataType.INTEGER)
    createdUser: number;

    @Column(DataType.INTEGER)
    updatedUser: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => PermissionRoleAuthorize)
    permissionRoleAuthorizes: PermissionRoleAuthorize[];
}

export default PermissionRole;
