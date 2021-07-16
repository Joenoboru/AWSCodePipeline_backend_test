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
    Default,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";

import BankAccount from "./BankAccount.model";

@Table({
    tableName: "ra_transfer",
})
class RaTransfer extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "ra_transfer_id",
    })
    id: number;

    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.BIGINT,
        field: "ra_trans_no",
    })
    no: number;

    @AllowNull(false)
    @Column({
        type: DataType.DATEONLY,
        field: "transfer_date",
    })
    date: Date | string;

    @AllowNull(false)
    @Default(0.0)
    @Column(DataType.DECIMAL(16, 3))
    amount: number;

    @ForeignKey(() => BankAccount)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "in_account",
    })
    inAccount: number;

    @ForeignKey(() => BankAccount)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "out_account",
    })
    outAccount: number;

    @AllowNull(false)
    @Default(0.0)
    @Column(DataType.DECIMAL(16, 3))
    fee: number;

    @AllowNull(false)
    @Default(0)
    @Column({
        type: DataType.INTEGER({ length: 1 }),
        field: "fee_target",
    })
    feeTarget: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @Column(DataType.TEXT)
    rmk: string;

    @Column(DataType.JSON)
    attachment: string;

    @Default(0)
    @Column(DataType.INTEGER({ length: 1 }))
    converted: number;

    @Column({ type: DataType.INTEGER, field: "created_user" })
    createdUser: number;

    @Column({ type: DataType.INTEGER, field: "updated_user" })
    updatedUser: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => BankAccount, "inAccount")
    BankAccountIn: BankAccount;

    @BelongsTo(() => BankAccount, "outAccount")
    BankAccountOut: BankAccount;
}

export default RaTransfer;
