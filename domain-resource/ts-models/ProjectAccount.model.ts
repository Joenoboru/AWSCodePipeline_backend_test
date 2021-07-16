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
    BelongsTo,
    ForeignKey,
} from "sequelize-typescript";
import Project from "./Project.model";

@Table({
    tableName: "project_accounts",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class ProjectAccount extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: "project_account_id" })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    title: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    amount: number;

    @AllowNull(false)
    @ForeignKey(() => Project)
    @Column({ type: DataType.INTEGER, field: "project_id" })
    projectId: number;

    @Column(DataType.STRING(256))
    rmk: string;

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

    @BelongsTo(() => Project)
    Project: Project;
}

export default ProjectAccount;
