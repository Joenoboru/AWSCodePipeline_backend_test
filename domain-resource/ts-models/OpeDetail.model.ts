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
import Ope from "./Ope.model";

@Table({
    tableName: "ope_details",
})
class OpeDetail extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "ope_detail_id",
    })
    id: number;

    @AllowNull(false)
    @ForeignKey(() => Ope)
    @Column({
        type: DataType.INTEGER,
        field: "header_id",
    })
    headerId: number;

    @AllowNull(false)
    @ForeignKey(() => AccountItem)
    @Column({
        type: DataType.INTEGER,
        field: "acc_item",
    })
    accItem: number;

    @Column({
        type: DataType.STRING(10),
        field: "receipt_type",
    })
    receiptType: number;

    @Column(DataType.STRING(10))
    invoice: string;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER({ length: 1 }),
        field: "tax_type",
    })
    taxType: number;

    @Column(DataType.STRING(200))
    comment: string;

    @Default(0.0)
    @Column(DataType.DECIMAL(16, 3))
    amount: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => Ope)
    Ope: Ope;

    @BelongsTo(() => AccountItem)
    AccountItem: AccountItem;
}

export default OpeDetail;
