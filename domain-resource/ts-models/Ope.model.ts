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
    HasMany,
    BelongsTo,
} from "sequelize-typescript";

import Employee from "./Employee.model";
import BankAccount from "./BankAccount.model";
import OpeDetail from "./OpeDetail.model";

@Table({
    tableName: "ope",
})
class Ope extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "ope_id",
    })
    id: number;

    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.BIGINT,
        field: "ope_no",
    })
    no: number;

    @AllowNull(false)
    @Column({
        type: DataType.DATEONLY,
        field: "trans_date",
    })
    transDate: Date | string;

    @Column({
        type: DataType.DATEONLY,
        field: "repay_date",
    })
    repayDate: Date | string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @Default(null)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "employee_id",
    })
    empId: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    amount: number;

    @AllowNull(false)
    @ForeignKey(() => BankAccount)
    @Column({
        type: DataType.INTEGER,
        field: "account_id",
    })
    accountId: number;

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

    @HasMany(() => OpeDetail)
    OpeDetails: OpeDetail[];

    @BelongsTo(() => Employee)
    Employee: Employee;

    @BelongsTo(() => BankAccount)
    BankAccount: BankAccount;
}

export default Ope;
