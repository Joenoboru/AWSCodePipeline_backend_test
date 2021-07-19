import { Table, PrimaryKey, Column, Model, DataType, AllowNull, AutoIncrement, HasMany } from "sequelize-typescript";

import CurrencyI18n from "./CurrencyI18n.model";
@Table({
    tableName: "currency",
    timestamps: false,
})
class Currency extends Model {
    @PrimaryKey
    @AllowNull(false)
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        field: "currency_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(10))
    symbol: string;

    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.STRING(50))
    code: string;

    @HasMany(() => CurrencyI18n)
    CurrencyI18n: CurrencyI18n[];
}

export default Currency;
