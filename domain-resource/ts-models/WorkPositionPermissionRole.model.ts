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

import WorkPositon from "./WorkPosition.model";
import PermissionRole from "./PermissionRole.model";

@Table({
  tableName: "work_position_permission_role"
})
class WorkPositionPserMissionRole extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @ForeignKey(() => WorkPositon)
  @Column(DataType.INTEGER)
  workPositionId: number;

  @AllowNull(false)
  @ForeignKey(() => PermissionRole)
  @Column(DataType.INTEGER)
  permissionRoleId: number;

  @Column(DataType.INTEGER)
  createdUser: number;

  @Column(DataType.INTEGER)
  updatedUser: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => WorkPositon)
  WorkPositon: WorkPositon;

  @BelongsTo(() => PermissionRole)
  PermissionRole: PermissionRole;
}

export default WorkPositionPserMissionRole;
