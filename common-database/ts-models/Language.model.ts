import { Table, PrimaryKey, Column, Model, DataType, AllowNull } from "sequelize-typescript";

@Table({
    tableName: "language",
    timestamps: false,
})
class Language extends Model {
    
    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "language_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(10))
    lang: string;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    name: string;
}

export default Language;
