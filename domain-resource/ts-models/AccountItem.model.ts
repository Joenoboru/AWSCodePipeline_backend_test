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
    HasMany,
    Unique,
    CreatedAt,
    UpdatedAt,
    BelongsTo,
} from "sequelize-typescript";
import AccountItemI18n from "./AccountItemI18n.model";

@Table({
    tableName: "accountitems",
})
class AccountItem extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING(6))
    code: string;

    @AllowNull(false)
    @Column(DataType.STRING(20))
    name: string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    type: number;

    @AllowNull(false)
    @Default(0)
    @Column({
        type: DataType.INTEGER,
        field: "dc_type",
    })
    dcType: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER({ length: 2 }))
    catalog: number;

    @ForeignKey(() => AccountItem)
    @Column({
        type: DataType.INTEGER,
        field: "catalog_l0",
    })
    catalogL0: number;

    @ForeignKey(() => AccountItem)
    @Column({
        type: DataType.INTEGER,
        field: "catalog_l1",
    })
    catalogL1: number;

    @ForeignKey(() => AccountItem)
    @Column({
        type: DataType.INTEGER,
        field: "catalog_l2",
    })
    catalogL2: number;

    @ForeignKey(() => AccountItem)
    @Column({
        type: DataType.INTEGER,
        field: "catalog_l3",
    })
    catalogL3: number;

    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @Column(DataType.STRING(200))
    rmk: number;

    @Column({
        type: DataType.STRING(4),
        field: "tax_item_prefix",
    })
    taxItemPrefix: string;

    @Column({
        type: DataType.STRING(3),
        field: "tax_item_code",
    })
    taxItemCode: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => AccountItem, "catalogL0")
    catalogL0Data: AccountItem;

    @BelongsTo(() => AccountItem, "catalogL1")
    catalogL1Data: AccountItem;

    @BelongsTo(() => AccountItem, "catalogL2")
    catalogL2Data: AccountItem;

    @BelongsTo(() => AccountItem, "catalogL3")
    catalogL3Data: AccountItem;

    @HasMany(() => AccountItemI18n)
    AccountItemI18n: AccountItemI18n[];
}

export default AccountItem;
