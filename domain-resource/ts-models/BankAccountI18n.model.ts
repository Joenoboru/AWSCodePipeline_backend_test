import { Table, PrimaryKey, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import BankAccount from "./BankAccount.model";

@Table({
    tableName: "bank_account_i18n",
    timestamps: false,
})
class BankAccountI18n extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => BankAccount)
    @Column({
        type: DataType.INTEGER,
        field: "bank_account_id",
    })
    bankAccountId: number;

    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "language_id",
    })
    languageId: number;

    @Column(DataType.STRING(50))
    name: string;

    @BelongsTo(() => BankAccount)
    BankAccount: BankAccount;
}

export default BankAccountI18n;
