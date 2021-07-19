import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    AllowNull,
    BelongsTo,
} from "sequelize-typescript";

import AccountItem from "./AccountItem.model";

@Table({
    tableName: "accountitems_setting",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class AccountItemSetting extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.STRING(50),
        field: "acc_tag",
    })
    tag: string;

    @AllowNull(false)
    @ForeignKey(() => AccountItem)
    @Column({
        type: DataType.INTEGER,
        field: "acc_item",
    })
    accItem: number;

    @Column(DataType.JSON)
    conds: string;

    @Column(DataType.TEXT)
    rmk: string;

    @Column({
        type: DataType.INTEGER,
        field: "updated_user",
    })
    updatedUser: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => AccountItem)
    AccountItem: AccountItem;
}

export default AccountItemSetting;
