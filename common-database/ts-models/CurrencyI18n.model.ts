import { Table, PrimaryKey, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";

import Currency from "./Currency.model";
import Language from "./Language.model";
@Table({
    tableName: "currency_i18n",
    timestamps: false,
})
class CurrencyI18n extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Currency)
    @Column({
        type: DataType.INTEGER,
        field: "currency_id",
    })
    currencyId: number;

    @PrimaryKey
    @ForeignKey(() => Language)
    @Column({
        type: DataType.INTEGER,
        field: "language_id",
    })
    languageId: number;

    @Column(DataType.STRING(50))
    name: string;

    @BelongsTo(() => Currency)
    Currency: Currency;

    @BelongsTo(() => Language)
    Language: Language;
}

export default CurrencyI18n;
