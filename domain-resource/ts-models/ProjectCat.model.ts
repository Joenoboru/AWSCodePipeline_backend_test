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
    HasMany,
} from "sequelize-typescript";

import Project from "./Project.model";

@Table({
    tableName: "project_cats",
    createdAt: "created_at",
    updatedAt: "updated_at",
})
class ProjectCat extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "project_cat_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    name: string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 2 }))
    status: number;

    @Column(DataType.STRING(200))
    rmk: string;

    @CreatedAt
    @Column({
        field: "created_at",
    })
    createdAt: Date;

    @UpdatedAt
    @Column({
        field: "updated_at",
    })
    updatedAt: Date;

    @HasMany(() => Project)
    Projects: Project[];
}

export default ProjectCat;
