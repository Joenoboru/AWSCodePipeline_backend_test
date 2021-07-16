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
} from "sequelize-typescript";

@Table({
    tableName: "work_positon"
})
class WorkPosition extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.INTEGER)
    order: number;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    name: string;

    @AllowNull(true)
    @Column(DataType.STRING(255))
    jpName: string;

    @AllowNull(true)
    @Column(DataType.STRING(255))
    enName: string;

    @Column(DataType.TEXT)
    remark: string;

    @Column(DataType.INTEGER)
    createdUser: number;

    @Column(DataType.INTEGER)
    updatedUser: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default WorkPosition;
