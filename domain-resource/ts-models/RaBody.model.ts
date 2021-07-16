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
import RaHeader from "./RaHeader.model";

@Table({
    tableName: "ra_body",
})
class RaBody extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "ra_body_id",
    })
    id: number;

    @AllowNull(false)
    @ForeignKey(() => RaHeader)
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
        type: DataType.DECIMAL(16, 3),
        field: "in_amount",
    })
    inAmount: number;

    @Column({
        type: DataType.DECIMAL(16, 3),
        field: "out_amount",
    })
    outAmount: number;

    @Column(DataType.STRING(200))
    rmk: string;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER({ length: 1 }),
        field: "tax_type",
    })
    taxType: number;

    @Default(0)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER({ length: 1 }),
        field: "main_row",
    })
    mainRow: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => RaHeader)
    RaHeader: RaHeader;


    @BelongsTo(() => AccountItem)
    AccountItem: AccountItem;
}

export default RaBody;
