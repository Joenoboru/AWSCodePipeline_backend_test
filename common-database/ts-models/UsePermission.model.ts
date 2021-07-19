import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    AllowNull,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";

@Table({
    tableName: "use_permissions",
})
class UsePermission extends Model {
    @PrimaryKey
    @AllowNull(false)
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.TEXT)
    name: string;

    @Column(DataType.TEXT)
    logo: string;

    @Column(DataType.STRING)
    domain: string;

    @Column(DataType.DATE)
    from: string;

    @Column(DataType.DATE)
    until: string;

    @Column(DataType.TEXT)
    description: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default UsePermission;
