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

import RaBody from "./RaBody.model";
import RaDetails from "./RaDetails.model";
import Employee from "./Employee.model";
import Customer from "./Customer.model";

@Table({
    tableName: "ra_header",
})
class RaHeader extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "ra_header_id",
    })
    id: number;

    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.BIGINT,
        field: "ra_header_no",
    })
    no: number;

    @AllowNull(false)
    @Column({
        type: DataType.DATEONLY,
        field: "trans_date",
    })
    transDate: Date | string;

    @AllowNull(false)
    @Column({
        type: DataType.DATEONLY,
        field: "pay_date",
    })
    payDate: Date | string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    type: number;

    @Column(DataType.INTEGER)
    catalog: number;

    @Column({
        type: DataType.DECIMAL(16, 3),
        field: "in_amount",
    })
    inAmount: number;

    @Column({
        type: DataType.DECIMAL(16, 3),
        field: "out_amount",
    })
    outAmount: number;

    @Column({
        type: DataType.DECIMAL(5, 3),
        field: "tax_rate",
    })
    taxRate: number;

    @Column(DataType.STRING(10))
    invoice: string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER({ length: 1 }),
        field: "pay_type",
    })
    payType: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "account_id",
    })
    accountId: number;

    @Default(null)
    @ForeignKey(() => Customer)
    @Column({
        type: DataType.INTEGER,
        field: "customer_id",
    })
    customerId: number;

    @Default(null)
    @Column({
        type: DataType.INTEGER,
        field: "parent_id",
    })
    parentId: number;

    @Default(null)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "employee_id",
    })
    empId: number;

    @Column(DataType.TEXT)
    rmk: string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 2 }))
    source: number;

    @Column(DataType.INTEGER)
    sourceId: number;

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

    @HasMany(() => RaBody)
    RaBodies: RaBody[];

    @HasMany(() => RaDetails)
    RaDetails: RaDetails[];

    @BelongsTo(() => Employee)
    Employee: Employee;

    @BelongsTo(() => Customer)
    Customer: Customer;
}

export default RaHeader;
