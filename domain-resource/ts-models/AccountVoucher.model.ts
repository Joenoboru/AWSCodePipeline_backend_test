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
    Unique,
    HasMany,
} from "sequelize-typescript";

import AccountVoucherDetail from "./AccountVoucherDetail.model";

@Table({
    tableName: "account_voucher",
})
class AccountVoucher extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "account_voucher_id",
    })
    id: number;

    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.BIGINT,
        field: "account_voucher_no",
    })
    no: number;

    @AllowNull(false)
    @Column(DataType.DATEONLY)
    date: Date | string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 2 }))
    source: number;

    @Column(DataType.INTEGER)
    sourceId: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    type: number;

    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL(16, 3),
        field: "total_debit",
    })
    totalDebit: number;

    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL(16, 3),
        field: "total_credit",
    })
    totalCredit: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @Column(DataType.STRING(200))
    rmk: string;

    @Column({ type: DataType.INTEGER, field: "created_user" })
    createdUser: number;

    @Column({ type: DataType.INTEGER, field: "updated_user" })
    updatedUser: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => AccountVoucherDetail)
    AccountVoucherDetails: AccountVoucherDetail[];
}

export default AccountVoucher;
