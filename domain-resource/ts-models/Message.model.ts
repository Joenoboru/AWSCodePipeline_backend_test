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
    tableName: "message",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class Message extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "message_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    email: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    contents: string;

    @Column(DataType.STRING(50))
    link: string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 2 }))
    type: number;

    @AllowNull(false)
    @Column({
        type: DataType.BOOLEAN,
        field: "is_read",
    })
    isRead: boolean;

    @Column(DataType.STRING(50))
    msgkey: string;

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

export default Message;
