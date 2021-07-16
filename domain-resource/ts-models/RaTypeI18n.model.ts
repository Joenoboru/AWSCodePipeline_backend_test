import { Table, PrimaryKey, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import RaType from "./RaType.model";

@Table({
    tableName: "ra_type_i18n",
    timestamps: false,
})
class RaTypeI18n extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => RaType)
    @Column({
        type: DataType.INTEGER,
        field: "ra_type_id",
    })
    raTypeId: number;

    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "language_id",
    })
    languageId: number;

    @Column(DataType.STRING(50))
    name: string;

    @BelongsTo(() => RaType)
    RaType: RaType;
}

export default RaTypeI18n;
