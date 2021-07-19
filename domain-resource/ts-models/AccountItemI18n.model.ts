import { Table, PrimaryKey, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import AccountItem from "./AccountItem.model";

@Table({
    tableName: "accountitem_i18n",
    timestamps: false,
})
class AccountItemI18n extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => AccountItem)
    @Column({
        type: DataType.INTEGER,
        field: "account_item_id",
    })
    accountItemId: number;

    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "language_id",
    })
    languageId: number;

    @Column(DataType.STRING(50))
    name: string;

    @BelongsTo(() => AccountItem)
    AccountItem: AccountItem;
}

export default AccountItemI18n;
