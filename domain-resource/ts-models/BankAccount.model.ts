import {
    Table,
    PrimaryKey,
    AutoIncrement,
    Column,
    Model,
    DataType,
    Default,
    AllowNull,
    ForeignKey,
    BelongsTo,
    HasMany,
} from "sequelize-typescript";
import Corporate from "./Corporate.model";
import AccountItem from "./AccountItem.model";
import BankAccountI18n from "./BankAccountI18n.model";
import BankAccountState from "./BankAccountState.model";

@Table({
    tableName: "bank_account",
    timestamps: false, //TODO: it should not be false
})
class BankAccount extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "bank_account_id",
    })
    id: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "currency_id",
    })
    currencyId: number;

    @Default(0)
    @Column(DataType.INTEGER({ length: 2 }))
    type: number;

    @Column({
        type: DataType.STRING(10),
        field: "bank_code",
    })
    code: string;

    @Column({
        type: DataType.STRING(30),
        field: "account_number",
    })
    accountNumber: string;

    @ForeignKey(() => Corporate)
    @Column({
        type: DataType.INTEGER,
        field: "corporate_id",
    })
    corporateId: number;

    @Default("")
    @Column(DataType.STRING(200))
    rmk: string;

    @ForeignKey(() => AccountItem)
    @Column({
        type: DataType.INTEGER,
        field: "acc_item",
    })
    accItem: number;

    @Column({
        type: DataType.STRING(10),
        field: "acc_item_sub",
    })
    accItemSub: number;

    @BelongsTo(() => Corporate)
    Corporate: Corporate;

    @BelongsTo(() => AccountItem)
    AccountItem: AccountItem;

    @HasMany(() => BankAccountI18n)
    BankAccountI18n: BankAccountI18n[];

    @HasMany(() => BankAccountState)
    BankAccountStates: BankAccountState[];
}

export default BankAccount;
