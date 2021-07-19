import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    AllowNull,
} from "sequelize-typescript";

@Table({
    tableName: "used_language",
    timestamps: false
})

class UsedLanguage extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "language_id",
    })
    id: number;
}

export default UsedLanguage;
