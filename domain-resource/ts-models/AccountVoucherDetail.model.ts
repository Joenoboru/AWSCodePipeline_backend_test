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
    ForeignKey,
    BelongsTo,
    Default,
} from "sequelize-typescript";

import AccountItem from "./AccountItem.model";
import AccountVoucher from "./AccountVoucher.model";

@Table({
    tableName: "account_voucher_detail",
})
class AccountVoucherDetail extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "account_voucher_detail_id",
    })
    id: number;

    @AllowNull(false)
    @ForeignKey(() => AccountVoucher)
    @Column({
        type: DataType.INTEGER,
        field: "voucher_id",
    })
    voucherId: number;

    @AllowNull(false)
    @ForeignKey(() => AccountItem)
    @Column({
        type: DataType.INTEGER,
        field: "acc_item",
    })
    accItem: number;

    @Column({
        type: DataType.INTEGER,
        field: "acc_item_sub",
    })
    accItemSub: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.DECIMAL(16, 3))
    debit: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.DECIMAL(16, 3))
    credit: number;

    @Column(DataType.STRING(200))
    rmk: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => AccountVoucher)
    RaHeader: AccountVoucher;

    @BelongsTo(() => AccountItem)
    AccountItem: AccountItem;
}

export default AccountVoucherDetail;
