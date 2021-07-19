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
    tableName: "announce",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class Announce extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "announce_id",
    })
    id: number;

    @Column({
        type: DataType.BOOLEAN,
        field: "on_top",
    })
    onTop: boolean;

    @Column(DataType.BOOLEAN)
    show: boolean;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    title: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    content: string;

    @Column({
        type: DataType.INTEGER,
        field: "create_user",
    })
    createUser: number;

    @Column({
        type: DataType.INTEGER,
        field: "update_user",
    })
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
    /*@HasMany(() => Hobby)
    hobbies: Hobby[];*/
}

export default Announce;
