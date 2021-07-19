import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    AllowNull,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import BankAccount from "./BankAccount.model";

@Table({
    tableName: "bank_account_state",
    createdAt: "created_at",
    updatedAt: "updated_at",
})
class BankAccountState extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.DATEONLY,
        field: "settle_date",
    })
    settleDate: Date | string;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => BankAccount)
    @Column({
        type: DataType.INTEGER,
        field: "bank_account_id",
    })
    bankAccountId: number;

    @AllowNull(false)
    @Column(DataType.DECIMAL)
    amount: number;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    manual: boolean;

    @Column({ type: DataType.INTEGER, field: "created_user" })
    createdUser: number;

    @Column({ type: DataType.INTEGER, field: "updated_user" })
    updatedUser: number;

    @CreatedAt
    @Column({
        field: "created_at",
    })
    createdAt: Date;

    @UpdatedAt
    @Column({
        field: "updated_at",
    })
    updatedAt: Date;

    @BelongsTo(() => BankAccount)
    BankAccount: BankAccount;
}

export default BankAccountState;
