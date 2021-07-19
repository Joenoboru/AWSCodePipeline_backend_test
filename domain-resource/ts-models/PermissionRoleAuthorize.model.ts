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
import PermissionRole from "./PermissionRole.model";

@Table({
    tableName: "permission_role_authorize"
})
class PermissionRoleAuthorize extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.INTEGER)
    @ForeignKey(() => PermissionRole)
    permissionRoleId: number;

    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.STRING)
    page: string;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    read: boolean;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    write: boolean;

    @Column(DataType.INTEGER)
    createdUser: number;

    @Column(DataType.INTEGER)
    updatedUser: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => PermissionRole)
    permissionRole: PermissionRole;
}

export default PermissionRoleAuthorize;
