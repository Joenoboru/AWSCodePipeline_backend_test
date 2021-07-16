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
    Unique,
} from "sequelize-typescript";

@Table({
    tableName: "worklevels",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class WorkLevel extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "worklevel_id",
    })
    id: number;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING(20))
    name: string;

    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @Column(DataType.INTEGER)
    cost: number;

    @Column(DataType.STRING)
    rmk: string;


    @Column({
        type: DataType.BOOLEAN,
        field: "is_hirer",
    })
    isHirer: boolean;

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
}

export default WorkLevel;
