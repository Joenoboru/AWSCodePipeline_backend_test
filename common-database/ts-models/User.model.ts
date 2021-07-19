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
    Unique,
} from "sequelize-typescript";

@Table({
    tableName: "users",
})
class User extends Model {
    @PrimaryKey
    @AllowNull(false)
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING(50))
    email: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @Column(DataType.STRING(256))
    domain: string;

    @Column(DataType.STRING(256))
    pass: string;

    @Column(DataType.INTEGER)
    grp: number;

    @Column(DataType.TEXT)
    rmk: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default User;
